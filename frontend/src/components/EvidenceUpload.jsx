import { useState } from "react";
import API_URL from "../config";
import "./styles/evidenceUpload.css";

function EvidenceUpload({ taskId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!taskId) {
      setError("Task ID is required");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("taskId", taskId);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/evidence/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Evidence uploaded successfully!");
        setFile(null);
        if (onUploadSuccess) {
          onUploadSuccess(data.evidence);
        }
      } else {
        setError(data.message || "Upload failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="evidence-upload-container">
      <h3>Upload Evidence</h3>
      <form onSubmit={handleSubmit} className="evidence-form">
        <div className="form-group">
          <label htmlFor="file">Select File (PDF, DOC, DOCX, PNG, JPG - Max 10MB)</label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            disabled={uploading}
          />
          {file && <p className="file-name">Selected: {file.name}</p>}
        </div>

        <button type="submit" disabled={uploading || !file} className="btn-upload">
          {uploading ? "Uploading..." : "Upload Evidence"}
        </button>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}

export default EvidenceUpload;
