import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  Play,
  Download,
  Sparkles,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import api from "../api.js";

export const RAGTriadDashboard = ({ onOpenSingleEval }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useLivePipeline, setUseLivePipeline] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [error, setError] = useState(null);

  const fetchLatestReport = async () => {
    try {
      const res = await api.getLatestEvalReport();
      if (res.success && res.report) {
        setReport(res.report);
      }
    } catch (err) {
      console.warn("Could not load latest report:", err);
    }
  };

  useEffect(() => {
    fetchLatestReport();
  }, []);

  const handleRunBenchmark = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.runEvalBenchmark({
        useLivePipeline,
        threshold: 0.70
      });
      if (res.success) {
        setReport(res.report);
      } else {
        setError(res.message || "Evaluation benchmark failed.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rag-triad-eval-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPillarColor = (score) => {
    if (score >= 0.75) return "#34d399";
    if (score >= 0.55) return "#fbbf24";
    return "#f87171";
  };

  const summary = report?.summary;
  const pillars = summary?.pillars;

  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Automated RAG Triad Evaluation Suite
            </h1>
            <span className="badge badge-indigo">TruLens Triad Standard</span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Rigorous automated benchmarking evaluating Context Relevance, Groundedness (Hallucination), and Answer Relevance.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            className="btn btn-secondary"
            onClick={onOpenSingleEval}
            style={{ fontSize: "0.85rem" }}
          >
            <Sparkles size={16} />
            Interactive Sandbox
          </button>

          {report && (
            <button
              className="btn btn-secondary"
              onClick={handleExportJSON}
              style={{ fontSize: "0.85rem" }}
              title="Export JSON Report"
            >
              <Download size={16} />
              Export
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={handleRunBenchmark}
            disabled={loading}
            style={{ fontSize: "0.85rem" }}
          >
            <Play size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Running Benchmark..." : "Run Automated Benchmark"}
          </button>
        </div>
      </div>

      {/* Mode Toggle Bar */}
      <div style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        padding: "12px 20px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem" }}>
          <span style={{ fontWeight: 600 }}>Evaluation Mode:</span>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            <input
              type="radio"
              name="evalMode"
              checked={!useLivePipeline}
              onChange={() => setUseLivePipeline(false)}
            />
            <span>Curated Benchmark Fixtures (Deterministic)</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            <input
              type="radio"
              name="evalMode"
              checked={useLivePipeline}
              onChange={() => setUseLivePipeline(true)}
            />
            <span>Live Knowledge Base Pipeline (DB Chunks)</span>
          </label>
        </div>

        {report && (
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Last Run: {new Date(report.timestamp).toLocaleTimeString()} ({report.summary?.totalDurationMs}ms)
          </span>
        )}
      </div>

      {error && (
        <div style={{
          padding: "12px 18px",
          background: "rgba(239, 68, 68, 0.15)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#f87171",
          borderRadius: "8px",
          marginBottom: "20px",
          fontSize: "0.85rem"
        }}>
          {error}
        </div>
      )}

      {/* Triad Scorecards */}
      {summary ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
          gap: "16px",
          marginBottom: "28px"
        }}>
          {/* Overall Score */}
          <div style={{
            background: "linear-gradient(135deg, rgba(30, 27, 75, 0.8), rgba(17, 24, 39, 0.9))",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase" }}>
                COMPOSITE TRIAD SCORE
              </span>
              <span className={summary.passRatePercent >= 70 ? "badge badge-success" : "badge badge-danger"}>
                {summary.passRatePercent}% PASS RATE
              </span>
            </div>
            <div style={{ margin: "14px 0" }}>
              <span style={{ fontSize: "2.75rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em" }}>
                {Math.round(summary.overallTriadScore * 100)}%
              </span>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {summary.passedCases} of {summary.totalCases} benchmark queries passed threshold (&ge; 70%)
              </p>
            </div>
            <div style={{
              width: "100%",
              height: "6px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "999px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${summary.overallTriadScore * 100}%`,
                height: "100%",
                background: getPillarColor(summary.overallTriadScore),
                borderRadius: "999px"
              }} />
            </div>
          </div>

          {/* Pillar 1: Context Relevance */}
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  1. Context Relevance
                </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: getPillarColor(pillars.avgContextRelevance) }}>
                  {Math.round(pillars.avgContextRelevance * 100)}%
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                Measures whether retrieved chunks contain information relevant to answering the query.
              </p>
            </div>
            <div style={{
              width: "100%",
              height: "6px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "999px",
              overflow: "hidden",
              marginTop: "16px"
            }}>
              <div style={{
                width: `${pillars.avgContextRelevance * 100}%`,
                height: "100%",
                background: getPillarColor(pillars.avgContextRelevance),
                borderRadius: "999px"
              }} />
            </div>
          </div>

          {/* Pillar 2: Groundedness */}
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  2. Groundedness
                </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: getPillarColor(pillars.avgGroundedness) }}>
                  {Math.round(pillars.avgGroundedness * 100)}%
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                Measures whether generated claims are directly supported by context (hallucination detection).
              </p>
            </div>
            <div style={{
              width: "100%",
              height: "6px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "999px",
              overflow: "hidden",
              marginTop: "16px"
            }}>
              <div style={{
                width: `${pillars.avgGroundedness * 100}%`,
                height: "100%",
                background: getPillarColor(pillars.avgGroundedness),
                borderRadius: "999px"
              }} />
            </div>
          </div>

          {/* Pillar 3: Answer Relevance */}
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  3. Answer Relevance
                </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: getPillarColor(pillars.avgAnswerRelevance) }}>
                  {Math.round(pillars.avgAnswerRelevance * 100)}%
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                Measures whether the generated answer directly and accurately addresses what the user asked.
              </p>
            </div>
            <div style={{
              width: "100%",
              height: "6px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "999px",
              overflow: "hidden",
              marginTop: "16px"
            }}>
              <div style={{
                width: `${pillars.avgAnswerRelevance * 100}%`,
                height: "100%",
                background: getPillarColor(pillars.avgAnswerRelevance),
                borderRadius: "999px"
              }} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "48px 20px",
          textAlign: "center",
          marginBottom: "28px"
        }}>
          <FlaskConical size={48} style={{ margin: "0 auto 16px auto", color: "#818cf8", opacity: 0.8 }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "8px" }}>
            No Evaluation Benchmark Run Yet
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: "550px", margin: "0 auto 20px auto" }}>
            Click "Run Automated Benchmark" to execute the test suite across Context Relevance, Groundedness, and Answer Relevance.
          </p>
          <button className="btn btn-primary" onClick={handleRunBenchmark} disabled={loading}>
            <Play size={16} />
            Run Automated Benchmark Now
          </button>
        </div>
      )}

      {/* Detailed Test Results Table */}
      {report?.results && (
        <div style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Benchmark Test Queries Breakdown</h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Click any row to inspect context, prompt, reasoning, and recommendations
              </span>
            </div>
          </div>

          <div>
            {report.results.map((res, idx) => {
              const isExpanded = expandedRow === idx;
              return (
                <div key={res.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <div
                    onClick={() => setExpandedRow(isExpanded ? null : idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 20px",
                      cursor: "pointer",
                      background: isExpanded ? "var(--bg-card)" : "transparent",
                      transition: "background 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                      {isExpanded ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
                      <span className={res.status === "PASS" ? "badge badge-success" : "badge badge-danger"}>
                        {res.status}
                      </span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", width: "70px" }}>
                        {res.id}
                      </span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>
                        {res.query}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ display: "flex", gap: "10px", fontSize: "0.75rem" }}>
                        <span title="Context Relevance" style={{ color: getPillarColor(res.metrics.contextRelevance.score) }}>
                          CR: {Math.round(res.metrics.contextRelevance.score * 100)}%
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>|</span>
                        <span title="Groundedness" style={{ color: getPillarColor(res.metrics.groundedness.score) }}>
                          GR: {Math.round(res.metrics.groundedness.score * 100)}%
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>|</span>
                        <span title="Answer Relevance" style={{ color: getPillarColor(res.metrics.answerRelevance.score) }}>
                          AR: {Math.round(res.metrics.answerRelevance.score * 100)}%
                        </span>
                      </div>

                      <div style={{
                        background: "var(--bg-primary)",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: getPillarColor(res.triadScore)
                      }}>
                        {Math.round(res.triadScore * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{
                      padding: "16px 20px 20px 48px",
                      background: "rgba(15, 23, 42, 0.6)",
                      borderTop: "1px solid var(--border-subtle)"
                    }}>
                      <div style={{ marginBottom: "12px" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                          Generated Answer:
                        </span>
                        <p style={{ fontSize: "0.85rem", color: "#e2e8f0", marginTop: "4px", lineHeight: 1.5 }}>
                          {res.answer}
                        </p>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "12px" }}>
                        <div style={{ background: "var(--bg-card)", padding: "10px", borderRadius: "6px" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#818cf8", display: "block" }}>
                            Context Relevance Reasoning
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            {res.metrics.contextRelevance.reasoning}
                          </span>
                        </div>

                        <div style={{ background: "var(--bg-card)", padding: "10px", borderRadius: "6px" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#34d399", display: "block" }}>
                            Groundedness Reasoning
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            {res.metrics.groundedness.reasoning}
                          </span>
                        </div>

                        <div style={{ background: "var(--bg-card)", padding: "10px", borderRadius: "6px" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#fbbf24", display: "block" }}>
                            Answer Relevance Reasoning
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            {res.metrics.answerRelevance.reasoning}
                          </span>
                        </div>
                      </div>

                      {res.recommendations?.length > 0 && (
                        <div style={{
                          padding: "8px 12px",
                          borderRadius: "6px",
                          background: "rgba(245, 158, 11, 0.1)",
                          color: "#fbbf24",
                          fontSize: "0.75rem"
                        }}>
                          💡 {res.recommendations.join(" ")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RAGTriadDashboard;

