import React, { useState } from "react";
import { X, FileText, Check, Copy } from "lucide-react";

export const SourceInspectorModal = ({ source, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!source) return null;

  const textToCopy = source.snippet || source.text || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(99, 102, 241, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <FileText size={18} color="#a5b4fc" />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Source Attribution Inspector</h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Retrieved Context & Grounding Evidence
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginBottom: "16px"
          }}>
            <div style={{
              background: "var(--bg-primary)",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)"
            }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>DOCUMENT</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, wordBreak: "break-all" }}>
                {source.source || "Document"}
              </span>
            </div>

            <div style={{
              background: "var(--bg-primary)",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)"
            }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>PAGE</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                Page {source.page || 1}
              </span>
            </div>

            <div style={{
              background: "var(--bg-primary)",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)"
            }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>RELEVANCE SCORE</span>
              <span style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: source.score >= 0.75 ? "var(--success)" : "var(--warning)"
              }}>
                {source.score != null ? `${Math.round(source.score * 100)}%` : "N/A"}
              </span>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                Retrieved Chunk Passage
              </label>

              <button
                className="btn btn-secondary"
                style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                onClick={handleCopy}
              >
                {copied ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              padding: "14px",
              fontSize: "0.85rem",
              lineHeight: 1.6,
              color: "#e2e8f0",
              fontFamily: "var(--font-mono)",
              whiteSpace: "pre-wrap",
              maxHeight: "300px",
              overflowY: "auto"
            }}>
              {textToCopy || "No passage snippet available."}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "flex-end"
        }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SourceInspectorModal;

