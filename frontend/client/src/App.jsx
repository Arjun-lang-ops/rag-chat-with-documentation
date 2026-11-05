import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import ChatInterface from "./components/ChatInterface.jsx";
import DocumentManager from "./components/DocumentManager.jsx";
import RAGTriadDashboard from "./components/RAGTriadDashboard.jsx";
import SourceInspectorModal from "./components/SourceInspectorModal.jsx";
import SingleEvalModal from "./components/SingleEvalModal.jsx";
import api from "./api.js";

export function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [healthInfo, setHealthInfo] = useState(null);
  const [activeSourceFilter, setActiveSourceFilter] = useState(null);
  const [inspectingSource, setInspectingSource] = useState(null);
  const [singleEvalData, setSingleEvalData] = useState(null);
  const [isSingleEvalOpen, setIsSingleEvalOpen] = useState(false);

  const fetchHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealthInfo(data);
    } catch (err) {
      console.warn("Backend not reachable:", err.message);
      setHealthInfo({ success: false });
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectSourceForChat = (sourceName) => {
    setActiveSourceFilter(sourceName);
    setActiveTab("chat");
  };

  const handleOpenTriadSandbox = (data = null) => {
    setSingleEvalData(data);
    setIsSingleEvalOpen(true);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthInfo={healthInfo}
      />

      {/* Main Tab Content */}
      <main style={{ flex: 1, position: "relative" }}>
        {activeTab === "chat" && (
          <ChatInterface
            onInspectSource={(source) => setInspectingSource(source)}
            onInspectTriad={(data) => handleOpenTriadSandbox(data)}
            activeSourceFilter={activeSourceFilter}
            setActiveSourceFilter={setActiveSourceFilter}
          />
        )}

        {activeTab === "documents" && (
          <DocumentManager
            onSelectSourceForChat={handleSelectSourceForChat}
          />
        )}

        {activeTab === "eval" && (
          <RAGTriadDashboard
            onOpenSingleEval={() => handleOpenTriadSandbox(null)}
          />
        )}
      </main>

      {/* Source Attribution Inspector Drawer */}
      {inspectingSource && (
        <SourceInspectorModal
          source={inspectingSource}
          onClose={() => setInspectingSource(null)}
        />
      )}

      {/* Interactive RAG Triad Evaluator Sandbox Modal */}
      {isSingleEvalOpen && (
        <SingleEvalModal
          initialData={singleEvalData}
          onClose={() => {
            setIsSingleEvalOpen(false);
            setSingleEvalData(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
