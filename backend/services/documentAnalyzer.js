const fs = require("fs");
const path = require("path");

async function analyzeDocument(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    let text = "";

    if (ext === ".txt") {
      text = fs.readFileSync(filePath, "utf-8");
    } else if (ext === ".pdf") {
      const pdf = require("pdf-parse");
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (ext === ".docx") {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      text = fs.readFileSync(filePath, "utf-8");
    }

    const maxLength = 8000;
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + "\n\n[Document truncated for analysis]";
    }

    return text.trim();
  } catch (error) {
    console.error("Document analyzer error:", error);
    return null;
  }
}

module.exports = { analyzeDocument };
