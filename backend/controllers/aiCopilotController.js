const { generateResponse } = require("../services/aiCopilotService");
const { analyzeDocument } = require("../services/documentAnalyzer");
const fs = require("fs");

async function handleChat(req, res) {
  try {
    const { question } = req.body;
    const organisationId = req.organizationId;
    const file = req.file;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    let fileText = null;

    if (file) {
      fileText = await analyzeDocument(file.path);
      
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error("Error deleting temp file:", err);
      }
    }

    const response = await generateResponse(organisationId, question, fileText);

    res.json(response);
  } catch (error) {
    console.error("Chat controller error:", error);
    res.status(500).json({ 
      message: "Error processing request",
      answer: "An error occurred. Please try again.",
      suggestedActions: [],
      referencedAreas: []
    });
  }
}

module.exports = { handleChat };
