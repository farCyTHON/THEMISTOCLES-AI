import { Link, useNavigate } from "react-router-dom";
import { useKnowledge } from "../../state/knowledgeContext";
import { EntityBadge } from "../ui/EntityBadge";
import { entityPath } from "../../lib/format";

export function WatchersSection() {
  const { state, dispatch } = useKnowledge();
  const navigate = useNavigate();

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h3>Contextual Topic Watchers</h3>
          <p className="tiny" style={{ color: "var(--text-secondary)", margin: "2px 0 0" }}>
            Monitored areas of organizational memory tracking ongoing shifts, signals, and policy health.
          </p>
        </div>
      </div>

      <div className="grid-cards">
        {state.watchers.map((watcher) => {
          const targetUrl = entityPath(watcher.targetKind, watcher.targetId);
          const decision = watcher.relatedDecisionId
            ? state.decisions.find((d) => d.id === watcher.relatedDecisionId)
            : undefined;

          return (
            <article
              key={watcher.id}
              className="card"
              style={{
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                opacity: watcher.isWatched ? 1 : 0.75,
                borderTop: watcher.isWatched ? "3px solid var(--accent)" : "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <EntityBadge kind={watcher.targetKind} label={watcher.targetKind} />
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: watcher.isWatched ? "var(--accent-soft)" : "var(--surface-2)",
                        color: watcher.isWatched ? "var(--accent)" : "var(--text-secondary)",
                      }}
                    >
                      {watcher.isWatched ? "Watching" : "Paused"}
                    </span>
                  </div>
                  <h4 style={{ margin: "2px 0 0", fontSize: "15px" }}>
                    <Link to={targetUrl} style={{ textDecoration: "none", color: "var(--text)" }}>
                      {watcher.topic}
                    </Link>
                  </h4>
                </div>

                <button
                  className={`btn ${watcher.isWatched ? "active" : ""}`}
                  onClick={() => dispatch({ type: "toggle-watcher", id: watcher.id })}
                  style={{ fontSize: "12px", padding: "4px 8px" }}
                >
                  {watcher.isWatched ? "★ Watched" : "☆ Watch"}
                </button>
              </div>

              <div>
                <span className="tiny" style={{ color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Status Indicator
                </span>
                <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500 }}>
                  {watcher.status}
                </p>
              </div>

              <div>
                <span className="tiny" style={{ color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Last Recorded Mutation
                </span>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "var(--text-secondary)" }}>
                  {watcher.lastChange}
                </p>
              </div>

              <div>
                <span className="tiny" style={{ color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Recent Ingested Signals
                </span>
                <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: "12px", color: "var(--text)", display: "flex", flexDirection: "column", gap: 3 }}>
                  {watcher.recentSignals.map((sig, sIdx) => (
                    <li key={sIdx}>{sig}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)" }}>
                {decision ? (
                  <Link to={`/knowledge/decisions/${decision.id}`} className="tiny" style={{ fontWeight: 600 }}>
                    Decision #{decision.number} →
                  </Link>
                ) : <span />}

                <button
                  className="tiny"
                  onClick={() =>
                    navigate(
                      `/chat?contextKind=${watcher.targetKind}&contextId=${watcher.targetId}&prompt=${encodeURIComponent(
                        `What are the recent signals and status updates for ${watcher.topic}?`,
                      )}`,
                    )
                  }
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Ask Memory →
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
