import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Layers,
  Database,
  ExternalLink
} from "lucide-react";
import api from "../api.js";

export const DocumentManager = ({ onSelectSourceForChat }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedDocChunks, setSelectedDocChunks] = useState(null);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.listDocuments();
      if (res.success) {
        setDocuments(res.documents || []);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadStatus({
        type: "error",
        message: "Only PDF documents are supported."
      });
      return;
    }

    setUploading(true);
    setUploadStatus({
      type: "info",
      message: `Ingesting "${file.name}"... Parsing pages, cleaning text, and generating 768-dim embeddings.`
    });

    try {
      const res = await api.uploadPDF(file);
      if (res.success) {
        setUploadStatus({
          type: "success",
          message: `Ingested "${file.name}" successfully! (${res.result?.totalPages || 1} pages, ${res.result?.totalChunks || 0} chunks indexed)`
        });
        fetchDocuments();
      } else {
        setUploadStatus({ type: "error", message: res.message || "Failed to ingest document." });
      }
    } catch (err) {
      setUploadStatus({ type: "error", message: `Upload error: ${err.message}` });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (sourceName) => {
    if (!window.confirm(`Are you sure you want to delete "${sourceName}" and all its vector chunks?`)) {
      return;
    }
    try {
      const res = await api.deleteDocument(sourceName);
      if (res.success) {
        setDocuments(documents.filter((d) => d.source !== sourceName));
        if (selectedDocChunks?.source === sourceName) {
          setSelectedDocChunks(null);
        }
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleInspectChunks = async (sourceName) => {
    setLoadingChunks(true);
    try {
      const res = await api.getDocumentChunks(sourceName);
      if (res.success) {
        setSelectedDocChunks({
          source: sourceName,
          chunks: res.chunks || []
        });
      }
    } catch (err) {
      alert(`Could not fetch chunks: ${err.message}`);
    } finally {
      setLoadingChunks(false);
    }
  };

  const totalChunks = documents.reduce((sum, d) => sum + (d.chunkCount || 0), 0);

  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "calc(100vh - 64px)" }}>
      {/* Page Title */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Document Knowledge Base
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          Ingest PDFs, inspect text chunking parameters, and manage vector indices for LangChain retrieval.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "28px"
      }}>
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          padding: "16px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Indexed Documents</span>
            <FileText size={18} color="#a5b4fc" />
          </div>
          <span style={{ fontSize: "1.75rem", fontWeight: 700 }}>{documents.length}</span>
        </div>

        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          padding: "16px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Total Chunks</span>
            <Layers size={18} color="#34d399" />
          </div>
          <span style={{ fontSize: "1.75rem", fontWeight: 700 }}>{totalChunks}</span>
        </div>

        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          padding: "16px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Chunk Config</span>
            <Database size={18} color="#fbbf24" />
          </div>
          <span style={{ fontSize: "1.05rem", fontWeight: 600 }}>1000 chars / 200 overlap</span>
        </div>

        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          padding: "16px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Upload Limit</span>
            <UploadCloud size={18} color="#60a5fa" />
          </div>
          <span style={{ fontSize: "1.75rem", fontWeight: 700 }}>20 MB</span>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files?.[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
        style={{
          border: isDragOver ? "2px dashed var(--accent-primary)" : "2px dashed var(--border-color)",
          borderRadius: "12px",
          padding: "36px 20px",
          textAlign: "center",
          background: isDragOver ? "rgba(99, 102, 241, 0.08)" : "var(--bg-card)",
          transition: "all 0.2s ease",
          marginBottom: "28px",
          cursor: "pointer"
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          background: "rgba(99, 102, 241, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px auto"
        }}>
          <UploadCloud size={28} color="#818cf8" />
        </div>

        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "6px" }}>
          {uploading ? "Ingesting PDF..." : "Drop PDF documentation here, or browse"}
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
          Files are automatically cleaned, chunked into 1,000-character segments, embedded, and indexed for vector search.
        </p>

        <button
          className="btn btn-primary"
          disabled={uploading}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          {uploading ? "Processing..." : "Select PDF Document"}
        </button>
      </div>

      {/* Upload Notification Banner */}
      {uploadStatus && (
        <div style={{
          marginBottom: "24px",
          padding: "14px 18px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background:
            uploadStatus.type === "success"
              ? "rgba(16, 185, 129, 0.15)"
              : uploadStatus.type === "error"
              ? "rgba(239, 68, 68, 0.15)"
              : "rgba(99, 102, 241, 0.15)",
          border:
            uploadStatus.type === "success"
              ? "1px solid rgba(16, 185, 129, 0.3)"
              : uploadStatus.type === "error"
              ? "1px solid rgba(239, 68, 68, 0.3)"
              : "1px solid rgba(99, 102, 241, 0.3)",
          color:
            uploadStatus.type === "success"
              ? "#34d399"
              : uploadStatus.type === "error"
              ? "#f87171"
              : "#a5b4fc",
          fontSize: "0.875rem"
        }}>
          {uploadStatus.type === "success" ? (
            <CheckCircle size={18} />
          ) : uploadStatus.type === "error" ? (
            <AlertCircle size={18} />
          ) : (
            <RefreshCw size={18} className="animate-spin" />
          )}
          <span>{uploadStatus.message}</span>
        </div>
      )}

      {/* Ingested Documents List */}
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
            <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Active Knowledge Base Documents</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {documents.length} document{documents.length === 1 ? "" : "s"} indexed in database
            </span>
          </div>
          <button className="btn btn-secondary" onClick={fetchDocuments} disabled={loading} style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {documents.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <FileText size={40} style={{ margin: "0 auto 12px auto", opacity: 0.4 }} />
            <p style={{ fontSize: "0.9rem" }}>No documentation uploaded yet.</p>
            <span style={{ fontSize: "0.8rem" }}>Upload a PDF above to begin chatting and evaluating.</span>
          </div>
        ) : (
          <div>
            {documents.map((doc, idx) => (
              <div
                key={doc.source}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 20px",
                  borderBottom: idx === documents.length - 1 ? "none" : "1px solid var(--border-subtle)",
                  transition: "background 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(99, 102, 241, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <FileText size={18} color="#818cf8" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {doc.source}
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      <span>{doc.chunkCount} chunks</span>
                      <span>•</span>
                      <span>{doc.totalPages || "1"} pages</span>
                      {doc.lastUpdated && (
                        <>
                          <span>•</span>
                          <span>Indexed {new Date(doc.lastUpdated).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {onSelectSourceForChat && (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                      onClick={() => onSelectSourceForChat(doc.source)}
                    >
                      Chat with this doc
                    </button>
                  )}

                  <button
                    className="btn btn-secondary"
                    style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                    onClick={() => handleInspectChunks(doc.source)}
                  >
                    <Eye size={14} />
                    Inspect Chunks
                  </button>

                  <button
                    className="btn btn-danger"
                    style={{ padding: "6px 10px" }}
                    onClick={() => handleDelete(doc.source)}
                    title="Delete document and chunks"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspect Chunks Modal */}
      {selectedDocChunks && (
        <div className="modal-overlay" onClick={() => setSelectedDocChunks(null)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: "800px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Chunks for "{selectedDocChunks.source}"</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Showing {selectedDocChunks.chunks.length} extracted and embedded chunks
                </span>
              </div>
              <button
                onClick={() => setSelectedDocChunks(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px", overflowY: "auto", maxHeight: "65vh" }}>
              {selectedDocChunks.chunks.map((chunk, i) => (
                <div
                  key={chunk._id || i}
                  style={{
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    marginBottom: "12px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.75rem" }}>
                    <span className="badge badge-indigo">Chunk #{i + 1}</span>
                    <span style={{ color: "var(--text-muted)" }}>Page {chunk.metadata?.page || 1}</span>
                  </div>
                  <p style={{
                    fontSize: "0.85rem",
                    color: "#e2e8f0",
                    fontFamily: "var(--font-mono)",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap"
                  }}>
                    {chunk.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;

