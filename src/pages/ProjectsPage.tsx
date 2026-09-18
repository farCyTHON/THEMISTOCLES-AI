import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { EntityBadge } from "../components/ui/EntityBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { useKnowledge } from "../state/knowledgeContext";
import { entityPath, formatDate } from "../lib/format";

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  planning: "Planning",
  completed: "Completed",
  "on-hold": "On hold",
};

export function ProjectsPage() {
  const { state } = useKnowledge();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return state.projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [query, state.projects]);

  return (
    <main className="page">
      <header className="page-header">
        <h2>Projects</h2>
        <p>First-class organizational entities — with decisions, people, and processes connected.</p>
      </header>
      <div className="filter">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects..."
          aria-label="Search projects"
        />
      </div>
      {filtered.length ? (
        <div className="grid-cards">
          {filtered.map((project) => {
            const owner = state.people.find((p) => p.id === project.ownerPersonId);
            const decisionCount = project.decisionIds?.length ?? 0;
            const processCount = project.processIds?.length ?? 0;

            return (
              <Link
                key={project.id}
                to={entityPath("project", project.id)}
                className="card entity-card clickable"
              >
                <EntityBadge kind="project" label="Project" />
                <h4>{project.name}</h4>
                <p>{project.description}</p>
                <div className="tiny" style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  <span>
                    <strong>{STATUS_LABELS[project.status ?? "active"]}</strong>
                    {owner ? ` · ${owner.name}` : ""}
                  </span>
                  <span>
                    {decisionCount} decision{decisionCount !== 1 ? "s" : ""}
                    {" · "}
                    {project.signalCount ?? 0} signal{(project.signalCount ?? 0) !== 1 ? "s" : ""}
                    {" · "}
                    {processCount} process{processCount !== 1 ? "es" : ""}
                  </span>
                  {project.lastUpdated ? (
                    <span>Updated {formatDate(project.lastUpdated)}</span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No projects found." body="Try a broader search." />
      )}
    </main>
  );
}
