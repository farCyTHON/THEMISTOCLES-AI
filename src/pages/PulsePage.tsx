import { Link, useNavigate } from "react-router-dom";
import { ActivityItem as ActivityItemComponent } from "../components/ui/ActivityItem";
import { WatchersSection } from "../components/knowledge/WatchersSection";
import { useKnowledge } from "../state/knowledgeContext";
import { entityPath, formatRelativeTime } from "../lib/format";

export function PulsePage() {
  const { state } = useKnowledge();
  const navigate = useNavigate();

  const importantChanges = state.changes
    .slice()
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
    .slice(0, 6);

  const highImpactActivities = state.activities
    .filter((a) => a.impactLevel === "high")
    .slice(0, 5);

  const unresolvedChanges = state.changes.filter((c) => !c.decisionId);
  const decisionsChanged = state.decisions.filter((d) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 30);
    return new Date(d.date) > oneWeekAgo;
  });
  const workflowsAffected = new Set(
    state.changes.flatMap((c) =>
      c.affectedEntities
        .filter((e) => e.kind === "process")
        .map((e) => e.id),
    ),
  );

  return (
    <main className="page">
      <header className="page-header">
        <h2>Organizational Pulse</h2>
        <p>See what changed across your organization and what requires attention.</p>
      </header>

      <div className="stats">
        <article className="card stat">
          <strong>{importantChanges.length}</strong>
          <span>Important changes</span>
        </article>
        <article className="card stat">
          <strong>{decisionsChanged.length}</strong>
          <span>Decisions changed</span>
        </article>
        <article className="card stat">
          <strong>{workflowsAffected.size}</strong>
          <span>Workflows affected</span>
        </article>
        <article className="card stat">
          <strong>{unresolvedChanges.length}</strong>
          <span>Unresolved items</span>
        </article>
      </div>

      <section className="section">
        <div className="section-head">
          <h3>Important changes</h3>
          <Link to="/changes">View all changes</Link>
        </div>
        <div className="card list">
          {importantChanges.map((change) => (
            <button
              key={change.id}
              className="activity clickable"
              onClick={() => navigate(`/changes/${change.id}`)}
            >
              <span className="dot" aria-hidden />
              <span>
                <strong>{change.title}</strong>
                <span>{change.description}</span>
                <span className="tiny">
                  {formatRelativeTime(change.changedAt)}
                  {change.decisionId ? ` · ${state.decisions.find((d) => d.id === change.decisionId)?.title ? `Decision #${state.decisions.find((d) => d.id === change.decisionId)?.number}` : ""}` : ""}
                  {change.affectedEntities.length ? ` · ${change.affectedEntities.length} affected` : ""}
                </span>
                {change.changeType === "policy" || change.changeType === "decision" ? (
                  <span className="badge decision" style={{ marginTop: 4 }}>High impact</span>
                ) : null}
              </span>
              <time dateTime={change.changedAt}>{formatRelativeTime(change.changedAt)}</time>
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>High-impact activity</h3>
          <Link to="/activity">View activity stream</Link>
        </div>
        {highImpactActivities.length ? (
          <div className="card list">
            {highImpactActivities.map((item) => (
              <ActivityItemComponent
                key={item.id}
                title={item.title}
                detail={item.detail}
                occurredAt={item.occurredAt}
                sourceLabel={item.sourceLabel}
                isFresh={item.id === state.freshActivityId}
                onClick={() => navigate(entityPath(item.entityKind, item.entityId))}
              />
            ))}
          </div>
        ) : (
          <div className="card empty">
            <p>No high-impact activity detected.</p>
            <p className="tiny">Organizational changes will appear here as Themistocles detects them.</p>
          </div>
        )}
      </section>

      <WatchersSection />
    </main>
  );
}
