// server/index.js
// Main entry point for MEDIKIOSK Backend Server (SIH 26047)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initStore } from "./services/dataStore.js";

// Routes
import authRoutes from "./routes/auth.js";
import patientRoutes from "./routes/patients.js";
import consultationRoutes from "./routes/consultations.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize file database
initStore();

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "MEDIKIOSK Clinical Intake API",
    problemStatement: "SIH-26047 Patient Case-Taking Software",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    supportedLanguages: ["en-IN", "kn-IN"]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "An unexpected error occurred in the clinical engine."
  });
});

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🏥 MEDIKIOSK Clinical Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`✨ SIH 26047 - CureCoders Solution Ready`);
    console.log(`======================================================\n`);
  });
}

export default app;
