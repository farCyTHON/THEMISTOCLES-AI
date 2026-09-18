import { useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { EntityBadge } from "../components/ui/EntityBadge";
import { ActivityItem as ActivityItemComponent } from "../components/ui/ActivityItem";
import { useKnowledge } from "../state/knowledgeContext";
import { entityPath, formatDate } from "../lib/format";

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  planning: "Planning",
  completed: "Completed",
  "on-hold": "On hold",
};

export function ProjectDetailPage() {
  const { id } = useParams();
  const { state, dispatch } = useKnowledge();
  const navigate = useNavigate();
  const project = state.projects.find((p) => p.id === id);
  const [view, setView] = useState<string | null>(null);
  if (!project) return <Navigate to="/projects" replace />;

  const ownerTeam = state.teams.find((t) => t.id === project.ownerTeamId);
  const ownerPerson = state.people.find((p) => p.id === project.ownerPersonId);
  const decisions = state.decisions.filter(
    (d) => project.decisionIds?.includes(d.id),
  );
  const processes = state.processes.filter(
    (p) => project.processIds?.includes(p.id),
  );
  const people = state.people.filter(
    (p) =>
      p.id === project.ownerPersonId ||
      p.teamId === project.ownerTeamId,
  );
  const activities = state.activities
    .filter(
      (a) =>
        (a.entityKind === "project" && a.entityId === project.id) ||
        project.decisionIds?.includes(a.entityId) ||
        project.processIds?.includes(a.entityId),
    )
    .slice(0, 8);

  const watcher = state.watchers.find((w) => w.targetId === project.id);
  const isWatched = watcher ? watcher.isWatched : false;

  return (
    <main className="page">
      <div className="crumbs">
        <Link to="/knowledge">Knowledge</Link>
        <span>/</span>
        <Link to="/projects">Projects</Link>
        <span>/</span>
        <span>{project.name}</span>
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
          <EntityBadge kind="project" label="Project" />
          <h2>{project.name}</h2>
          <p>{project.description}</p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {watcher ? (
            <button
              className={`btn ${isWatched ? "active" : ""}`}
              onClick={() => dispatch({ type: "toggle-watcher", id: watcher.id })}
            >
              {isWatched ? "★ Watching Topic" : "☆ Watch Topic"}
            </button>
          ) : null}
          <button
            className="btn primary"
            onClick={() =>
              navigate(
                `/chat?contextKind=project&contextId=${project.id}&prompt=${encodeURIComponent(
                  `What decisions, processes, and people affect ${project.name}?`,
                )}`,
              )
            }
          >
            Ask Memory about this project →
          </button>
        </div>
      </header>

      <section className="meta-block">
        <dl className="kv">
          <dt>Status</dt>
          <dd>{STATUS_LABELS[project.status ?? "active"]}</dd>
          <dt>Owner</dt>
          <dd>
            {ownerTeam ? (
              <Link to={entityPath("team", ownerTeam.id)}>{ownerTeam.name}</Link>
            ) : null}
            {ownerPerson ? (
              <>
                {" · "}
                <Link to={entityPath("person", ownerPerson.id)}>{ownerPerson.name}</Link>
              </>
            ) : null}
          </dd>
          {project.lastUpdated ? (
            <>
              <dt>Last updated</dt>
              <dd>{formatDate(project.lastUpdated)}</dd>
            </>
          ) : null}
          <dt>Decisions</dt>
          <dd>{decisions.length}</dd>
          <dt>Signals</dt>
          <dd>{project.signalCount ?? 0}</dd>
        </dl>
        <div className="actions">
          <button
            className={`btn ${view === "decisions" ? "primary" : ""}`}
            onClick={() => setView(view === "decisions" ? null : "decisions")}
          >
            Decisions ({decisions.length})
          </button>
          <button
            className={`btn ${view === "people" ? "primary" : ""}`}
            onClick={() => setView(view === "people" ? null : "people")}
          >
            People ({people.length})
          </button>
          <button
            className={`btn ${view === "activity" ? "primary" : ""}`}
            onClick={() => setView(view === "activity" ? null : "activity")}
          >
            Activity ({activities.length})
          </button>
          <button
            className={`btn ${view === "processes" ? "primary" : ""}`}
            onClick={() => setView(view === "processes" ? null : "processes")}
          >
            Processes ({processes.length})
          </button>
        </div>
      </section>

      {view === "decisions" ? (
        <section className="section">
          <div className="section-head">
            <h3>Decisions</h3>
            <button className="link" onClick={() => setView(null)}>Hide</button>
          </div>
          <ul className="rel-list">
            {decisions.map((d) => (
              <li key={d.id}>
                <Link to={entityPath("decision", d.id)}>Decision #{d.number}</Link>
                <span className="tiny">{d.title} · {formatDate(d.date)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {view === "people" ? (
        <section className="section">
          <div className="section-head">
            <h3>People</h3>
            <button className="link" onClick={() => setView(null)}>Hide</button>
          </div>
          <ul className="rel-list">
            {people.map((p) => (
              <li key={p.id}>
                <Link to={entityPath("person", p.id)}>{p.name}</Link>
                <span className="tiny">{p.role}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {view === "activity" ? (
        <section className="section">
          <div className="section-head">
            <h3>Activity</h3>
            <button className="link" onClick={() => setView(null)}>Hide</button>
          </div>
          <div className="card list">
            {activities.map((item) => (
              <ActivityItemComponent
                key={item.id}
                title={item.title}
                detail={item.detail}
                occurredAt={item.occurredAt}
                isFresh={item.id === state.freshActivityId}
                onClick={() => navigate(entityPath(item.entityKind, item.entityId))}
              />
            ))}
          </div>
        </section>
      ) : null}

      {view === "processes" ? (
        <section className="section">
          <div className="section-head">
            <h3>Processes</h3>
            <button className="link" onClick={() => setView(null)}>Hide</button>
          </div>
          <ul className="rel-list">
            {processes.map((p) => (
              <li key={p.id}>
                <Link to={entityPath("process", p.id)}>{p.name}</Link>
                <span className="tiny">{p.currentVersion} · {p.recentChange}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
