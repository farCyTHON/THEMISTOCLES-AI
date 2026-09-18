import { useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { useKnowledge } from "../state/knowledgeContext";
import { formatDateTime, entityPath } from "../lib/format";
import type { AgentStatus } from "../data/types";

export function AgentDetailPage() {
  const { id } = useParams();
  const { state, dispatch } = useKnowledge();
  const navigate = useNavigate();
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const agent = state.agents.find((ag) => ag.id === id);
  if (!agent) return <Navigate to="/agents" replace />;

  function handleTriggerScan() {
    dispatch({ type: "trigger-agent-scan", id: agent!.id });
    setScanMessage("Manual scan completed. Evaluated target repositories against active rules.");
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

      {/* Inspection Rules */}
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

      {/* Active Findings & Generated Actions */}
      <section className="section">
        <div className="section-head">
          <h3>Detected Anomalies & Recommendations</h3>
          <span className="tiny">Anchored in evidence</span>
        </div>

        {agent.activeFindings.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {agent.activeFindings.map((finding) => {
              const generatedAction = finding.actionId
                ? state.actions.find((a) => a.id === finding.actionId)
                : undefined;

              return (
                <div
                  key={finding.id}
                  className="card"
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
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
                      View Target Entity →
                    </Link>
                  </div>

                  <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.45 }}>
                    {finding.summary}
                  </p>

                  {generatedAction ? (
                    <div
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "var(--bg)",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        <strong>Action Generated:</strong> {generatedAction.title}
                      </span>
                      <Link to="/actions" style={{ fontWeight: 600, color: "var(--accent)" }}>
                        Review in Action Center →
                      </Link>
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
    </main>
  );
}
