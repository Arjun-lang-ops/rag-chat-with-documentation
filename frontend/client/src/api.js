// Client for connecting to the Express RAG backend
const API_BASE = "";

export const api = {
  // System Health
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error(`Health check returned ${res.status}`);
    return res.json();
  },

  // Document Management
  listDocuments: async () => {
    const res = await fetch(`${API_BASE}/api/documents`);
    if (!res.ok) throw new Error(`Failed to list documents (${res.status})`);
    return res.json();
  },

  uploadPDF: async (file) => {
    const formData = new FormData();
    formData.append("document", file);
    const res = await fetch(`${API_BASE}/api/documents/upload`, {
      method: "POST",
      body: formData
    });
    return res.json();
  },

  deleteDocument: async (sourceName) => {
    const res = await fetch(`${API_BASE}/api/documents/${encodeURIComponent(sourceName)}`, {
      method: "DELETE"
    });
    return res.json();
  },

  getDocumentChunks: async (sourceName) => {
    const res = await fetch(`${API_BASE}/api/documents/${encodeURIComponent(sourceName)}/chunks`);
    return res.json();
  },

  getDocumentStats: async () => {
    const res = await fetch(`${API_BASE}/api/documents/stats`);
    return res.json();
  },

  // Chat & Retrieval
  askQuestion: async (question, options = {}) => {
    const res = await fetch(`${API_BASE}/api/chat/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        source: options.source || undefined,
        threshold: typeof options.threshold === "number" ? options.threshold : 0.65,
        limit: options.limit || 5
      })
    });
    return res.json();
  },

  // Automated RAG Triad Evaluation
  runEvalBenchmark: async (options = {}) => {
    const res = await fetch(`${API_BASE}/api/eval/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        useLivePipeline: !!options.useLivePipeline,
        threshold: options.threshold || 0.70
      })
    });
    return res.json();
  },

  getLatestEvalReport: async () => {
    const res = await fetch(`${API_BASE}/api/eval/latest`);
    return res.json();
  },

  evaluateSingle: async (payload) => {
    const res = await fetch(`${API_BASE}/api/eval/evaluate-single`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  getBenchmarkCases: async () => {
    const res = await fetch(`${API_BASE}/api/eval/benchmark-cases`);
    return res.json();
  }
};

export default api;

