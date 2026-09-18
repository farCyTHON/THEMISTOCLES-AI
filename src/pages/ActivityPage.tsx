import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ActivityItem } from "../components/ui/ActivityItem";
import { EmptyState } from "../components/ui/EmptyState";
import { entityPath } from "../lib/format";
import { useKnowledge } from "../state/knowledgeContext";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "decision", label: "Decisions" },
  { key: "change", label: "Changes" },
  { key: "project", label: "Projects" },
  { key: "person", label: "People" },
  { key: "process", label: "Processes" },
];

export function ActivityPage() {
  const { state } = useKnowledge();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return state.activities;
    if (filter === "change") {
      return state.activities.filter(
        (a) => a.activityType?.toLowerCase().includes("change") || a.activityType?.toLowerCase().includes("ownership"),
      );
    }
    return state.activities.filter((a) => a.entityKind === filter);
  }, [filter, state.activities]);

  return (
    <main className="page">
      <header className="page-header">
        <h2>Activity Stream</h2>
        <p>What has happened inside the organization — decisions, changes, and connections that Themistocles has detected.</p>
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

      <section className="section">
        {filtered.length ? (
          <div className="card list">
            {filtered.map((item) => (
              <ActivityItem
                key={item.id}
                title={item.title}
                detail={item.detail}
                occurredAt={item.occurredAt}
                sourceLabel={item.sourceLabel}
                activityType={item.activityType}
                actorName={item.actorName}
                impactLevel={item.impactLevel}
                isFresh={item.id === state.freshActivityId}
                onClick={() => navigate(entityPath(item.entityKind, item.entityId))}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No activity found"
            body="No organizational events match this filter."
          />
        )}
      </section>
    </main>
  );
}

