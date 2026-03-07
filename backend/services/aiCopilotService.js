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
  const systemPrompt = `You are a compliance copilot assistant. When a document is provided, analyze it first and relate findings to the organization's compliance needs.

Provide your response in this structure:
1. Document Summary: Brief overview of the document
2. Relevance Assessment: How it relates to the company
3. Compliance Implications: Applicable areas
4. Evidence Potential: Which tasks it could support
5. Recommendations: Actionable next steps`;

  const contextSummary = `COMPANY CONTEXT:
- Legal Name: ${context.companySummary?.legalName || "Not specified"}
- Industry: ${context.companySummary?.industry || "Not specified"}
- Operating Countries: ${context.companySummary?.countries?.join(", ") || "Not specified"}
- Data Types: ${context.companySummary?.dataTypes?.join(", ") || "None"}
- Overdue Tasks: ${context.riskHighlights.overdue}
- Due Soon: ${context.riskHighlights.dueSoon}
- Applicable Domains: ${context.applicableDomains.join(", ")}

PENDING TASKS:
${context.topPendingTasks.map(t => `- ${t.title} (${t.category})`).join("\n")}`;

  const userPrompt = `${contextSummary}

DOCUMENT CONTENT:
${fileText}

USER QUESTION:
${question}

INSTRUCTIONS:
- Summarize the document purpose
- Evaluate relevance to the company
- Identify applicable compliance areas
- Suggest if it can be used as task evidence
- Highlight risks or missing sections
- Provide actionable recommendations`;

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

  try {
    const hf = new HfInference(apiKey);
    
    const response = await hf.chatCompletion({
      model: "meta-llama/Llama-3.2-3B-Instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 800,
      temperature: 0.3
    });
    
    if (response.choices && response.choices[0]?.message?.content) {
      return response.choices[0].message.content.trim();
    }
    
    return "Unable to generate response. Please try again.";
  } catch (error) {
    console.error("Hugging Face SDK error:", error);
    return "Error connecting to AI service. Please try again.";
  }
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
