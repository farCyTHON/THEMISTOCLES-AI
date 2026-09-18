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
