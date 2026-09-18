import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useKnowledge } from "../state/knowledgeContext";
import { formatDateTime } from "../lib/format";
import { EvidenceDrawer } from "../components/knowledge/EvidenceDrawer";
import type { Evidence } from "../data/types";

export function SourcesPage() {
  const { state, dispatch } = useKnowledge();
  const navigate = useNavigate();
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  function handleSyncAll() {
    state.sources.forEach((s) => {
      dispatch({ type: "trigger-source-sync", id: s.id });
    });
    setSyncFeedback("All communication channels synced. New organizational signals processed.");
    setTimeout(() => setSyncFeedback(null), 4000);
  }

  function handleSyncSingle(id: string, name: string) {
    dispatch({ type: "trigger-source-sync", id });
    setSyncFeedback(`Synced ${name} collector. Ingested latest messages into memory buffer.`);
    setTimeout(() => setSyncFeedback(null), 4000);
  }

  return (
    <main className="page">
      <div className="crumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Sources</span>
      </div>

      <header
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h2>Connected Sources & Ingestion</h2>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Communication channels, meeting recordings, and documentation repositories feeding Themistocles' evidence engine.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn primary" onClick={handleSyncAll}>
            ↻ Sync All Sources
          </button>
          <button
            className="btn"
            onClick={() =>
              navigate(
                `/chat?prompt=${encodeURIComponent(
                  "What sources are currently connected and what was the most recent evidence ingested from Slack and Teams?",
                )}`,
              )
            }
          >
            Ask Memory about sources →
          </button>
        </div>
      </header>

      {syncFeedback ? (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            backgroundColor: "var(--success-soft)",
            borderLeft: "4px solid var(--success)",
            marginBottom: 20,
            fontSize: "13.5px",
            color: "var(--success)",
          }}
        >
          ✓ {syncFeedback}
        </div>
      ) : null}

      {/* Telemetry Stats */}
      <section className="section">
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Active Collectors</div>
            <div className="stat-value" style={{ color: "var(--success)" }}>
              {state.sources.filter((s) => s.connected).length} of {state.sources.length}
            </div>
            <div className="stat-detail">Live stream ingest active</div>
          </div>
          <div className="stat">
            <div className="stat-label">Evidence Grounding</div>
            <div className="stat-value" style={{ color: "var(--accent)" }}>
              {state.evidence.length}
            </div>
            <div className="stat-detail">Verified claims in memory</div>
          </div>
          <div className="stat">
            <div className="stat-label">Connector Health</div>
            <div className="stat-value" style={{ color: "var(--success)" }}>
              100%
            </div>
            <div className="stat-detail">Zero sync errors logged</div>
          </div>
        </div>
      </section>

      {/* Sources Grid */}
      <section className="section">
        <div className="section-head">
          <h3>Active Source Connectors</h3>
          <span className="tiny">Extracting organizational signals</span>
        </div>

        <div className="source-row">
          {state.sources.map((source) => {
            const evidenceCount = state.evidence.filter((e) => e.sourceId === source.id).length;

            return (
              <article
                className="card source-card"
                key={source.id}
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  borderTop: source.connected ? "3px solid var(--success)" : "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "var(--surface-2)",
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                      }}
                    >
                      {source.kind}
                    </span>
                    <h4 style={{ margin: "4px 0 0", fontSize: "16px" }}>{source.name}</h4>
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: source.connected ? "var(--success-soft)" : "var(--danger-soft)",
                      color: source.connected ? "var(--success)" : "var(--danger)",
                    }}
                  >
                    {source.connected ? "Connected" : "Disconnected"}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                  Channel / Location: <strong>{source.location}</strong>
                </p>

                <div className="tiny" style={{ color: "var(--text-muted)" }}>
                  Last synced: {formatDateTime(source.lastSynced)}
                </div>

                <div
                  style={{
                    padding: "8px 10px",
                    backgroundColor: "var(--bg)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Grounded Claims:</span>
                  <strong>{evidenceCount} quotes extracted</strong>
                </div>

                <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", gap: 8, borderTop: "1px solid var(--border)" }}>
                  <button
                    className="btn"
                    style={{ flex: 1, fontSize: "12px", justifyContent: "center" }}
                    onClick={() => handleSyncSingle(source.id, source.name)}
                  >
                    Sync Collector
                  </button>
                  <button
                    className="btn"
                    style={{ fontSize: "12px" }}
                    onClick={() => {
                      const firstEv = state.evidence.find((e) => e.sourceId === source.id);
                      if (firstEv) setSelectedEvidence(firstEv);
                    }}
                  >
                    Inspect Evidence
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Simulated Signal Ingestion Hub */}
      <section className="section">
        <div className="section-head">
          <h3>Signal Pipeline Buffer</h3>
          <span className="tiny">Incoming stream simulation</span>
        </div>

        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span className="tiny" style={{ textTransform: "uppercase", fontWeight: 700, color: "var(--accent)" }}>
              Buffered Conversation Feed · {state.signal.channel}
            </span>
            <span className="tiny" style={{ color: "var(--text-muted)" }}>
              Status: Ingested & Evaluated
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {state.signal.messages.map((msg, mIdx) => (
              <div
                key={mIdx}
                style={{
                  padding: "10px 12px",
                  backgroundColor: "var(--bg)",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              >
                <strong style={{ color: "var(--accent)" }}>{msg.speaker}: </strong>
                <span>"{msg.text}"</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="tiny" style={{ color: "var(--text-secondary)" }}>
              Signal processed through {state.processingSteps.length} governance steps.
            </span>
            <Link to="/knowledge" style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--accent)" }}>
              Inspect Knowledge Graph →
            </Link>
          </div>
        </div>
      </section>

      <EvidenceDrawer
        evidence={selectedEvidence}
        source={selectedEvidence ? state.sources.find((s) => s.id === selectedEvidence.sourceId) : undefined}
        onClose={() => setSelectedEvidence(null)}
      />
    </main>
  );
}
