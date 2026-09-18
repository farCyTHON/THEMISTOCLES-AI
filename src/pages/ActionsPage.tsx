import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useKnowledge } from "../state/knowledgeContext";
import { EntityBadge } from "../components/ui/EntityBadge";
import { entityPath, formatDateTime, formatDate } from "../lib/format";
import type { ActionStatus, ActionPriority, ActionItem } from "../data/types";

export function ActionsPage() {
  const { state, dispatch } = useKnowledge();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<"all" | ActionStatus>("all");
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [modalMode, setModalMode] = useState<"approve" | "execute" | null>(null);
  const [execResultNotes, setExecResultNotes] = useState("");

  const filteredActions = useMemo(() => {
    if (filter === "all") return state.actions;
    return state.actions.filter((a) => a.status === filter);
  }, [state.actions, filter]);

  const pendingCount = state.actions.filter((a) => a.status === "proposed" || a.status === "under-review").length;
  const approvedCount = state.actions.filter((a) => a.status === "approved").length;
  const executedCount = state.actions.filter((a) => a.status === "executed").length;
  const urgentCount = state.actions.filter((a) => a.priority === "urgent" || a.priority === "high").length;

  function handleActionTransition(action: ActionItem, newStatus: ActionStatus, notes?: string) {
    dispatch({
      type: "update-action-status",
      id: action.id,
      status: newStatus,
      executedBy: "Alex Chen",
      result: notes || (newStatus === "executed" ? "Action executed and verified across organizational systems." : undefined),
    });
    setModalMode(null);
    setSelectedAction(null);
    setExecResultNotes("");
  }

  const priorityBadge = (priority: ActionPriority) => {
    const config = {
      urgent: { label: "Urgent", bg: "var(--danger-soft)", color: "var(--danger)" },
      high: { label: "High Priority", bg: "var(--warning-soft)", color: "var(--warning)" },
      medium: { label: "Medium", bg: "var(--accent-soft)", color: "var(--accent)" },
      low: { label: "Low", bg: "var(--surface-2)", color: "var(--text-secondary)" },
    }[priority];
    return (
      <span
        style={{
          fontSize: "11px",
          fontWeight: 700,
          padding: "2px 7px",
          borderRadius: "4px",
          backgroundColor: config.bg,
          color: config.color,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {config.label}
      </span>
    );
  };

  const statusBadge = (status: ActionStatus) => {
    const config = {
      proposed: { label: "Proposed", bg: "var(--surface-2)", color: "var(--text)" },
      "under-review": { label: "Under Review", bg: "var(--warning-soft)", color: "var(--warning)" },
      approved: { label: "Approved", bg: "var(--accent-soft)", color: "var(--accent)" },
      executed: { label: "Executed", bg: "var(--success-soft)", color: "var(--success)" },
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
        <span>Action Center</span>
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
          <h2>Action Center</h2>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Operational actions, policy reconciliations, and workflow updates proposed by organizational intelligence and team leads.
          </p>
        </div>

        <button
          className="btn"
          onClick={() =>
            navigate(
              `/chat?prompt=${encodeURIComponent(
                "What pending actions are currently in the Action Center and who is assigned to them?",
              )}`,
            )
          }
        >
          Ask Memory about actions →
        </button>
      </header>

      {/* Overview Stats */}
      <section className="section">
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Pending Review</div>
            <div className="stat-value" style={{ color: pendingCount > 0 ? "var(--warning)" : "inherit" }}>
              {pendingCount}
            </div>
            <div className="stat-detail">Requires decision sign-off</div>
          </div>
          <div className="stat">
            <div className="stat-label">Ready to Execute</div>
            <div className="stat-value" style={{ color: approvedCount > 0 ? "var(--accent)" : "inherit" }}>
              {approvedCount}
            </div>
            <div className="stat-detail">Approved by stakeholders</div>
          </div>
          <div className="stat">
            <div className="stat-label">Executed</div>
            <div className="stat-value" style={{ color: "var(--success)" }}>
              {executedCount}
            </div>
            <div className="stat-detail">Applied to organization</div>
          </div>
          <div className="stat">
            <div className="stat-label">High Priority</div>
            <div className="stat-value" style={{ color: urgentCount > 0 ? "var(--danger)" : "inherit" }}>
              {urgentCount}
            </div>
            <div className="stat-detail">Time-sensitive alignment</div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          className={`filter-chip ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Actions ({state.actions.length})
        </button>
        <button
          className={`filter-chip ${filter === "proposed" ? "active" : ""}`}
          onClick={() => setFilter("proposed")}
        >
          Proposed ({state.actions.filter((a) => a.status === "proposed").length})
        </button>
        <button
          className={`filter-chip ${filter === "under-review" ? "active" : ""}`}
          onClick={() => setFilter("under-review")}
        >
          Under Review ({state.actions.filter((a) => a.status === "under-review").length})
        </button>
        <button
          className={`filter-chip ${filter === "approved" ? "active" : ""}`}
          onClick={() => setFilter("approved")}
        >
          Approved ({approvedCount})
        </button>
        <button
          className={`filter-chip ${filter === "executed" ? "active" : ""}`}
          onClick={() => setFilter("executed")}
        >
          Executed ({executedCount})
        </button>
      </div>

      {/* Actions List */}
      <section className="section">
        {filteredActions.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filteredActions.map((action) => {
              const assignee = state.people.find((p) => p.id === action.assignedTo);
              const proposerAgent = state.agents.find((ag) => ag.id === action.proposedBy);
              const proposerPerson = state.people.find((p) => p.id === action.proposedBy);

              const conflict = action.relatedConflictId
                ? state.conflicts.find((c) => c.id === action.relatedConflictId)
                : undefined;
              const decision = action.relatedDecisionId
                ? state.decisions.find((d) => d.id === action.relatedDecisionId)
                : undefined;

              return (
                <article
                  key={action.id}
                  className="card"
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    borderLeft:
                      action.priority === "urgent"
                        ? "4px solid var(--danger)"
                        : action.priority === "high"
                        ? "4px solid var(--warning)"
                        : "4px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        {priorityBadge(action.priority)}
                        {statusBadge(action.status)}
                        <span className="tiny" style={{ color: "var(--text-muted)" }}>
                          Proposed {formatDate(action.proposedAt)}
                        </span>
                      </div>
                      <h3 style={{ margin: "2px 0 0", fontSize: "16px" }}>{action.title}</h3>
                    </div>

                    {/* Action Execution / Transition Buttons */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      {action.status === "proposed" ? (
                        <>
                          <button
                            className="btn"
                            onClick={() => handleActionTransition(action, "under-review")}
                          >
                            Mark In Review
                          </button>
                          <button
                            className="btn primary"
                            onClick={() => {
                              setSelectedAction(action);
                              setModalMode("approve");
                            }}
                          >
                            Approve Action →
                          </button>
                        </>
                      ) : null}

                      {action.status === "under-review" ? (
                        <button
                          className="btn primary"
                          onClick={() => {
                            setSelectedAction(action);
                            setModalMode("approve");
                          }}
                        >
                          Approve Action →
                        </button>
                      ) : null}

                      {action.status === "approved" ? (
                        <button
                          className="btn primary"
                          style={{ backgroundColor: "var(--success)", borderColor: "var(--success)" }}
                          onClick={() => {
                            setSelectedAction(action);
                            setModalMode("execute");
                          }}
                        >
                          ✓ Execute Action →
                        </button>
                      ) : null}

                      <button
                        className="btn icon-btn"
                        title="Ask Themistocles about this action"
                        onClick={() =>
                          navigate(
                            `/chat?contextKind=action&contextId=${action.id}&prompt=${encodeURIComponent(
                              `What are the implications and assigned tasks for action: "${action.title}"?`,
                            )}`,
                          )
                        }
                      >
                        Ask Memory →
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.5, color: "var(--text)" }}>
                    {action.description}
                  </p>

                  <div
                    style={{
                      padding: "10px 14px",
                      backgroundColor: "var(--bg)",
                      borderRadius: "6px",
                      fontSize: "13px",
                      borderLeft: "3px solid var(--accent)",
                    }}
                  >
                    <strong>Expected Impact:</strong> {action.impactSummary}
                  </div>

                  {/* Execution Verification Banner if Executed */}
                  {action.status === "executed" && action.executedAt ? (
                    <div
                      style={{
                        padding: "10px 14px",
                        backgroundColor: "var(--success-soft)",
                        borderRadius: "6px",
                        borderLeft: "3px solid var(--success)",
                        fontSize: "13px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <strong style={{ color: "var(--success)" }}>
                        Executed on {formatDateTime(action.executedAt)} by {action.executedBy}
                      </strong>
                      <span>{action.executionResult}</span>
                    </div>
                  ) : null}

                  {/* Proposer, Assignee, and Related Links */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, paddingTop: 4, borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: "12.5px" }}>
                      <span>
                        <span className="tiny" style={{ color: "var(--text-secondary)" }}>Proposed by: </span>
                        {proposerAgent ? (
                          <Link to={`/agents/${proposerAgent.id}`} style={{ fontWeight: 600 }}>
                            {proposerAgent.name} (Agent)
                          </Link>
                        ) : proposerPerson ? (
                          <Link to={`/people/${proposerPerson.id}`} style={{ fontWeight: 600 }}>
                            {proposerPerson.name}
                          </Link>
                        ) : (
                          "Autonomous Sentinel"
                        )}
                      </span>

                      <span>
                        <span className="tiny" style={{ color: "var(--text-secondary)" }}>Assigned to: </span>
                        {assignee ? (
                          <Link to={`/people/${assignee.id}`} style={{ fontWeight: 600 }}>
                            {assignee.name}
                          </Link>
                        ) : (
                          "Unassigned"
                        )}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "12.5px" }}>
                      {conflict ? (
                        <Link to={`/conflicts/${conflict.id}`} style={{ color: "var(--danger)", fontWeight: 600 }}>
                          Resolves Conflict →
                        </Link>
                      ) : null}
                      {decision ? (
                        <Link to={`/knowledge/decisions/${decision.id}`} style={{ color: "var(--decision)", fontWeight: 600 }}>
                          Decision #{decision.number} →
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  {/* Affected Entities */}
                  {action.affectedEntities?.length ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span className="tiny" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                        Affected Areas:
                      </span>
                      {action.affectedEntities.map((ae) => (
                        <Link
                          key={ae.id}
                          to={entityPath(ae.kind, ae.id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "11.5px",
                            padding: "2px 7px",
                            borderRadius: "4px",
                            backgroundColor: "var(--surface-2)",
                            color: "var(--text)",
                            textDecoration: "none",
                          }}
                        >
                          <EntityBadge kind={ae.kind} label={ae.kind} />
                          <span>{ae.label}</span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="card empty" style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
            <p style={{ margin: 0, fontSize: "15px" }}>No operational actions matching this filter.</p>
          </div>
        )}
      </section>

      {/* Action Approval / Execution Modal */}
      {modalMode && selectedAction ? (
        <div
          className="drawer-backdrop"
          onClick={() => {
            setModalMode(null);
            setSelectedAction(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(12, 16, 22, 0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: "20px",
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 520,
              backgroundColor: "var(--surface)",
              boxShadow: "var(--shadow-lg)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "17px" }}>
                  {modalMode === "approve" ? "Approve Organizational Action" : "Confirm Action Execution"}
                </h3>
                <p className="tiny" style={{ margin: "4px 0 0", color: "var(--text-secondary)" }}>
                  {selectedAction.title}
                </p>
              </div>
              <button
                className="btn icon-btn"
                onClick={() => {
                  setModalMode(null);
                  setSelectedAction(null);
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: "13.5px", lineHeight: 1.5 }}>
              {modalMode === "approve" ? (
                <p style={{ margin: 0 }}>
                  Approving this action validates stakeholder consensus and marks it ready for execution across operational workflows.
                </p>
              ) : (
                <p style={{ margin: 0 }}>
                  Executing this action will record an operational mutation in the Themistocles Activity Stream and apply the resolved policy across systems.
                </p>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, marginBottom: 6 }}>
                Execution Rationale / Verification Notes
              </label>
              <textarea
                rows={3}
                value={execResultNotes}
                onChange={(e) => setExecResultNotes(e.target.value)}
                placeholder="Detail verification results, ticket IDs, or change notes..."
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
              <button
                className="btn"
                onClick={() => {
                  setModalMode(null);
                  setSelectedAction(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn primary"
                onClick={() =>
                  handleActionTransition(
                    selectedAction,
                    modalMode === "approve" ? "approved" : "executed",
                    execResultNotes,
                  )
                }
              >
                {modalMode === "approve" ? "Confirm Approval" : "Confirm Execution"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
