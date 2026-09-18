import { useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { EntityBadge } from "../components/ui/EntityBadge";
import { EvidenceCard } from "../components/ui/EvidenceCard";
import { EvidenceDrawer } from "../components/knowledge/EvidenceDrawer";
import { WhyChanged } from "../components/knowledge/WhyChanged";
import { useKnowledge } from "../state/knowledgeContext";
import { entityPath, formatDate } from "../lib/format";
import type { Evidence } from "../data/types";

export function ChangeDetailPage() {
  const { id } = useParams();
  const { state } = useKnowledge();
  const navigate = useNavigate();
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const change = state.changes.find((c) => c.id === id);
  if (!change) return <Navigate to="/changes" replace />;

  const actor = state.people.find((p) => p.id === change.actorPersonId);
  const approver = state.people.find((p) => p.id === change.approverPersonId);
  const decision = change.decisionId
    ? state.decisions.find((d) => d.id === change.decisionId)
    : undefined;
  const evidence = state.evidence.filter((e) =>
    change.evidenceIds.includes(e.id),
  );

  // Check if any open conflict is related to this change or its decision
  const relatedConflicts = state.conflicts.filter(
    (conf) =>
      conf.relatedDecisionId === change.decisionId ||
      change.affectedEntities.some((ae) =>
        conf.affectedEntities.some((ce) => ce.id === ae.id),
      ),
  );

  return (
    <main className="page">
      <div className="crumbs">
        <Link to="/changes">Change Intelligence</Link>
        <span>/</span>
        <span>{change.title}</span>
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
          <EntityBadge kind="change" label={change.changeType} />
          <h2>{change.title}</h2>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {change.description}
          </p>
        </div>

        <button
          className="btn primary"
          onClick={() =>
            navigate(
              `/chat?contextKind=change&contextId=${change.id}&prompt=${encodeURIComponent(
                `Why did "${change.title}" change from "${change.previousState}" to "${change.currentState}"?`,
              )}`,
            )
          }
        >
          Ask Memory why this changed →
        </button>
      </header>

      {relatedConflicts.length && relatedConflicts[0] ? (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            marginBottom: 20,
            borderLeft: "4px solid var(--warning)",
            backgroundColor: "var(--warning-soft)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <strong style={{ color: "var(--warning)", fontSize: "13px" }}>
              Active Knowledge Disagreement Detected
            </strong>
            <p style={{ margin: "2px 0 0", fontSize: "13px" }}>
              {relatedConflicts[0].topic}
            </p>
          </div>
          <Link
            to={`/conflicts/${relatedConflicts[0].id}`}
            className="btn"
            style={{ fontSize: "12px", backgroundColor: "var(--surface)" }}
          >
            Inspect conflict ({relatedConflicts.length}) →
          </Link>
        </div>
      ) : null}

      <section className="meta-block">
        <dl className="kv">
          <dt>Changed Date</dt>
          <dd>{formatDate(change.changedAt)}</dd>
          {actor ? (
            <>
              <dt>Changed by</dt>
              <dd>
                <Link to={entityPath("person", actor.id)}>{actor.name}</Link>
              </dd>
            </>
          ) : null}
          {approver ? (
            <>
              <dt>Approved by</dt>
              <dd>
                <Link to={entityPath("person", approver.id)}>{approver.name}</Link>
              </dd>
            </>
          ) : null}
          {decision ? (
            <>
              <dt>Ratified Decision</dt>
              <dd>
                <Link to={entityPath("decision", decision.id)}>
                  Decision #{decision.number} — {decision.title}
                </Link>
              </dd>
            </>
          ) : null}
          {change.reason ? (
            <>
              <dt>Trigger / Signal</dt>
              <dd>{change.reason}</dd>
            </>
          ) : null}
        </dl>
      </section>

      {/* State change provenance visualization */}
      <section className="section">
        <div className="section-head">
          <h3>Provenance Chain</h3>
          <span className="tiny" style={{ color: "var(--text-secondary)" }}>
            Previous State → Signal → Decision → Evidence → Current State
          </span>
        </div>
        <div className="change-flow">
          <div className="change-flow-step">
            <div className="tiny">Previous state</div>
            <strong>{change.previousState}</strong>
          </div>
          <span className="why-arrow" aria-hidden>↓</span>

          <div className="change-flow-step">
            <div className="tiny">Trigger / Signal</div>
            <span>{change.reason || change.description}</span>
          </div>
          <span className="why-arrow" aria-hidden>↓</span>

          {decision ? (
            <>
              <div className="change-flow-step">
                <div className="tiny">Decision</div>
                <Link to={entityPath("decision", decision.id)}>
                  Decision #{decision.number}
                </Link>
              </div>
              <span className="why-arrow" aria-hidden>↓</span>
            </>
          ) : null}

          {evidence.length ? (
            <>
              <div className="change-flow-step">
                <div className="tiny">Supporting Evidence</div>
                <span>{evidence.length} verified item{evidence.length !== 1 ? "s" : ""}</span>
              </div>
              <span className="why-arrow" aria-hidden>↓</span>
            </>
          ) : null}

          <div className="change-flow-step current">
            <div className="tiny">Current state</div>
            <strong>{change.currentState}</strong>
          </div>
        </div>
      </section>

      {/* Why did this change */}
      {change.whySteps ? (
        <section className="section">
          <div className="section-head">
            <h3>Why did this change?</h3>
          </div>
          <WhyChanged
            explanation={change.reason ?? change.description}
            steps={change.whySteps}
          />
        </section>
      ) : null}

      {/* Affected areas */}
      {change.affectedEntities.length ? (
        <section className="section">
          <div className="section-head">
            <h3>Affected areas</h3>
          </div>
          <ul className="rel-list">
            {change.affectedEntities.map((entity) => (
              <li key={`${entity.kind}-${entity.id}`}>
                <EntityBadge kind={entity.kind} label={entity.kind} />
                <Link to={entityPath(entity.kind, entity.id)}>
                  {entity.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Evidence */}
      {evidence.length ? (
        <section className="section">
          <div className="section-head">
            <h3>Supporting Evidence</h3>
            <span className="tiny">Click to inspect source provenance</span>
          </div>
          <div className="grid-cards">
            {evidence.map((item) => (
              <EvidenceCard
                key={item.id}
                item={item}
                source={state.sources.find((s) => s.id === item.sourceId)}
                onOpen={() => setSelectedEvidence(item)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <EvidenceDrawer
        evidence={selectedEvidence}
        source={selectedEvidence ? state.sources.find((s) => s.id === selectedEvidence.sourceId) : undefined}
        onClose={() => setSelectedEvidence(null)}
      />
    </main>
  );
}
