import { Link, Navigate, useParams } from "react-router-dom";
import { EntityBadge } from "../components/ui/EntityBadge";
import { useKnowledge } from "../state/knowledgeContext";
import { entityName } from "../lib/lookup";
import { entityPath, formatDate, kindLabel } from "../lib/format";

export function EntityPage() {
  const { kind, id } = useParams();
  const { state } = useKnowledge();
  if (!kind || !id) return <Navigate to="/knowledge" replace />;

  if (kind === "person") {
    const person = state.people.find((item) => item.id === id);
    if (!person) return <Navigate to="/knowledge" replace />;
    const team = state.teams.find((item) => item.id === person.teamId);
    const related = state.processes.filter((item) => item.ownerPersonId === person.id);
    return (
      <EntityLayout kind="person" title={person.name} crumbs={person.name}>
        <dl className="kv">
          <dt>Role</dt>
          <dd>{person.role}</dd>
          <dt>Team</dt>
          <dd>{team ? <Link to={entityPath("team", team.id)}>{team.name}</Link> : "—"}</dd>
          <dt>Email</dt>
          <dd>{person.email}</dd>
        </dl>
        <RelatedProcesses items={related} />
      </EntityLayout>
    );
  }

  if (kind === "team") {
    const team = state.teams.find((item) => item.id === id);
    if (!team) return <Navigate to="/knowledge" replace />;
    const members = state.people.filter((item) => item.teamId === team.id);
    const owned = [
      ...state.processes.filter((item) => item.ownerTeamId === team.id),
      ...state.systems.filter((item) => item.ownerTeamId === team.id),
    ];
    return (
      <EntityLayout kind="team" title={team.name} crumbs={team.name}>
        <p className="muted">{team.description}</p>
        <div className="section-head">
          <h3>People</h3>
        </div>
        <ul className="rel-list">
          {members.map((member) => (
            <li key={member.id}>
              <Link to={entityPath("person", member.id)}>{member.name}</Link>
            </li>
          ))}
        </ul>
        <div className="section-head">
          <h3>Owns</h3>
        </div>
        <ul className="rel-list">
          {owned.map((item) => (
            <li key={item.id}>
              <Link to={"currentVersion" in item ? entityPath("process", item.id) : entityPath("system", item.id)}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </EntityLayout>
    );
  }

  if (kind === "system") {
    const system = state.systems.find((item) => item.id === id);
    if (!system) return <Navigate to="/knowledge" replace />;
    const owner = state.teams.find((item) => item.id === system.ownerTeamId);
    const previous = system.previousOwnerTeamId
      ? state.teams.find((item) => item.id === system.previousOwnerTeamId)
      : undefined;
    const relatedProcesses = state.processes.filter((item) =>
      item.relationships.some((rel) => rel.targetId === system.id),
    );
    return (
      <EntityLayout kind="system" title={system.name} crumbs={system.name}>
        <p className="muted">{system.description}</p>
        <dl className="kv">
          <dt>Owner</dt>
          <dd>{owner ? <Link to={entityPath("team", owner.id)}>{owner.name}</Link> : "—"}</dd>
          {previous ? (
            <>
              <dt>Previous owner</dt>
              <dd>
                {previous.name}
                {system.id === "sys-api" ? " (shown in activity as Platform → Infrastructure)" : ""}
              </dd>
            </>
          ) : null}
        </dl>
        <RelatedProcesses items={relatedProcesses} />
      </EntityLayout>
    );
  }

  if (kind === "source") {
    const source = state.sources.find((item) => item.id === id);
    if (!source) return <Navigate to="/knowledge" replace />;
    const linked = state.evidence.filter((item) => item.sourceId === source.id);
    return (
      <EntityLayout kind="source" title={source.name} crumbs={source.location}>
        <dl className="kv">
          <dt>Location</dt>
          <dd>{source.location}</dd>
          <dt>Status</dt>
          <dd>{source.connected ? "Connected" : "Disconnected"}</dd>
          <dt>Last synced</dt>
          <dd>{formatDate(source.lastSynced)}</dd>
        </dl>
        <div className="section-head">
          <h3>Evidence from this source</h3>
        </div>
        <ul className="rel-list">
          {linked.map((item) => (
            <li key={item.id}>
              <Link to={entityPath(item.relatedKind, item.relatedId)}>
                {entityName(state, item.relatedKind, item.relatedId)}
              </Link>
              <div className="tiny">“{item.quote}”</div>
            </li>
          ))}
        </ul>
      </EntityLayout>
    );
  }

  if (kind === "project") {
    const project = state.projects.find((item) => item.id === id);
    if (!project) return <Navigate to="/knowledge" replace />;
    const ownerTeam = state.teams.find((item) => item.id === project.ownerTeamId);
    const relatedSystems = state.systems.filter((item) => item.ownerTeamId === project.ownerTeamId);
    const relatedProcesses = state.processes.filter((item) => item.ownerTeamId === project.ownerTeamId);
    return (
      <EntityLayout kind="project" title={project.name} crumbs={project.name}>
        <p className="muted">{project.description}</p>
        <dl className="kv">
          <dt>Owner</dt>
          <dd>{ownerTeam ? <Link to={entityPath("team", ownerTeam.id)}>{ownerTeam.name}</Link> : "—"}</dd>
        </dl>
        {relatedSystems.length ? (
          <>
            <div className="section-head">
              <h3>Related systems</h3>
            </div>
            <ul className="rel-list">
              {relatedSystems.map((item) => (
                <li key={item.id}>
                  <Link to={entityPath("system", item.id)}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <RelatedProcesses items={relatedProcesses} />
      </EntityLayout>
    );
  }

  return <Navigate to="/knowledge" replace />;
}

function EntityLayout({
  kind,
  title,
  crumbs,
  children,
}: {
  kind: string;
  title: string;
  crumbs: string;
  children: React.ReactNode;
}) {
  return (
    <main className="page">
      <div className="crumbs">
        <Link to="/knowledge">Knowledge</Link>
        <span>/</span>
        <span>{crumbs}</span>
      </div>
      <header className="page-header">
        <EntityBadge kind={kind} label={kindLabel(kind)} />
        <h2>{title}</h2>
      </header>
      <section className="section">{children}</section>
    </main>
  );
}

function RelatedProcesses({
  items,
}: {
  items: { id: string; name: string }[];
}) {
  if (!items.length) return null;
  return (
    <>
      <div className="section-head">
        <h3>Related processes</h3>
      </div>
      <ul className="rel-list">
        {items.map((item) => (
          <li key={item.id}>
            <Link to={entityPath("process", item.id)}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
