import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { EntityBadge } from "../components/ui/EntityBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { useKnowledge } from "../state/knowledgeContext";
import { formatDate } from "../lib/format";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "policy", label: "Policy" },
  { key: "decision", label: "Decisions" },
  { key: "process", label: "Processes" },
  { key: "project", label: "Projects" },
  { key: "ownership", label: "Ownership" },
];

export function ChangesPage() {
  const { state } = useKnowledge();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    const sorted = state.changes
      .slice()
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
    if (filter === "all") return sorted;
    return sorted.filter((c) => c.changeType === filter);
  }, [filter, state.changes]);

  return (
    <main className="page">
      <header className="page-header">
        <h2>Change Intelligence</h2>
        <p>Meaningful changes that affect organizational context — what changed, why, and what was affected.</p>
      </header>

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`chip ${filter === f.key ? "active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="stack" style={{ marginTop: 20 }}>
          {filtered.map((change) => {
            const actor = state.people.find((p) => p.id === change.actorPersonId);
            return (
              <button
                key={change.id}
                className="card change-card"
                onClick={() => navigate(`/changes/${change.id}`)}
              >
                <div className="change-card-header">
                  <EntityBadge kind="change" label={change.changeType} />
                  <time className="tiny" dateTime={change.changedAt}>
                    {formatDate(change.changedAt)}
                  </time>
                </div>
                <h4>{change.title}</h4>
                <p className="muted">{change.description}</p>
                <div className="change-state-row">
                  <span className="change-prev">{change.previousState}</span>
                  <span className="change-arrow" aria-hidden>→</span>
                  <span className="change-curr">{change.currentState}</span>
                </div>
                <div className="tiny" style={{ marginTop: 8 }}>
                  {actor ? `${actor.name} · ` : ""}
                  {change.affectedEntities.length} affected area{change.affectedEntities.length !== 1 ? "s" : ""}
                  {change.decisionId
                    ? ` · Decision #${state.decisions.find((d) => d.id === change.decisionId)?.number ?? ""}`
                    : ""}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No changes detected."
          body="New organizational changes will appear here as Themistocles detects them."
        />
      )}
    </main>
  );
}
