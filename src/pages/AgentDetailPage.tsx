import { useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { useKnowledge } from "../state/knowledgeContext";
import { formatDateTime, entityPath } from "../lib/format";
import { EvidenceDrawer } from "../components/knowledge/EvidenceDrawer";

import type { AgentStatus, Evidence } from "../data/types";

export function AgentDetailPage() {
  const { id } = useParams();
  const { state, dispatch } = useKnowledge();
  const navigate = useNavigate();
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const agent = state.agents.find((ag) => ag.id === id);
  if (!agent) return <Navigate to="/agents" replace />;

  function handleTriggerScan() {
    dispatch({ type: "trigger-agent-scan", id: agent!.id });
    setScanMessage("Manual scan completed. Evaluated target repositories against active inspection rules.");
    setTimeout(() => setScanMessage(null), 4000);
  }

  const statusBadge = (status: AgentStatus) => {
    const config = {
      active: { label: "Active Sentinel", bg: "var(--success-soft)", color: "var(--success)" },
      paused: { label: "Paused", bg: "var(--surface-2)", color: "var(--text-secondary)" },
      evaluating: { label: "Evaluating", bg: "var(--warning-soft)", color: "var(--warning)" },
    }[status];
    return (
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: "4px",
          backgroundColor: config.bg,
          color: config.color,
        }}
      >
        {config.label}
      </span>
    );
  };

  // Mock inspection run history for this agent
  const inspectionHistory = [
    {
      timestamp: agent.lastRun,
      status: "completed",
      findingsCount: agent.findingsCount,
      summary: `${agent.targetScopes.join(", ")} inspected. ${agent.findingsCount} policy divergence(s) flagged.`,
    },
    {
      timestamp: "2026-09-17T12:00:00",
      status: "completed",
      findingsCount: 0,
      summary: "Scheduled automated scan. Zero new deviations observed.",
    },
    {
      timestamp: "2026-09-16T18:00:00",
      status: "completed",
      findingsCount: 1,
      summary: "Evaluated customer contracts and pitch collateral against ratified policies.",
    },
  ];

  return (
    <main className="page">
      <div className="crumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/agents">Agents</Link>
        <span>/</span>
        <span>{agent.name}</span>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {statusBadge(agent.status)}
            <span className="tiny" style={{ color: "var(--text-secondary)" }}>
              {agent.role} · Cadence: {agent.interval}
            </span>
          </div>
          <h2>{agent.name}</h2>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: "15px" }}>
            {agent.description}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn" onClick={handleTriggerScan}>
            Trigger Manual Scan
          </button>
          <button
            className={`btn ${agent.status === "active" ? "active" : ""}`}
            onClick={() => dispatch({ type: "toggle-agent-status", id: agent.id })}
          >
            {agent.status === "active" ? "Pause Agent" : "Resume Agent"}
          </button>
          <button
            className="btn primary"
            onClick={() =>
              navigate(
                `/chat?contextKind=agent&contextId=${agent.id}&prompt=${encodeURIComponent(
                  `Explain the latest anomalies detected by ${agent.name} and proposed remediations.`,
                )}`,
              )
            }
          >
            Ask Memory about this agent →
          </button>
        </div>
      </header>

      {scanMessage ? (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            backgroundColor: "var(--success-soft)",
            borderLeft: "4px solid var(--success)",
            marginBottom: 16,
            fontSize: "13.5px",
            color: "var(--success)",
          }}
        >
          ✓ {scanMessage}
        </div>
      ) : null}

      <section className="meta-block">
        <dl className="kv">
          <dt>Status</dt>
          <dd style={{ textTransform: "capitalize" }}>{agent.status}</dd>
          <dt>Last Scanned</dt>
          <dd>{formatDateTime(agent.lastRun)}</dd>
          <dt>Active Anomalies</dt>
          <dd>{agent.findingsCount} flagged issues</dd>
          <dt>Monitored Scopes</dt>
          <dd>{agent.targetScopes.join(", ")}</dd>
        </dl>
      </section>

      {/* Operational Inspection Rules */}
      <section className="section">
        <div className="section-head">
          <h3>Operational Inspection Rules</h3>
          <span className="tiny">Continuous deterministic criteria</span>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8, fontSize: "13.5px" }}>
            {agent.rules.map((rule, rIdx) => (
              <li key={rIdx}>
                <strong>Rule {rIdx + 1}:</strong> {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Active Findings & Generated Actions: AGENT -> FINDING -> EVIDENCE -> ACTION */}
      <section className="section">
        <div className="section-head">
          <h3>Detected Anomalies & Recommendations</h3>
          <span className="tiny">AGENT → FINDING → EVIDENCE → RECOMMENDATION → ACTION</span>
        </div>

        {agent.activeFindings.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {agent.activeFindings.map((finding) => {
              const generatedAction = finding.actionId
                ? state.actions.find((a) => a.id === finding.actionId)
                : undefined;

              // Find evidence connected to this finding's entity or generated action
              const relatedEvidence = state.evidence.filter(
                (ev) =>
                  ev.relatedId === finding.relatedEntityId ||
                  (generatedAction && (generatedAction.evidenceIds || []).includes(ev.id)),
              );

              return (
                <div
                  key={finding.id}
                  className="card"
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    borderLeft:
                      finding.severity === "high"
                        ? "4px solid var(--danger)"
                        : "4px solid var(--warning)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor:
                            finding.severity === "high"
                              ? "var(--danger-soft)"
                              : "var(--warning-soft)",
                          color:
                            finding.severity === "high"
                              ? "var(--danger)"
                              : "var(--warning)",
                          textTransform: "uppercase",
                        }}
                      >
                        {finding.severity} SEVERITY
                      </span>
                      <span className="tiny" style={{ marginLeft: 8, color: "var(--text-muted)" }}>
                        Detected {formatDateTime(finding.detectedAt)}
                      </span>
                    </div>

                    <Link
                      to={entityPath(finding.relatedEntityKind, finding.relatedEntityId)}
                      style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--accent)" }}
                    >
                      Inspect Target Entity ({finding.relatedEntityKind}) →
                    </Link>
                  </div>

                  <div>
                    <strong style={{ fontSize: "14px", display: "block", marginBottom: 2 }}>
                      Sentinel Finding:
                    </strong>
                    <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.5, color: "var(--text)" }}>
                      {finding.summary}
                    </p>
                  </div>

                  {/* Evidence Citations */}
                  {relatedEvidence.length > 0 ? (
                    <div style={{ padding: "10px 14px", backgroundColor: "var(--bg)", borderRadius: "6px" }}>
                      <span className="tiny" style={{ textTransform: "uppercase", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                        Corroborating Primary Evidence:
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {relatedEvidence.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => setSelectedEvidence(ev)}
                            style={{
                              fontSize: "12.5px",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span style={{ fontStyle: "italic", color: "var(--text)" }}>
                              “{ev.quote}”
                            </span>
                            <span style={{ fontSize: "11.5px", color: "var(--accent)", fontWeight: 600, whiteSpace: "nowrap" }}>
                              Inspect Source →
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Generated Action in Action Center */}
                  {generatedAction ? (
                    <div
                      style={{
                        padding: "12px 14px",
                        backgroundColor: "var(--surface-2)",
                        borderRadius: "6px",
                        borderLeft: "3px solid var(--accent)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <span className="tiny" style={{ textTransform: "uppercase", fontWeight: 700, color: "var(--accent)" }}>
                            Recommended Action:
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              padding: "1px 6px",
                              borderRadius: "4px",
                              backgroundColor: "var(--accent-soft)",
                              color: "var(--accent)",
                            }}
                          >
                            {generatedAction.status}
                          </span>
                        </div>
                        <strong style={{ fontSize: "13.5px" }}>{generatedAction.title}</strong>
                      </div>

                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Link
                          to="/actions"
                          className="btn primary"
                          style={{ fontSize: "12.5px", padding: "6px 12px" }}
                        >
                          Review in Action Center →
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card empty" style={{ padding: "28px", textAlign: "center", color: "var(--text-secondary)" }}>
            <p style={{ margin: 0 }}>All monitored scopes report clean status. Zero active anomalies.</p>
          </div>
        )}
      </section>

      {/* Inspection Run History */}
      <section className="section">
        <div className="section-head">
          <h3>Inspection Run Audit Log</h3>
          <span className="tiny">Chronological verification history</span>
        </div>

        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {inspectionHistory.map((run, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  paddingBottom: idx !== inspectionHistory.length - 1 ? 10 : 0,
                  borderBottom: idx !== inspectionHistory.length - 1 ? "1px solid var(--border)" : "none",
                  fontSize: "13px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, color: "var(--success)" }}>✓ Run Completed</span>
                    <span className="tiny" style={{ color: "var(--text-muted)" }}>
                      {formatDateTime(run.timestamp)}
                    </span>
                  </div>
                  <div style={{ color: "var(--text-secondary)" }}>{run.summary}</div>
                </div>
                <span
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor: run.findingsCount > 0 ? "var(--warning-soft)" : "var(--surface-2)",
                    color: run.findingsCount > 0 ? "var(--warning)" : "var(--text-secondary)",
                  }}
                >
                  {run.findingsCount} finding{run.findingsCount !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
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
