import { Link, useNavigate } from "react-router-dom";
import { ActivityItem } from "../components/ui/ActivityItem";
import { searchSuggestions } from "../lib/search";
import { useShellActions } from "../components/layout/shellActions";
import { entityPath, greetingForHour } from "../lib/format";
import { useKnowledge } from "../state/knowledgeContext";
import { EmptyState } from "../components/ui/EmptyState";

export function HomePage() {
  const { state } = useKnowledge();
  const { openSearch } = useShellActions();
  const navigate = useNavigate();
  const user = state.people.find((person) => person.id === state.currentUserId);
  const greeting = greetingForHour(new Date().getHours());

  const openConflicts = state.conflicts.filter((c) => c.status !== "resolved");
  const unverifiedDecisions = state.decisions.filter((d) => d.evidenceIds.length === 0);

  return (
    <main className="page">
      <section className="home-hero">
        <h2>{`${greeting}, ${user?.name.split(" ")[0]}.`}</h2>
        <p>Here's what your organization knows today.</p>
        <div className="search-box">
          <input
            placeholder="Ask your organization..."
            readOnly
            onFocus={() => openSearch()}
            onClick={() => openSearch()}
            aria-label="Ask your organization"
          />
          <div className="suggestions">
            {searchSuggestions(state.mutationApplied).map((item) => (
              <button key={item} className="chip" onClick={() => openSearch(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Phase 2: Knowledge Status & Ask Memory Widget */}
      <section className="section">
        <div
          className="card"
          style={{
            padding: "16px 20px",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <span className="tiny" style={{ textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700 }}>
                Organizational Memory Status
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4, flexWrap: "wrap", fontSize: "13.5px" }}>
                {openConflicts.length > 0 ? (
                  <Link
                    to="/conflicts"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      color: "var(--danger)",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <span className="dot" style={{ backgroundColor: "var(--danger)" }} />
                    {openConflicts.length} active conflict{openConflicts.length !== 1 ? "s" : ""} detected
                  </Link>
                ) : (
                  <span style={{ color: "var(--success)", fontWeight: 500 }}>
                    ✓ 0 unresolved conflicts
                  </span>
                )}
                <span style={{ color: "var(--border-strong)" }}>·</span>
                {unverifiedDecisions.length && unverifiedDecisions[0] ? (
                  <Link
                    to={`/knowledge/decisions/${unverifiedDecisions[0].id}`}
                    style={{ color: "var(--warning)", textDecoration: "none", fontWeight: 500 }}
                  >
                    {unverifiedDecisions.length} decision needs evidence
                  </Link>
                ) : (
                  <span>All decisions verified</span>
                )}
                <span style={{ color: "var(--border-strong)" }}>·</span>
                <Link to="/knowledge/health" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
                  Inspect Knowledge Health →
                </Link>
              </div>
            </div>

            <button
              className="btn primary"
              onClick={() => navigate("/chat")}
              style={{ fontSize: "13px" }}
            >
              Ask Themistocles Memory →
            </button>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="tiny" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
              Quick Memory Queries:
            </span>
            <button
              className="chip"
              onClick={() => navigate(`/chat?prompt=${encodeURIComponent("Why did our pricing change?")}`)}
            >
              Why did our pricing change?
            </button>
            <button
              className="chip"
              onClick={() => navigate(`/chat?prompt=${encodeURIComponent("What changed this week?")}`)}
            >
              What changed this week?
            </button>
            <button
              className="chip"
              onClick={() => navigate(`/chat?prompt=${encodeURIComponent("Show unresolved organizational conflicts")}`)}
            >
              Show unresolved conflicts
            </button>
          </div>
        </div>
      </section>

      {/* Phase 3: Attention & Operational Pulse */}
      <section className="section">
        <div className="section-head">
          <h3>Attention & Operational Pulse</h3>
          <Link to="/actions">Action Center →</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {/* Pending Actions & Conflicts */}
          <div
            className="card"
            style={{
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              borderLeft: "3px solid var(--warning)",
            }}
          >
            <span
              className="tiny"
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 700,
                color: "var(--warning)",
              }}
            >
              What Needs Attention
            </span>

            {(() => {
              const pendingActions = state.actions.filter(
                (a) => a.status === "proposed" || a.status === "under-review",
              );
              const urgentActions = state.actions.filter(
                (a) =>
                  (a.priority === "urgent" || a.priority === "high") &&
                  a.status !== "executed" &&
                  a.status !== "dismissed",
              );
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {urgentActions.length > 0 ? (
                    <Link
                      to="/actions"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 10px",
                        backgroundColor: "var(--danger-soft)",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--danger)",
                        textDecoration: "none",
                      }}
                    >
                      <span className="dot" style={{ backgroundColor: "var(--danger)" }} />
                      {urgentActions.length} high-priority action{urgentActions.length !== 1 ? "s" : ""} require immediate attention
                    </Link>
                  ) : null}

                  {pendingActions.length > 0 ? (
                    <Link
                      to="/actions"
                      style={{
                        padding: "8px 10px",
                        backgroundColor: "var(--bg)",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: "var(--text)",
                        textDecoration: "none",
                      }}
                    >
                      <strong>{pendingActions.length} pending</strong> action{pendingActions.length !== 1 ? "s" : ""} awaiting review or approval
                    </Link>
                  ) : (
                    <span style={{ fontSize: "13px", color: "var(--success)" }}>✓ No pending actions</span>
                  )}

                  {openConflicts.length > 0 ? (
                    <Link
                      to="/conflicts"
                      style={{
                        padding: "8px 10px",
                        backgroundColor: "var(--bg)",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: "var(--danger)",
                        fontWeight: 500,
                        textDecoration: "none",
                      }}
                    >
                      {openConflicts.length} unresolved organizational conflict{openConflicts.length !== 1 ? "s" : ""}
                    </Link>
                  ) : null}
                </div>
              );
            })()}
          </div>

          {/* Sentinel Watch */}
          <div
            className="card"
            style={{
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              borderLeft: "3px solid var(--accent)",
            }}
          >
            <span
              className="tiny"
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              Sentinel Watch
            </span>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {state.agents.map((ag) => (
                <Link
                  key={ag.id}
                  to={`/agents/${ag.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    backgroundColor: "var(--bg)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    textDecoration: "none",
                    color: "var(--text)",
                  }}
                >
                  <div>
                    <strong>{ag.name}</strong>
                    <div className="tiny" style={{ color: "var(--text-secondary)" }}>
                      {ag.role}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "2px 7px",
                      borderRadius: "4px",
                      backgroundColor: ag.findingsCount > 0 ? "var(--warning-soft)" : "var(--success-soft)",
                      color: ag.findingsCount > 0 ? "var(--warning)" : "var(--success)",
                    }}
                  >
                    {ag.findingsCount > 0 ? `${ag.findingsCount} finding${ag.findingsCount !== 1 ? "s" : ""}` : "Clear"}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Action Triggers */}
          <div
            className="card"
            style={{
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              borderLeft: "3px solid var(--success)",
            }}
          >
            <span
              className="tiny"
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 700,
                color: "var(--success)",
              }}
            >
              What Can I Do Next?
            </span>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                className="btn"
                style={{ justifyContent: "flex-start", fontSize: "13px" }}
                onClick={() => navigate(`/chat?prompt=${encodeURIComponent("What should I review today?")}`)}
              >
                Ask Memory: "What should I review today?"
              </button>
              <button
                className="btn"
                style={{ justifyContent: "flex-start", fontSize: "13px" }}
                onClick={() => navigate("/actions")}
              >
                Review Pending Actions →
              </button>
              <button
                className="btn"
                style={{ justifyContent: "flex-start", fontSize: "13px" }}
                onClick={() => navigate("/artifacts")}
              >
                Browse Living Artifacts →
              </button>
              <button
                className="btn"
                style={{ justifyContent: "flex-start", fontSize: "13px" }}
                onClick={() => navigate("/workspace")}
              >
                Open Workspace View →
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>What changed recently</h3>
          <Link to="/pulse">View organizational pulse →</Link>
        </div>
        <div className="stats">
          <article className="card stat">
            <strong>{state.changes.length}</strong>
            <span>Changes tracked</span>
          </article>
          <article className="card stat">
            <strong>{state.decisions.filter((d) => d.status === "active").length}</strong>
            <span>Active decisions</span>
          </article>
          <article className="card stat">
            <strong>{state.activities.filter((a) => a.impactLevel === "high").length}</strong>
            <span>High-impact items</span>
          </article>
          <article className="card stat">
            <strong>{state.projects.filter((p) => p.status === "active").length}</strong>
            <span>Active projects</span>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>Recent changes</h3>
          <Link to="/activity">View activity</Link>
        </div>
        {state.activities.length ? (
          <div className="card list">
            {state.activities.slice(0, 4).map((item) => (
              <ActivityItem
                key={item.id}
                title={item.title}
                detail={item.detail}
                occurredAt={item.occurredAt}
                isFresh={item.id === state.freshActivityId}
                onClick={() => navigate(entityPath(item.entityKind, item.entityId))}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No recent changes"
            body="Your organization's memory is currently up to date."
          />
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h3>Connected sources</h3>
          <Link to="/sources">Manage</Link>
        </div>
        <div className="source-row">
          {state.sources.map((source) => (
            <Link to={entityPath("source", source.id)} className="card source-card clickable" key={source.id}>
              <h4>{source.name}</h4>
              <p>{source.location}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
