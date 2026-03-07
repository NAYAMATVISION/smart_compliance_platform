import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import API_URL from "../config";
import "./styles/dashboard.css";

function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const suggestedQuestions = [
    "Why are these compliance tasks assigned to our company?",
    "What are our most urgent compliance obligations?",
    "Which regulations apply to our business model?",
    "How can we improve our compliance posture?"
  ];

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Only PDF, TXT, and DOCX files are allowed");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    formData.append("question", question);
    if (file) {
      formData.append("file", file);
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      setResponse(data);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Copilot error:", err);
      setError("Failed to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (q) => {
    setQuestion(q);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Compliance Copilot</h1>
        <p>Get guidance tailored to your organization's compliance obligations and risks.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div>
          <div className="metric-card" style={{ padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--text-main)" }}>
              Ask a Question
            </h3>
            <form onSubmit={handleSubmit}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Example: What are the key compliance requirements for our industry?"
                disabled={loading}
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "12px 16px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  background: "var(--bg-surface)",
                  color: "var(--text-main)",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                  marginBottom: "12px"
                }}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="btn-complete"
                style={{ width: "100%", padding: "12px" }}
              >
                {loading ? "Analyzing..." : "Get Guidance"}
              </button>
            </form>
          </div>

          <div className="metric-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "var(--text-main)" }}>
              Analyze a Document
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
              Upload policies, contracts, or reports for compliance review.
            </p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.txt,.docx,.doc"
              style={{ display: "none" }}
            />
            
            {file ? (
              <div style={{
                background: "var(--bg-page)",
                border: "1.5px solid var(--primary)",
                borderRadius: "8px",
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>
                  📎 {file.name}
                </div>
                <button
                  onClick={handleRemoveFile}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontSize: "18px",
                    padding: "0 4px"
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "var(--bg-page)",
                  border: "1.5px dashed var(--border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                📎 Choose File (PDF, TXT, DOCX)
              </button>
            )}
          </div>
        </div>

        <div className="metric-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--text-main)" }}>
            Suggested Questions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedQuestion(q)}
                disabled={loading}
                style={{
                  background: "var(--bg-page)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text-main)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  lineHeight: "1.4"
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.background = "var(--bg-surface)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.background = "var(--bg-page)";
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: "#fee2e2",
          color: "#991b1b",
          padding: "14px 20px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "600",
          marginBottom: "24px",
          border: "1px solid #fca5a5"
        }}>
          {error}
        </div>
      )}

      {response && (
        <div className="dashboard-section">
          <h2 className="section-title">Response</h2>
          
          <div className="metric-card" style={{ padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "12px" }}>
              Analysis
            </h3>
            <div className="copilot-response">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {response.answer}
              </ReactMarkdown>
            </div>
          </div>

          {response.suggestedActions && response.suggestedActions.length > 0 && (
            <div className="metric-card" style={{ padding: "24px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "12px" }}>
                Suggested Actions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {response.suggestedActions.map((action, i) => (
                  <div key={i} style={{
                    padding: "12px 16px",
                    background: "var(--bg-page)",
                    border: "1.5px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: "var(--text-main)",
                    display: "flex",
                    gap: "10px"
                  }}>
                    <span style={{ color: "#10b981", fontWeight: "700", fontSize: "16px" }}>•</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {response.referencedAreas && response.referencedAreas.length > 0 && (
            <div className="metric-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "12px" }}>
                Relevant Compliance Areas
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {response.referencedAreas.map((area, i) => (
                  <span key={i} style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    padding: "6px 14px",
                    background: "var(--primary)",
                    color: "var(--text-main)",
                    borderRadius: "6px",
                    border: "1px solid var(--border)"
                  }}>
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIAssistant;
