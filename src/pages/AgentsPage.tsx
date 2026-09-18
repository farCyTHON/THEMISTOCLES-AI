import { Link, useNavigate } from "react-router-dom";
import { useKnowledge } from "../state/knowledgeContext";
import { formatRelativeTime } from "../lib/format";
import type { AgentStatus } from "../data/types";

export function AgentsPage() {
  const { state, dispatch } = useKnowledge();
  const navigate = useNavigate();

  const activeCount = state.agents.filter((ag) => ag.status === "active").length;
  const totalFindings = state.agents.reduce((acc, ag) => acc + ag.findingsCount, 0);

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
        <span>Agents</span>
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
          <h2>Autonomous Organizational Agents</h2>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Continuous governance sentinels monitoring knowledge drift, outward SLA commitments, and provenance integrity.
          </p>
        </div>

        <button
          className="btn"
          onClick={() =>
            navigate(
              `/chat?prompt=${encodeURIComponent(
                "What organizational agents are running and what anomalies have they detected recently?",
              )}`,
            )
          }
        >
          Ask Memory about agents →
        </button>
      </header>

      {/* KPI Overview */}
      <section className="section">
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Active Sentinels</div>
            <div className="stat-value" style={{ color: "var(--success)" }}>
              {activeCount} of {state.agents.length}
            </div>
            <div className="stat-detail">Monitoring organizational memory</div>
          </div>
          <div className="stat">
            <div className="stat-label">Active Anomalies</div>
            <div className="stat-value" style={{ color: totalFindings > 0 ? "var(--warning)" : "inherit" }}>
              {totalFindings}
            </div>
            <div className="stat-detail">Converted to Action Center tasks</div>
          </div>
          <div className="stat">
            <div className="stat-label">Sentinel Cadence</div>
            <div className="stat-value" style={{ color: "var(--accent)" }}>
              Continuous
            </div>
            <div className="stat-detail">Scheduled audit loops</div>
          </div>
        </div>
      </section>

      {/* Agent Cards Grid */}
      <section className="section">
        <div className="section-head">
          <h3>Autonomous Sentinels</h3>
          <span className="tiny">Deterministic policy and SLA guardians</span>
        </div>

        <div className="grid-cards">
          {state.agents.map((agent) => (
            <article
              key={agent.id}
              className="card"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                borderTop: agent.status === "active" ? "3px solid var(--success)" : "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    {statusBadge(agent.status)}
                    <span className="tiny" style={{ color: "var(--text-secondary)" }}>
                      {agent.role}
                    </span>
                  </div>
                  <h3 style={{ margin: "2px 0 0", fontSize: "16px" }}>
                    <Link to={`/agents/${agent.id}`} style={{ textDecoration: "none", color: "var(--text)" }}>
                      {agent.name}
                    </Link>
                  </h3>
                </div>

                <button
                  className={`btn ${agent.status === "active" ? "active" : ""}`}
                  onClick={() => dispatch({ type: "toggle-agent-status", id: agent.id })}
                  style={{ fontSize: "12px", padding: "4px 8px" }}
                >
                  {agent.status === "active" ? "Pause Agent" : "Resume Agent"}
                </button>
              </div>

              <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                {agent.description}
              </p>

              <div>
                <span className="tiny" style={{ color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Monitored Scopes
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {agent.targetScopes.map((scope, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        fontSize: "11.5px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "var(--bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Findings Preview */}
              <div
                style={{
                  padding: "10px 12px",
                  backgroundColor: agent.findingsCount > 0 ? "var(--warning-soft)" : "var(--surface-2)",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{agent.findingsCount} Active Finding{agent.findingsCount !== 1 ? "s" : ""}</strong>
                  <span className="tiny" style={{ color: "var(--text-secondary)" }}>
                    Scanned {formatRelativeTime(agent.lastRun)}
                  </span>
                </div>
                {agent.activeFindings.length && agent.activeFindings[0] ? (
                  <p style={{ margin: "4px 0 0", fontSize: "12px", fontStyle: "italic" }}>
                    “{agent.activeFindings[0].summary}”
                  </p>
                ) : null}
              </div>

              <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)" }}>
                <Link to={`/agents/${agent.id}`} style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent)" }}>
                  Configure Rules & History →
                </Link>

                <button
                  className="btn icon-btn"
                  title="Ask Memory about this agent"
                  onClick={() =>
                    navigate(
                      `/chat?contextKind=agent&contextId=${agent.id}&prompt=${encodeURIComponent(
                        `What are the latest findings and active rules for ${agent.name}?`,
                      )}`,
                    )
                  }
                >
                  Ask Memory →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
