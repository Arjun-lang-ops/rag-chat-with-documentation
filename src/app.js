import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

import documentRoutes from "./routes/documentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

// CORS — allow both dev ports
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";
  const hasApiKey = !!process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== "your_google_api_key";

  res.json({
    success: true,
    message: "RAG API is running",
    timestamp: new Date().toISOString(),
    status: {
      database: dbStatus,
      aiProvider: hasApiKey ? "Google Gemini (Active)" : "No API Key Set",
      llmModel: process.env.LLM_MODEL || "gemini-2.5-flash",
      embeddingModel: process.env.EMBEDDING_MODEL || "gemini-embedding-001"
    }
  });
});

// Global error handler — must be last
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  if (process.env.NODE_ENV !== "production") console.error(err.stack);
  
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

export default app;
