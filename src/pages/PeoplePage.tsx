import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { EntityBadge } from "../components/ui/EntityBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { useKnowledge } from "../state/knowledgeContext";
import { entityPath } from "../lib/format";

export function PeoplePage() {
  const { state } = useKnowledge();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return state.people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        (p.department ?? "").toLowerCase().includes(q),
    );
  }, [query, state.people]);

  return (
    <main className="page">
      <header className="page-header">
        <h2>People</h2>
        <p>Organizational context around people — their projects, decisions, and connections.</p>
      </header>
      <div className="filter">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people..."
          aria-label="Search people"
        />
      </div>
      {filtered.length ? (
        <div className="grid-cards">
          {filtered.map((person) => {
            const team = state.teams.find((t) => t.id === person.teamId);
            const decisionCount = state.decisions.filter(
              (d) => d.personIds?.includes(person.id),
            ).length;
            const activityCount = state.activities.filter(
              (a) => a.actorName === person.name || (a.entityKind === "person" && a.entityId === person.id),
            ).length;
            const connectionCount =
              state.processes.filter((p) => p.ownerPersonId === person.id).length +
              state.projects.filter((p) => p.ownerPersonId === person.id).length +
              decisionCount;

            return (
              <Link
                key={person.id}
                to={entityPath("person", person.id)}
                className="card entity-card clickable"
              >
                <EntityBadge kind="person" label="Person" />
                <h4>{person.name}</h4>
                <p>{person.role}</p>
                {person.department || team ? (
                  <p className="tiny" style={{ marginTop: 4 }}>
                    {person.department} {team ? `· ${team.name}` : ""}
                  </p>
                ) : null}
                <div className="tiny" style={{ marginTop: 8, display: "flex", gap: 12 }}>
                  <span>{decisionCount} decision{decisionCount !== 1 ? "s" : ""}</span>
                  <span>{activityCount} activit{activityCount !== 1 ? "ies" : "y"}</span>
                  <span>{connectionCount} connection{connectionCount !== 1 ? "s" : ""}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No people found." body="Try a broader search." />
      )}
    </main>
  );
}
