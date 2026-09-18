import { useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { EntityBadge } from "../components/ui/EntityBadge";
import { EvidenceCard } from "../components/ui/EvidenceCard";
import { EvidenceDrawer } from "../components/knowledge/EvidenceDrawer";
import { WhyChanged } from "../components/knowledge/WhyChanged";
import { useKnowledge } from "../state/knowledgeContext";
import { entityPath, formatDate } from "../lib/format";
import type { Evidence } from "../data/types";

export function DecisionDetailPage() {
  const { id } = useParams();
  const { state } = useKnowledge();
  const navigate = useNavigate();
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const decision = state.decisions.find((item) => item.id === id);
  if (!decision) return <Navigate to="/knowledge/decisions" replace />;

  const evidence = state.evidence.filter((item) => decision.evidenceIds.includes(item.id));
  const superseded = decision.supersededDecisionId
    ? state.decisions.find((d) => d.id === decision.supersededDecisionId)
    : undefined;
  const process = decision.impactProcessId
    ? state.processes.find((item) => item.id === decision.impactProcessId)
    : undefined;

  const connectedPeople = decision.personIds
    ? state.people.filter((p) => decision.personIds?.includes(p.id))
    : [];

  return (
    <main className="page">
      <div className="crumbs">
        <Link to="/knowledge">Knowledge</Link>
        <span>/</span>
        <Link to="/knowledge/decisions">Decisions</Link>
        <span>/</span>
        <span>#{decision.number}</span>
      </div>

      <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <EntityBadge kind="decision" label="Decision" />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: decision.status === "active" ? "var(--success-soft)" : "var(--surface-2)",
                color: decision.status === "active" ? "var(--success)" : "var(--text-secondary)",
              }}
            >
              {decision.status === "active" ? "Active Policy" : "Superseded"}
            </span>
          </div>
          <h2>Decision #{decision.number}</h2>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", margin: "4px 0 0" }}>{decision.title}</p>
        </div>

        <button
          className="btn primary"
          onClick={() =>
            navigate(
              `/chat?contextKind=decision&contextId=${decision.id}&prompt=${encodeURIComponent(
                `Why was Decision #${decision.number} (${decision.title}) made and what does it impact?`,
              )}`,
            )
          }
        >
          Ask Memory about this decision →
        </button>
      </header>

      <section className="meta-block">
        <dl className="kv">
          <dt>Made by</dt>
          <dd>
            {connectedPeople.length ? (
              <span style={{ display: "inline-flex", gap: 8 }}>
                {connectedPeople.map((p, idx) => (
                  <span key={p.id}>
                    <Link to={`/people/${p.id}`}>{p.name}</Link>
                    {idx < connectedPeople.length - 1 ? ", " : ""}
                  </span>
                ))}
              </span>
            ) : (
              decision.madeBy
            )}
          </dd>
          <dt>Date</dt>
          <dd>{formatDate(decision.date)}</dd>
          <dt>Primary Impact</dt>
          <dd>
            {decision.impactProcessId ? (
              <Link to={entityPath("process", decision.impactProcessId)}>{decision.impactLabel}</Link>
            ) : decision.id === "dec-179" ? (
              <Link to={entityPath("system", "sys-api")}>{decision.impactLabel}</Link>
            ) : (
              decision.impactLabel
            )}
          </dd>
          <dt>Status</dt>
          <dd>{decision.status === "active" ? "Active" : "Superseded"}</dd>
        </dl>
        <p style={{ marginTop: 12, lineHeight: 1.5 }}>{decision.summary}</p>
      </section>

      {/* Why This Decision Exists / Provenance Chain */}
      <section className="section">
        <div className="section-head">
          <h3>Why this decision exists</h3>
          <span className="tiny" style={{ color: "var(--text-secondary)" }}>
            {evidence.length} supporting source{evidence.length !== 1 ? "s" : ""} recorded
          </span>
        </div>

        <div className="card" style={{ padding: "16px", marginBottom: 16, backgroundColor: "var(--surface-2)" }}>
          <h4 style={{ margin: "0 0 6px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
            Decision Rationale
          </h4>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.5 }}>
            {decision.reason || "Formalized to ensure organizational alignment across cross-functional teams."}
          </p>
        </div>

        {superseded ? (
          <div
            className="card"
            style={{
              padding: "14px 16px",
              marginBottom: 16,
              borderLeft: "4px solid var(--accent)",
              backgroundColor: "var(--surface)",
            }}
          >
            <div className="tiny" style={{ fontWeight: 600, color: "var(--accent)" }}>
              PREVIOUS SUPERSEDED POLICY
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "13.5px" }}>
              Replaces{" "}
              <Link to={`/knowledge/decisions/${superseded.id}`} style={{ fontWeight: 600 }}>
                Decision #{superseded.number} — {superseded.title}
              </Link>{" "}
              (Originally ratified {formatDate(superseded.date)}).
            </p>
          </div>
        ) : null}

        {/* Affected entities breakdown */}
        {decision.affectedEntities?.length ? (
          <div className="card" style={{ padding: "14px 16px", marginBottom: 16 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
              Affected Organizational Entities
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {decision.affectedEntities.map((item) => (
                <Link
                  key={item.id}
                  to={entityPath(item.kind, item.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg)",
                    border: "1px solid var(--border)",
                    fontSize: "12.5px",
                    textDecoration: "none",
                    color: "var(--text)",
                  }}
                >
                  <EntityBadge kind={item.kind} label={item.kind} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Evidence Sources Panel */}
      <section className="section">
        <div className="section-head">
          <h3>Supporting Evidence & Sources</h3>
          <span className="tiny">Click any item to inspect provenance</span>
        </div>
        {evidence.length ? (
          <div className="grid-cards">
            {evidence.map((item) => (
              <EvidenceCard
                key={item.id}
                item={item}
                source={state.sources.find((src) => src.id === item.sourceId)}
                onOpen={() => setSelectedEvidence(item)}
              />
            ))}
          </div>
        ) : (
          <div className="card empty" style={{ padding: "24px", textAlign: "center", color: "var(--text-secondary)" }}>
            <p style={{ margin: 0 }}>No supporting evidence records are linked to this decision.</p>
          </div>
        )}
      </section>

      {process?.whyExplanation && process.whySteps ? (
        <section className="section">
          <div className="section-head">
            <h3>Process Implementation Workflow</h3>
          </div>
          <WhyChanged explanation={process.whyExplanation} steps={process.whySteps} />
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
