const { buildContext } = require("./contextBuilder");
const { HfInference } = require("@huggingface/inference");

async function generateResponse(organisationId, question, fileText = null) {
  try {
    const context = await buildContext(organisationId);
    
    if (!context) {
      return {
        answer: "Unable to retrieve company context. Please ensure your business profile is complete.",
        suggestedActions: [],
        referencedAreas: []
      };
    }

    const { systemPrompt, userPrompt } = fileText 
      ? buildDocumentAnalysisPrompt(context, question, fileText)
      : buildStandardPrompt(context, question);

    const answer = await callLLM(systemPrompt, userPrompt);
    
    const suggestedActions = extractActions(answer, context);
    const referencedAreas = extractReferences(answer, context);

    return {
      answer,
      suggestedActions,
      referencedAreas
    };
  } catch (error) {
    console.error("AI Copilot error:", error);
    return {
      answer: "I encountered an error processing your request. Please try again.",
      suggestedActions: [],
      referencedAreas: []
    };
  }
}

function buildDocumentAnalysisPrompt(context, question, fileText) {
  const systemPrompt = `You are a compliance document analyzer. Analyze the document content provided and give specific details from it.`;

  const docPreview = fileText.substring(0, 2500);
  
  const userPrompt = `Company Industry: ${context.companySummary?.industry || "Unknown"}
Countries: ${context.companySummary?.countries?.join(", ") || "Unknown"}
Compliance Areas: ${context.applicableDomains.slice(0, 3).join(", ")}

Pending Tasks:
${context.topPendingTasks.slice(0, 3).map(t => `- ${t.title}`).join("\n")}

=== DOCUMENT CONTENT ===
${docPreview}
=== END DOCUMENT ===

User asks: ${question}

Analyze the document above and answer:

1. SUMMARY: What type of document is this? What does it contain?

2. RELEVANCE: Is this relevant to a ${context.companySummary?.industry || "company"} operating in ${context.companySummary?.countries?.join(", ") || "these countries"}? Answer YES or NO and explain why based on the document content.

3. COMPLIANCE: Which of these areas does it relate to: ${context.applicableDomains.slice(0, 3).join(", ")}?

4. EVIDENCE: Can this document be used as evidence for any of these tasks: ${context.topPendingTasks.slice(0, 3).map(t => t.title).join(", ")}?

5. RECOMMENDATION: What should the company do with this document?`;

  return { systemPrompt, userPrompt };
}

function buildStandardPrompt(context, question) {
  const systemPrompt = `You are a compliance copilot assistant for a specific company. Answer questions using the company context provided. Provide practical, actionable compliance guidance.`;

  const userPrompt = `COMPANY PROFILE:
- Legal Name: ${context.companySummary?.legalName || "Not specified"}
- Industry: ${context.companySummary?.industry || "Not specified"}
- Entity Type: ${context.companySummary?.entityType || "Not specified"}
- Employee Range: ${context.companySummary?.employeeRange || "Not specified"}
- Operating Countries: ${context.companySummary?.countries?.join(", ") || "Not specified"}
- Data Types Handled: ${context.companySummary?.dataTypes?.join(", ") || "None specified"}

COMPLIANCE STATUS:
- Overdue Tasks: ${context.riskHighlights.overdue}
- Due Soon (7 days): ${context.riskHighlights.dueSoon}
- Total Pending: ${context.riskHighlights.totalPending}
- Evidence Coverage: ${context.evidenceCoverage}%

APPLICABLE DOMAINS:
${context.applicableDomains.join(", ")}

TOP PENDING TASKS:
${context.topPendingTasks.map(t => `- ${t.title} (${t.category}, Due: ${new Date(t.dueDate).toLocaleDateString()})`).join("\n")}

${context.overdueTasks.length > 0 ? `OVERDUE TASKS:\n${context.overdueTasks.map(t => `- ${t.title} (Due: ${new Date(t.dueDate).toLocaleDateString()})`).join("\n")}` : ""}

QUESTION: ${question}`;

  return { systemPrompt, userPrompt };
}

async function callLLM(systemPrompt, userPrompt) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    return "AI service is not configured. Please contact your administrator.";
  }

  // Retry logic for better reliability
  const maxRetries = 2;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Calling HF API (attempt ${attempt + 1}/${maxRetries})`);
      
      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 1200,
          temperature: 0.3,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HF API returned status ${response.status}:`, errorText);
        
        if (response.status === 429) {
          // Rate limited - wait and retry
          if (attempt < maxRetries - 1) {
            console.log("Rate limited, waiting 3 seconds before retry...");
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
          }
          return "AI service is currently rate limited. Please try again in a moment.";
        }
        
        if (response.status === 503) {
          // Model loading - wait and retry
          if (attempt < maxRetries - 1) {
            console.log("Model loading, waiting 5 seconds before retry...");
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue;
          }
          return "AI model is currently loading. Please try again in 20 seconds.";
        }
        
        lastError = errorText;
        continue;
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || "";
      console.log("HF API response received, length:", aiResponse.length);

      if (aiResponse && aiResponse.length > 50) {
        return aiResponse.trim();
      }

      if (data.error) {
        console.error("HF API error:", data.error);
        lastError = data.error;
        continue;
      }

      // Response too short, retry
      if (attempt < maxRetries - 1) {
        console.log("Response too short, retrying...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

    } catch (error) {
      console.error(`Hugging Face error (attempt ${attempt + 1}):`, error);
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
    }
  }

  return "AI service temporarily unavailable after multiple attempts. Please try again.";
}

function extractActions(answer, context) {
  const actions = [];
  
  if (context.riskHighlights.overdue > 0) {
    actions.push("Review and address overdue tasks immediately");
  }
  
  if (context.riskHighlights.dueSoon > 3) {
    actions.push("Prioritize tasks due within the next 7 days");
  }
  
  if (context.evidenceCoverage < 50) {
    actions.push("Upload evidence for pending compliance tasks");
  }

  const actionKeywords = ["should", "must", "need to", "recommend", "consider", "ensure"];
  const sentences = answer.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    if (actionKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      const cleaned = sentence.trim();
      if (cleaned.length > 10 && cleaned.length < 150) {
        actions.push(cleaned);
      }
    }
  });

  return actions.slice(0, 5);
}

function extractReferences(answer, context) {
  const references = new Set();
  
  context.applicableDomains.forEach(domain => {
    if (answer.toLowerCase().includes(domain.toLowerCase())) {
      references.add(domain);
    }
  });

  context.topPendingTasks.forEach(task => {
    const titleWords = task.title.toLowerCase().split(" ");
    if (titleWords.some(word => word.length > 4 && answer.toLowerCase().includes(word))) {
      references.add(task.category);
    }
  });

  return Array.from(references).slice(0, 5);
}

module.exports = { generateResponse };
