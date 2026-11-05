import React, { useState } from "react";
import { X, Play, Sparkles } from "lucide-react";
import api from "../api.js";

export const SingleEvalModal = ({ onClose, initialData = null }) => {
  const [query, setQuery] = useState(initialData?.query || "");
  const [context, setContext] = useState(initialData?.context || "");
  const [answer, setAnswer] = useState(initialData?.answer || "");
  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [error, setError] = useState(null);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.evaluateSingle({
        query: query.trim(),
        contextChunks: context.trim() ? [context.trim()] : [],
        answer: answer.trim(),
        threshold: 0.70
      });

      if (res.success) {
        setEvalResult(res.result);
      } else {
        setError(res.message || "Failed to evaluate RAG Triad");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score) => {
    const pct = Math.round(score * 100);
    if (score >= 0.75) return <span className="badge badge-success">{pct}%</span>;
    if (score >= 0.50) return <span className="badge badge-warning">{pct}%</span>;
    return <span className="badge badge-danger">{pct}%</span>;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        style={{ maxWidth: "750px" }}
        onClick={(e) => e.stopPropagation()}
      >
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
              <Sparkles size={18} color="#a5b4fc" />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>RAG Triad Sandbox Evaluator</h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Test any Query, Context, and Answer against the RAG Triad
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          <form onSubmit={handleEvaluate}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                USER QUERY / QUESTION *
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. What is the maximum document upload size?"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem"
                }}
                required
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                RETRIEVED CONTEXT CHUNK(S)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Paste the retrieved documentation excerpt here..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-mono)"
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                GENERATED LLM ANSWER
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Paste the generated response to verify for hallucination & relevance..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "0.75rem", padding: "6px 12px" }}
                onClick={() => {
                  setQuery("What is the maximum upload limit?");
                  setContext("Document Ingestion Service: Files uploaded via the API are subject to a strict 20 MB size limit.");
                  setAnswer("The maximum document upload limit allowed is 20 MB.");
                }}
              >
                Load Sample Grounded Pair
              </button>

              <button type="submit" className="btn btn-primary" disabled={loading || !query.trim()}>
                <Play size={15} />
                {loading ? "Evaluating..." : "Run Triad Evaluation"}
              </button>
            </div>
          </form>

          {error && (
            <div style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: "0.85rem"
            }}>
              {error}
            </div>
          )}

          {evalResult && (
            <div style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "10px",
              background: "var(--bg-primary)",
              border: "1px solid var(--border-color)"
            }}>
              {/* Score header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>COMPOSITE RAG TRIAD SCORE</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff" }}>
                      {Math.round(evalResult.triadScore * 100)}%
                    </span>
                    <span className={evalResult.status === "PASS" ? "badge badge-success" : "badge badge-danger"}>
                      {evalResult.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Three pillars breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "14px" }}>
                <div style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>1. Context Rel.</span>
                    {getScoreBadge(evalResult.metrics.contextRelevance.score)}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {evalResult.metrics.contextRelevance.reasoning}
                  </p>
                </div>

                <div style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>2. Groundedness</span>
                    {getScoreBadge(evalResult.metrics.groundedness.score)}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {evalResult.metrics.groundedness.reasoning}
                  </p>
                </div>

                <div style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>3. Answer Rel.</span>
                    {getScoreBadge(evalResult.metrics.answerRelevance.score)}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {evalResult.metrics.answerRelevance.reasoning}
                  </p>
                </div>
              </div>

              {evalResult.recommendations?.length > 0 && (
                <div style={{ fontSize: "0.8rem", color: "#fbbf24", background: "rgba(245, 158, 11, 0.1)", padding: "8px 12px", borderRadius: "6px" }}>
                  💡 {evalResult.recommendations.join(" ")}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleEvalModal;

