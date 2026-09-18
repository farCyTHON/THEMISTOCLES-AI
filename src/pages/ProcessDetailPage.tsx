import { useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { EntityBadge } from "../components/ui/EntityBadge";
import { EvidenceCard } from "../components/ui/EvidenceCard";
import { VersionTimeline } from "../components/ui/VersionTimeline";
import { Modal } from "../components/ui/Modal";
import { WhyChanged } from "../components/knowledge/WhyChanged";
import { useKnowledge } from "../state/knowledgeContext";
import { entityName } from "../lib/lookup";
import { entityPath, formatDate } from "../lib/format";

export function ProcessDetailPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { state } = useKnowledge();
  const process = state.processes.find((item) => item.id === id);
  const [sourceNotice, setSourceNotice] = useState<string | null>(null);
  const view = params.get("view");
  const currentVersion = process?.history.find((item) => item.isCurrent) ?? process?.history.at(-1);
  const [selectedVersionId, setSelectedVersionId] = useState(currentVersion?.id);

  const selectedVersion = useMemo(
    () => process?.history.find((item) => item.id === selectedVersionId) ?? currentVersion,
    [process, selectedVersionId, currentVersion],
  );

  if (!process) return <Navigate to="/knowledge/processes" replace />;

  const ownerTeam = state.teams.find((item) => item.id === process.ownerTeamId);
  const ownerPerson = state.people.find((item) => item.id === process.ownerPersonId);
  const evidence = state.evidence.filter((item) => process.evidenceIds.includes(item.id));
  const previous = selectedVersion
    ? process.history[process.history.findIndex((item) => item.id === selectedVersion.id) - 1]
    : undefined;

  const setView = (next: string | null) => {
    const copy = new URLSearchParams(params);
    if (next) copy.set("view", next);
    else copy.delete("view");
    setParams(copy);
  };

  return (
    <main className="page">
      <div className="crumbs">
        <Link to="/knowledge">Knowledge</Link>
        <span>/</span>
        <Link to="/knowledge/processes">Processes</Link>
        <span>/</span>
        <span>{process.name}</span>
      </div>
      <header className="page-header">
        <EntityBadge kind="process" label="Process" />
        <h2>{process.name}</h2>
        <p>{process.description}</p>
      </header>

      <section className="meta-block">
        <dl className="kv">
          <dt>Current version</dt>
          <dd>{process.currentVersion}</dd>
          <dt>Owner</dt>
          <dd>
            {ownerTeam ? <Link to={entityPath("team", ownerTeam.id)}>{ownerTeam.name}</Link> : null}
            {ownerPerson ? (
              <>
                {" · "}
                <Link to={entityPath("person", ownerPerson.id)}>{ownerPerson.name}</Link>
              </>
            ) : null}
          </dd>
          <dt>Status</dt>
          <dd>{process.status === "current" ? "Current" : "Deprecated"}</dd>
          <dt>Last updated</dt>
          <dd>{formatDate(process.lastUpdated)}</dd>
          <dt>Recent change</dt>
          <dd>{process.recentChange}</dd>
        </dl>
        <div className="actions">
          <button className={`btn ${view === "why" ? "primary" : ""}`} onClick={() => setView("why")}>
            Why did this change?
          </button>
          <button className={`btn ${view === "evidence" ? "primary" : ""}`} onClick={() => setView("evidence")}>
            Evidence ({evidence.length})
          </button>
          <button className={`btn ${view === "history" ? "primary" : ""}`} onClick={() => setView("history")}>
            History ({process.history.length})
          </button>
          <Link className="btn" to={`/knowledge/graph?entity=${process.id}`}>
            View in graph
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>Relationships</h3>
        </div>
        <ul className="rel-list">
          {process.relationships.map((rel) => (
            <li key={`${rel.targetKind}-${rel.targetId}`}>
              <span className="tiny">{rel.label}</span>
              <Link to={entityPath(rel.targetKind, rel.targetId)}>
                {entityName(state, rel.targetKind, rel.targetId)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {view === "why" ? (
        <section className="section">
          <div className="section-head">
            <h3>Why did this change?</h3>
            <button className="link" onClick={() => setView(null)}>
              Hide
            </button>
          </div>
          {process.whyExplanation && process.whySteps ? (
            <WhyChanged explanation={process.whyExplanation} steps={process.whySteps} />
          ) : (
            <p className="muted">{process.recentChange}</p>
          )}
          <div className="stack" style={{ marginTop: 16 }}>
            {evidence.map((item) => (
              <EvidenceCard
                key={item.id}
                item={item}
                source={state.sources.find((src) => src.id === item.sourceId)}
                onOpen={() =>
                  setSourceNotice(
                    item.meetingMark
                      ? `Opened ${state.sources.find((src) => src.id === item.sourceId)?.name ?? "meeting"} at ${item.meetingMark}.`
                      : `Opened ${state.sources.find((src) => src.id === item.sourceId)?.name ?? "source"} in prototype view.`,
                  )
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {view === "evidence" ? (
        <section className="section">
          <div className="section-head">
            <h3>Evidence</h3>
            <button className="link" onClick={() => setView(null)}>
              Hide
            </button>
          </div>
          <div className="stack">
            {evidence.length ? (
              evidence.map((item) => (
                <EvidenceCard
                  key={item.id}
                  item={item}
                  source={state.sources.find((src) => src.id === item.sourceId)}
                  onOpen={() => setSourceNotice("Opened original source in prototype view.")}
                />
              ))
            ) : (
              <p className="muted">No source evidence is attached to this process yet.</p>
            )}
          </div>
        </section>
      ) : null}

      {view === "history" ? (
        <section className="section">
          <div className="section-head">
            <h3>History</h3>
            <button className="link" onClick={() => setView(null)}>
              Hide
            </button>
          </div>
          <div className="grid-2">
            <VersionTimeline
              versions={process.history}
              selectedId={selectedVersion?.id}
              onSelect={setSelectedVersionId}
            />
            {selectedVersion ? (
              <article className="version-summary">
                <div className="tiny">{selectedVersion.isCurrent ? "Current" : formatDate(selectedVersion.createdAt)}</div>
                <h3>
                  {previous ? `${previous.version} → ${selectedVersion.version}` : selectedVersion.version}
                </h3>
                {selectedVersion.added.length ? (
                  <p>
                    <strong>Added</strong>
                    <br />
                    {selectedVersion.added.join(", ")}
                  </p>
                ) : null}
                {selectedVersion.changed.length ? (
                  <p>
                    <strong>Changed</strong>
                    <br />
                    {selectedVersion.changed.join(", ")}
                  </p>
                ) : null}
                {selectedVersion.reasonDecisionId ? (
                  <p>
                    <strong>Reason</strong>
                    <br />
                    <Link to={`/knowledge/decisions/${selectedVersion.reasonDecisionId}`}>
                      {entityName(state, "decision", selectedVersion.reasonDecisionId)}
                    </Link>
                  </p>
                ) : selectedVersion.reasonLabel ? (
                  <p>
                    <strong>Reason</strong>
                    <br />
                    {selectedVersion.reasonLabel}
                  </p>
                ) : null}
                <p className="tiny">Recorded {formatDate(selectedVersion.createdAt)}</p>
                <p className="muted">{selectedVersion.summary}</p>
              </article>
            ) : null}
          </div>
        </section>
      ) : null}

      {sourceNotice ? (
        <Modal title="Source" onClose={() => setSourceNotice(null)}>
          <p>{sourceNotice}</p>
          <p className="tiny">This prototype does not open external systems.</p>
        </Modal>
      ) : null}
    </main>
  );
}
