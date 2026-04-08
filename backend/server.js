const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Verify email configuration on startup
if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
  console.warn("[Server] ⚠️ Warning: Email configuration incomplete");
  console.warn("[Server] MAIL_USER:", process.env.MAIL_USER ? "✓ Set" : "✗ Missing");
  console.warn("[Server] MAIL_PASS:", process.env.MAIL_PASS ? "✓ Set" : "✗ Missing");
} else {
  console.log("[Server] ✓ Email configuration verified");
}

const authRoutes = require("./routes/auth");
const businessProfileRoutes = require("./routes/businessProfile");
const dashboardRoutes = require("./routes/dasboard");
const evidenceRoutes = require("./routes/evidence");
const aiCopilotRoutes = require("./routes/aiCopilot");
const documentRoutes = require("./routes/documentRoutes");
const activityRoutes = require("./routes/activityRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { startReminderJob } = require("./jobs/reminderJob");

const app = express();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      console.log("CORS blocked:", origin);
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const mongoUri =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/compliance_db";

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("✓ MongoDB connected successfully");
    startReminderJob();
  })
  .catch((err) => {
    console.error("✗ MongoDB connection error:", err.message);
    process.exit(1);
  });

app.use("/auth", authRoutes);
app.use("/business-profile", businessProfileRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/evidence", evidenceRoutes);
app.use("/ai", aiCopilotRoutes);
app.use("/documents", documentRoutes);
app.use("/activity", activityRoutes);
app.use("/admin", adminRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("[Error]", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
});