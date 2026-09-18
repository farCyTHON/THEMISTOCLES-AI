import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { EntityBadge } from "../components/ui/EntityBadge";
import { ActivityItem as ActivityItemComponent } from "../components/ui/ActivityItem";
import { useKnowledge } from "../state/knowledgeContext";
import { entityPath } from "../lib/format";

export function PersonDetailPage() {
  const { id } = useParams();
  const { state } = useKnowledge();
  const navigate = useNavigate();
  const person = state.people.find((p) => p.id === id);
  if (!person) return <Navigate to="/people" replace />;

  const team = state.teams.find((t) => t.id === person.teamId);
  const connectedProjects = state.projects.filter(
    (p) =>
      p.ownerPersonId === person.id ||
      p.ownerTeamId === person.teamId,
  );
  const connectedDecisions = state.decisions.filter(
    (d) => d.personIds?.includes(person.id),
  );
  const recentActivity = state.activities
    .filter(
      (a) =>
        a.actorName === person.name ||
        (a.entityKind === "person" && a.entityId === person.id),
    )
    .slice(0, 5);
  const relatedPeople = state.people.filter(
    (p) => p.id !== person.id && p.teamId === person.teamId,
  );

  return (
    <main className="page">
      <div className="crumbs">
        <Link to="/people">People</Link>
        <span>/</span>
        <span>{person.name}</span>
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
          <EntityBadge kind="person" label="Person" />
          <h2>{person.name}</h2>
          <p>{person.role}{person.department ? ` · ${person.department}` : ""}</p>
        </div>

        <button
          className="btn primary"
          onClick={() =>
            navigate(
              `/chat?contextKind=person&contextId=${person.id}&prompt=${encodeURIComponent(
                `What decisions, processes, and projects is ${person.name} involved in?`,
              )}`,
            )
          }
        >
          Ask Memory about {person.name.split(" ")[0]} →
        </button>
      </header>

      <section className="meta-block">
        <dl className="kv">
          <dt>Role</dt>
          <dd>{person.role}</dd>
          <dt>Team</dt>
          <dd>
            {team ? (
              <Link to={entityPath("team", team.id)}>{team.name}</Link>
            ) : (
              "—"
            )}
          </dd>
          {person.department ? (
            <>
              <dt>Department</dt>
              <dd>{person.department}</dd>
            </>
          ) : null}
          <dt>Email</dt>
          <dd>{person.email}</dd>
        </dl>
      </section>

      {connectedProjects.length ? (
        <section className="section">
          <div className="section-head">
            <h3>Connected projects</h3>
          </div>
          <ul className="rel-list">
            {connectedProjects.map((project) => (
              <li key={project.id}>
                <Link to={entityPath("project", project.id)}>
                  {project.name}
                </Link>
                <span className="tiny">
                  {project.status ?? "active"} · {project.ownerPersonId === person.id ? "Owner" : "Team member"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {connectedDecisions.length ? (
        <section className="section">
          <div className="section-head">
            <h3>Connected decisions</h3>
          </div>
          <ul className="rel-list">
            {connectedDecisions.map((decision) => (
              <li key={decision.id}>
                <Link to={entityPath("decision", decision.id)}>
                  Decision #{decision.number}
                </Link>
                <span className="tiny">{decision.title}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {recentActivity.length ? (
        <section className="section">
          <div className="section-head">
            <h3>Recent activity</h3>
          </div>
          <div className="card list">
            {recentActivity.map((item) => (
              <ActivityItemComponent
                key={item.id}
                title={item.title}
                detail={item.detail}
                occurredAt={item.occurredAt}
                isFresh={item.id === state.freshActivityId}
                onClick={() =>
                  navigate(entityPath(item.entityKind, item.entityId))
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {relatedPeople.length ? (
        <section className="section">
          <div className="section-head">
            <h3>Related people</h3>
          </div>
          <ul className="rel-list">
            {relatedPeople.map((p) => (
              <li key={p.id}>
                <Link to={entityPath("person", p.id)}>{p.name}</Link>
                <span className="tiny">{p.role}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
