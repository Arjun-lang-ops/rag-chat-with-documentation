import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  ExternalLink,
  Sliders,
  Trash2,
  FileText,
  ShieldCheck
} from "lucide-react";
import api from "../api.js";

export const ChatInterface = ({
  onInspectSource,
  onInspectTriad,
  activeSourceFilter,
  setActiveSourceFilter
}) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your Documentation Assistant powered by LangChain and Google Gemini. Ask me any question about your ingested documentation. All answers cite verified sources and can be evaluated against the RAG Triad.",
      sources: []
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [threshold, setThreshold] = useState(0.65);
  const [showFilters, setShowFilters] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    api.listDocuments().then((res) => {
      if (res.success) setDocuments(res.documents || []);
    }).catch(() => {});
  }, []);

  const handleSend = async (e) => {
    e?.preventDefault();
    const query = inputQuery.trim();
    if (!query || loading) return;

    // Append user message
    const userMsg = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      const res = await api.askQuestion(query, {
        source: activeSourceFilter || undefined,
        threshold
      });

      // Accept response if it has an answer field, regardless of success flag
      if (res.answer !== undefined) {
        const assistantMsg = {
          role: "assistant",
          content: res.answer,
          sources: res.sources || [],
          retrievedCount: res.retrievedCount,
          topScore: res.topScore,
          query
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${res.message || "Failed to process query. Check that your GOOGLE_API_KEY is valid and backend is running."}`,
            isError: true
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Network / server error: ${err.message}`,
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "What is the maximum file upload size allowed?",
    "Which embedding model is used for document vectorization?",
    "How does the system prevent prompt injection in retrieved contexts?",
    "Explain the text chunking and overlap parameters."
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", background: "var(--bg-primary)" }}>
      {/* Top Controls Bar */}
      <div style={{
        padding: "12px 24px",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            Knowledge Scope:
          </span>
          <select
            value={activeSourceFilter || ""}
            onChange={(e) => setActiveSourceFilter(e.target.value || null)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              background: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              fontSize: "0.8rem"
            }}
          >
            <option value="">All Uploaded Documents ({documents.length})</option>
            {documents.map((d) => (
              <option key={d.source} value={d.source}>
                {d.source} ({d.chunkCount} chunks)
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
            style={{ padding: "6px 12px", fontSize: "0.75rem" }}
          >
            <Sliders size={14} />
            Retrieval Threshold: {Math.round(threshold * 100)}%
          </button>

          <button
            onClick={() => setMessages([messages[0]])}
            className="btn btn-secondary"
            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
            title="Clear Chat History"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Threshold filter expander */}
      {showFilters && (
        <div style={{
          padding: "12px 24px",
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontSize: "0.85rem"
        }}>
          <span>Minimum Cosine Relevance Threshold:</span>
          <input
            type="range"
            min="0.4"
            max="0.9"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            style={{ width: "160px" }}
          />
          <span style={{ fontWeight: 600, color: "var(--accent-primary)" }}>{threshold}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            (Higher = stricter relevance filter; Lower = more permissive chunk recall)
          </span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="animate-fade-in"
            style={{
              display: "flex",
              gap: "14px",
              maxWidth: "850px",
              margin: msg.role === "user" ? "0 0 0 auto" : "0 auto 0 0",
              width: "100%"
            }}
          >
            {/* Avatar */}
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: msg.role === "user" ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "rgba(99, 102, 241, 0.15)",
              border: msg.role === "user" ? "none" : "1px solid rgba(99, 102, 241, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              {msg.role === "user" ? <User size={18} color="#fff" /> : <Bot size={18} color="#818cf8" />}
            </div>

            {/* Bubble */}
            <div style={{ flex: 1 }}>
              <div style={{
                background: msg.role === "user" ? "#4f46e5" : "var(--bg-card)",
                border: msg.role === "user" ? "none" : "1px solid var(--border-color)",
                borderRadius: "12px",
                padding: "16px 20px",
                color: "var(--text-primary)",
                fontSize: "0.925rem",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap"
              }}>
                {msg.content}
              </div>

              {/* Source Attribution Badges */}
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <ShieldCheck size={14} color="#34d399" />
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#34d399", letterSpacing: "0.03em" }}>
                      VERIFIED SOURCE ATTRIBUTIONS ({msg.sources.length})
                    </span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {msg.sources.map((src, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => onInspectSource(src)}
                        style={{
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.75rem",
                          color: "#d1d5db",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
                      >
                        <FileText size={12} color="#818cf8" />
                        <span style={{ fontWeight: 500 }}>{src.source}</span>
                        <span style={{ color: "var(--text-muted)" }}>• p. {src.page}</span>
                        {src.score != null && (
                          <span style={{ color: "#34d399", fontWeight: 600 }}>
                            {Math.round(src.score * 100)}%
                          </span>
                        )}
                        <ExternalLink size={11} color="var(--text-muted)" />
                      </button>
                    ))}

                    {/* Quick RAG Triad Evaluator Trigger */}
                    {onInspectTriad && (
                      <button
                        onClick={() => onInspectTriad({
                          query: msg.query,
                          context: msg.sources.map((s) => s.snippet).join("\n"),
                          answer: msg.content
                        })}
                        style={{
                          background: "rgba(99, 102, 241, 0.15)",
                          border: "1px solid rgba(99, 102, 241, 0.3)",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.75rem",
                          color: "#a5b4fc",
                          cursor: "pointer"
                        }}
                      >
                        <Sparkles size={12} />
                        Inspect RAG Triad
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: "14px", maxWidth: "850px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(99, 102, 241, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Bot size={18} color="#818cf8" />
            </div>
            <div style={{
              background: "var(--bg-card)",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--text-secondary)",
              fontSize: "0.875rem"
            }}>
              <span className="animate-spin">⚙️</span>
              <span>Retrieving relevant chunks & synthesizing grounded answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Queries Prompt Pills */}
      {messages.length <= 1 && (
        <div style={{ padding: "0 24px 12px 24px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px" }}>
            Suggested Queries:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setInputQuery(q)}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "20px",
                  padding: "6px 14px",
                  fontSize: "0.8rem",
                  color: "#d1d5db",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        style={{
          padding: "16px 24px",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          gap: "12px",
          alignItems: "center"
        }}
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question about your uploaded documentation..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: "10px",
            background: "var(--bg-primary)",
            border: "1px solid var(--border-color)",
            color: "var(--text-primary)",
            fontSize: "0.925rem",
            outline: "none"
          }}
          onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
        />

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !inputQuery.trim()}
          style={{ height: "48px", padding: "0 20px" }}
        >
          <Send size={16} />
          Ask
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;

