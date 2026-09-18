import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useKnowledge } from "../state/knowledgeContext";
import { EntityBadge } from "../components/ui/EntityBadge";
import { entityPath } from "../lib/format";

export function WorkspacePage() {
  const { state } = useKnowledge();
  const navigate = useNavigate();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("ws-all");

  const currentWorkspace =
    state.workspaces.find((w) => w.id === selectedWorkspaceId) || state.workspaces[0] || {
      id: "ws-all",
      name: "Global Organization",
      description: "Company-wide memory across engineering, product, and operations.",
      leadPersonId: "person-alex",
      memberCount: 14,
      activeDecisionsCount: state.decisions.length,
      pendingActionsCount: state.actions.length,
      connectedSystems: ["sys-api", "sys-db", "sys-payment"],
    };

  const lead = state.people.find((p) => p.id === currentWorkspace.leadPersonId);

  // Filter scoped decisions and actions based on workspace
  const scopedDecisions = state.decisions.filter((d) => {
    if (currentWorkspace.id === "ws-all") return true;
    if (currentWorkspace.id === "ws-eng") {
      return d.madeBy.includes("Engineering") || d.madeBy.includes("Security");
    }
    if (currentWorkspace.id === "ws-prod") {
      return d.madeBy.includes("Product");
    }
    if (currentWorkspace.id === "ws-ops") {
      return d.madeBy.includes("Operations") || d.madeBy.includes("Sales");
    }
    return true;
  });

  const scopedActions = state.actions.filter((a) => {
    if (currentWorkspace.id === "ws-all") return true;
    if (currentWorkspace.id === "ws-eng") {
      return a.assignedTo === "person-alex" || a.assignedTo === "person-sam" || a.assignedTo === "person-maya";
    }
    if (currentWorkspace.id === "ws-prod") {
      return a.assignedTo === "person-sarah" || a.assignedTo === "person-lena";
    }
    if (currentWorkspace.id === "ws-ops") {
      return a.assignedTo === "person-james" || a.assignedTo === "person-rachel" || a.assignedTo === "person-daniel";
    }
    return true;
  });

  return (
    <main className="page">
      <div className="crumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Workspace</span>
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
          <h2>Organizational Workspaces</h2>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Scoped operational views for departments exploring targeted decisions, actions, and system ownership.
          </p>
        </div>

        <button
          className="btn"
          onClick={() =>
            navigate(
              `/chat?prompt=${encodeURIComponent(
                `What are the active decisions and responsibilities scoped to ${currentWorkspace.name}?`,
              )}`,
            )
          }
        >
          Ask Memory about this workspace →
        </button>
      </header>

      {/* Workspace Selector Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {state.workspaces.map((ws) => (
          <button
            key={ws.id}
            className={`filter-chip ${selectedWorkspaceId === ws.id ? "active" : ""}`}
            onClick={() => setSelectedWorkspaceId(ws.id)}
          >
            {ws.name}
          </button>
        ))}
      </div>

      {/* Workspace Overview Banner */}
      <section
        className="card"
        style={{
          padding: "24px",
          backgroundColor: "var(--surface)",
          borderLeft: "4px solid var(--accent)",
          marginBottom: 24,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "18px" }}>{currentWorkspace.name}</h3>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", maxWidth: 640 }}>
              {currentWorkspace.description}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: "6px",
                backgroundColor: "var(--accent-soft)",
                color: "var(--accent)",
              }}
            >
              Lead: {lead ? lead.name : "Alex Chen"}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: "6px",
                backgroundColor: "var(--surface-2)",
                color: "var(--text)",
              }}
            >
              {currentWorkspace.memberCount} Team Members
            </span>
          </div>
        </div>

        <div className="stats" style={{ marginTop: 4 }}>
          <div className="stat" style={{ padding: "12px 14px" }}>
            <div className="stat-label">Scoped Decisions</div>
            <div className="stat-value">{scopedDecisions.length}</div>
          </div>
          <div className="stat" style={{ padding: "12px 14px" }}>
            <div className="stat-label">Pending Actions</div>
            <div className="stat-value" style={{ color: scopedActions.length > 0 ? "var(--warning)" : "inherit" }}>
              {scopedActions.length}
            </div>
          </div>
          <div className="stat" style={{ padding: "12px 14px" }}>
            <div className="stat-label">Connected Systems</div>
            <div className="stat-value">{currentWorkspace.connectedSystems.length}</div>
          </div>
        </div>
      </section>

      {/* Scoped Actions & Decisions Grid */}
      <section className="section">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {/* Pending Actions */}
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
                Workspace Actions ({scopedActions.length})
              </h4>
              <Link to="/actions" style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)" }}>
                View Action Center →
              </Link>
            </div>

            {scopedActions.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {scopedActions.slice(0, 4).map((action) => (
                  <div
                    key={action.id}
                    style={{
                      padding: "10px",
                      backgroundColor: "var(--bg)",
                      borderRadius: "6px",
                      fontSize: "13px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>{action.title}</strong>
                      <span className="tiny" style={{ textTransform: "capitalize", fontWeight: 600 }}>
                        {action.status}
                      </span>
                    </div>
                    <span className="tiny" style={{ color: "var(--text-secondary)" }}>
                      {action.impactSummary}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="tiny" style={{ color: "var(--text-secondary)" }}>No pending actions in this scope.</p>
            )}
          </div>

          {/* Scoped Decisions */}
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
                Active Governance Decisions ({scopedDecisions.length})
              </h4>
              <Link to="/knowledge/decisions" style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)" }}>
                View All →
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {scopedDecisions.slice(0, 4).map((decision) => (
                <Link
                  key={decision.id}
                  to={`/knowledge/decisions/${decision.id}`}
                  style={{
                    padding: "10px",
                    backgroundColor: "var(--bg)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    textDecoration: "none",
                    color: "var(--text)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <EntityBadge kind="decision" label="Decision" />
                  <div>
                    <strong>Decision #{decision.number}: {decision.title}</strong>
                    <div className="tiny" style={{ color: "var(--text-secondary)" }}>
                      Made by: {decision.madeBy}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Connected Core Systems */}
      <section className="section">
        <div className="section-head">
          <h3>Connected Systems & Toolchain</h3>
        </div>

        <div className="source-row">
          {currentWorkspace.connectedSystems.map((sysId) => {
            const system = state.systems.find((s) => s.id === sysId);
            if (!system) return null;
            return (
              <Link
                key={system.id}
                to={entityPath("system", system.id)}
                className="card source-card clickable"
              >
                <h4>{system.name}</h4>
                <p>{system.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
