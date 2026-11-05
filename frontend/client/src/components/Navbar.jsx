import React from "react";
import { MessageSquare, FileText, FlaskConical, Database, Radio } from "lucide-react";

export const Navbar = ({ activeTab, setActiveTab, healthInfo }) => {
  const isHealthy = healthInfo?.success;
  const isDemo = healthInfo?.status?.aiProvider?.includes("Demo");

  return (
    <header style={{
      background: "rgba(17, 24, 39, 0.9)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #1e293b",
      padding: "0 24px",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 50
    }}>
      {/* Brand Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.35)"
        }}>
          <Database size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
              DocuRAG
            </span>
            <span className="badge badge-indigo" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
              RAG Triad
            </span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            Chat with Documentation Knowledge Base
          </span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          onClick={() => setActiveTab("chat")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            border: activeTab === "chat" ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid transparent",
            background: activeTab === "chat" ? "rgba(99, 102, 241, 0.15)" : "transparent",
            color: activeTab === "chat" ? "#a5b4fc" : "#94a3b8",
            fontWeight: activeTab === "chat" ? 600 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
        >
          <MessageSquare size={16} />
          Chat
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            border: activeTab === "documents" ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid transparent",
            background: activeTab === "documents" ? "rgba(99, 102, 241, 0.15)" : "transparent",
            color: activeTab === "documents" ? "#a5b4fc" : "#94a3b8",
            fontWeight: activeTab === "documents" ? 600 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
        >
          <FileText size={16} />
          Documents & Ingestion
        </button>

        <button
          onClick={() => setActiveTab("eval")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            border: activeTab === "eval" ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid transparent",
            background: activeTab === "eval" ? "rgba(99, 102, 241, 0.15)" : "transparent",
            color: activeTab === "eval" ? "#a5b4fc" : "#94a3b8",
            fontWeight: activeTab === "eval" ? 600 : 500,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
        >
          <FlaskConical size={16} />
          RAG Triad Eval Suite
        </button>
      </nav>

      {/* Backend Status Telemetry */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "#1e293b",
          padding: "5px 12px",
          borderRadius: "20px",
          border: "1px solid #334155",
          fontSize: "0.75rem"
        }}>
          <span style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isHealthy ? (isDemo ? "#f59e0b" : "#10b981") : "#ef4444",
            display: "inline-block"
          }} />
          <span style={{ color: "#e2e8f0" }}>
            {isHealthy ? (isDemo ? "Backend Online (Demo)" : "Gemini API Active") : "Backend Offline"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

