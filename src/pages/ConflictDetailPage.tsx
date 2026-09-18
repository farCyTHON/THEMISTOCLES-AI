import { useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { useKnowledge } from "../state/knowledgeContext";
import { EntityBadge } from "../components/ui/EntityBadge";
import { EvidenceDrawer } from "../components/knowledge/EvidenceDrawer";
import { formatDateTime, formatDate, entityPath } from "../lib/format";
import type { Evidence } from "../data/types";

export function ConflictDetailPage() {
  const { id } = useParams();
  const { state, dispatch } = useKnowledge();
  const navigate = useNavigate();

  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionChoice, setResolutionChoice] = useState<"sourceA" | "sourceB" | "custom">("sourceA");
  const [resolutionNotes, setResolutionNotes] = useState("");

  const conflict = state.conflicts.find((c) => c.id === id);
  if (!conflict) return <Navigate to="/conflicts" replace />;

  const relatedDecision = conflict.relatedDecisionId
    ? state.decisions.find((d) => d.id === conflict.relatedDecisionId)
    : undefined;

  function handleResolveSubmit() {
    dispatch({
      type: "resolve-conflict",
      id: conflict!.id,
      resolutionChoice,
      notes: resolutionNotes || `Consensus reached favoring ${resolutionChoice === "sourceA" ? conflict!.sourceA.sourceName : resolutionChoice === "sourceB" ? conflict!.sourceB.sourceName : "reconciled policy"}.`,
      resolvedBy: "Alex Chen",
    });
    setResolveModalOpen(false);
  }

  function handleReopen() {
    dispatch({
      type: "update-conflict-status",
      id: conflict!.id,
      status: "open",
    });
  }

  return (
    <main className="page">
      <div className="crumbs">
        <Link to="/knowledge">Knowledge</Link>
        <span>/</span>
        <Link to="/conflicts">Conflicts</Link>
        <span>/</span>
        <span>{conflict.topic}</span>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor:
                  conflict.severity === "high"
                    ? "var(--danger-soft)"
                    : "var(--warning-soft)",
                color:
                  conflict.severity === "high" ? "var(--danger)" : "var(--warning)",
              }}
            >
              {conflict.severity.toUpperCase()} SEVERITY
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor:
                  conflict.status === "resolved"
                    ? "var(--success-soft)"
                    : conflict.status === "under-review"
                    ? "var(--warning-soft)"
                    : "var(--danger-soft)",
                color:
                  conflict.status === "resolved"
                    ? "var(--success)"
                    : conflict.status === "under-review"
                    ? "var(--warning)"
                    : "var(--danger)",
              }}
            >
              {conflict.status === "resolved"
                ? "Resolved"
                : conflict.status === "under-review"
                ? "Under Review"
                : "Open Dispute"}
            </span>
          </div>
          <h2>{conflict.topic}</h2>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: "15px" }}>
            Detected by Themistocles · {formatDateTime(conflict.detectedAt)}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {conflict.status !== "resolved" ? (
            <button className="btn primary" onClick={() => setResolveModalOpen(true)}>
              Resolve Conflict →
            </button>
          ) : (
            <button className="btn" onClick={handleReopen}>
              Re-open Dispute
            </button>
          )}
          <button
            className="btn"
            onClick={() =>
              navigate(
                `/chat?contextKind=conflict&contextId=${conflict.id}&prompt=${encodeURIComponent(
                  `What are the competing claims in the conflict "${conflict.topic}" and how does it affect teams?`,
                )}`,
              )
            }
          >
            Ask Memory about this conflict →
          </button>
        </div>
      </header>

      {/* Resolution summary banner if resolved */}
      {conflict.status === "resolved" ? (
        <section
          className="card"
          style={{
            padding: "16px 20px",
            borderLeft: "4px solid var(--success)",
            backgroundColor: "var(--success-soft)",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
            <div>
              <strong style={{ color: "var(--success)", fontSize: "14px" }}>
                Conflict Resolved ({conflict.resolvedAt ? formatDate(conflict.resolvedAt) : "Recently"})
              </strong>
              <p style={{ margin: "4px 0 0", fontSize: "13.5px" }}>
                Resolved by <strong>{conflict.resolvedBy || "Team Consensus"}</strong>: {conflict.resolutionNotes}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="meta-block">
        <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.5 }}>
          {conflict.summary}
        </p>
      </section>

      {/* Side-by-Side Conflicting Claims */}
      <section className="section">
        <div className="section-head">
          <h3>Competing Knowledge Claims</h3>
          <span className="tiny">Side-by-side discrepancy analysis</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {/* Source A */}
          <div
            className="card"
            style={{
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              borderTop: "3px solid var(--accent)",
            }}
          >
            <div>
              <span className="tiny" style={{ fontWeight: 600, color: "var(--accent)", textTransform: "uppercase" }}>
                Source Claim A
              </span>
              <h4 style={{ margin: "4px 0 2px", fontSize: "15px" }}>{conflict.sourceA.title}</h4>
              <div className="tiny" style={{ color: "var(--text-secondary)" }}>
                Origin: {conflict.sourceA.sourceName}
              </div>
            </div>

            <blockquote
              style={{
                margin: 0,
                padding: "12px 14px",
                backgroundColor: "var(--bg)",
                borderRadius: "6px",
                fontStyle: "italic",
                fontSize: "14px",
                lineHeight: 1.45,
                color: "var(--text)",
              }}
            >
              “{conflict.sourceA.claim}”
            </blockquote>

            <dl className="kv" style={{ margin: 0 }}>
              <dt>Documented by</dt>
              <dd>{conflict.sourceA.actor || "Official Policy"}</dd>
              <dt>Timestamp</dt>
              <dd>{conflict.sourceA.date ? formatDate(conflict.sourceA.date) : "Recent"}</dd>
            </dl>

            {conflict.sourceA.evidenceId ? (
              <button
                className="btn"
                style={{ marginTop: "auto" }}
                onClick={() => {
                  const ev = state.evidence.find((e) => e.id === conflict.sourceA.evidenceId);
                  if (ev) setSelectedEvidence(ev);
                }}
              >
                Inspect Source Evidence →
              </button>
            ) : null}
          </div>

          {/* Source B */}
          <div
            className="card"
            style={{
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              borderTop: "3px solid var(--warning)",
            }}
          >
            <div>
              <span className="tiny" style={{ fontWeight: 600, color: "var(--warning)", textTransform: "uppercase" }}>
                Source Claim B
              </span>
              <h4 style={{ margin: "4px 0 2px", fontSize: "15px" }}>{conflict.sourceB.title}</h4>
              <div className="tiny" style={{ color: "var(--text-secondary)" }}>
                Origin: {conflict.sourceB.sourceName}
              </div>
            </div>

            <blockquote
              style={{
                margin: 0,
                padding: "12px 14px",
                backgroundColor: "var(--bg)",
                borderRadius: "6px",
                fontStyle: "italic",
                fontSize: "14px",
                lineHeight: 1.45,
                color: "var(--text)",
              }}
            >
              “{conflict.sourceB.claim}”
            </blockquote>

            <dl className="kv" style={{ margin: 0 }}>
              <dt>Documented by</dt>
              <dd>{conflict.sourceB.actor || "Workflow Playbook"}</dd>
              <dt>Timestamp</dt>
              <dd>{conflict.sourceB.date ? formatDate(conflict.sourceB.date) : "Recent"}</dd>
            </dl>

            {conflict.sourceB.evidenceId ? (
              <button
                className="btn"
                style={{ marginTop: "auto" }}
                onClick={() => {
                  const ev = state.evidence.find((e) => e.id === conflict.sourceB.evidenceId);
                  if (ev) setSelectedEvidence(ev);
                }}
              >
                Inspect Source Evidence →
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Affected Entities & Impact Areas */}
      <section className="section">
        <div className="section-head">
          <h3>Impact & Scope</h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <div className="card" style={{ padding: "16px" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
              Affected Organizational Entities
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {conflict.affectedEntities.map((ae) => (
                <Link
                  key={ae.id}
                  to={entityPath(ae.kind, ae.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg)",
                    textDecoration: "none",
                    color: "var(--text)",
                  }}
                >
                  <EntityBadge kind={ae.kind} label={ae.kind} />
                  <strong>{ae.label}</strong>
                  <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--accent)" }}>View →</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: "16px" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
              Operational Impact Areas
            </h4>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6, fontSize: "13.5px" }}>
              {conflict.impactedAreas.map((area, idx) => (
                <li key={idx}>
                  <strong>{area}</strong>
                </li>
              ))}
            </ul>

            {relatedDecision ? (
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <span className="tiny" style={{ color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Related Decision
                </span>
                <div style={{ marginTop: 4 }}>
                  <Link to={`/knowledge/decisions/${relatedDecision.id}`} style={{ fontWeight: 600 }}>
                    Decision #{relatedDecision.number} — {relatedDecision.title} →
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Resolution Modal */}
      {resolveModalOpen ? (
        <div
          className="drawer-backdrop"
          onClick={() => setResolveModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(12, 16, 22, 0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: "20px",
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 540,
              backgroundColor: "var(--surface)",
              boxShadow: "var(--shadow-lg)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "17px" }}>Harmonize Organizational Conflict</h3>
                <p className="tiny" style={{ margin: "4px 0 0", color: "var(--text-secondary)" }}>
                  Select the authoritative source or document an updated consensus.
                </p>
              </div>
              <button
                className="btn icon-btn"
                onClick={() => setResolveModalOpen(false)}
                style={{ padding: "4px 8px" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  backgroundColor: resolutionChoice === "sourceA" ? "var(--accent-soft)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="resolutionChoice"
                  checked={resolutionChoice === "sourceA"}
                  onChange={() => setResolutionChoice("sourceA")}
                  style={{ marginTop: 3 }}
                />
                <div>
                  <strong>Adopt Source A: {conflict.sourceA.sourceName}</strong>
                  <div className="tiny" style={{ color: "var(--text-secondary)" }}>“{conflict.sourceA.claim}”</div>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  backgroundColor: resolutionChoice === "sourceB" ? "var(--accent-soft)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="resolutionChoice"
                  checked={resolutionChoice === "sourceB"}
                  onChange={() => setResolutionChoice("sourceB")}
                  style={{ marginTop: 3 }}
                />
                <div>
                  <strong>Adopt Source B: {conflict.sourceB.sourceName}</strong>
                  <div className="tiny" style={{ color: "var(--text-secondary)" }}>“{conflict.sourceB.claim}”</div>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  backgroundColor: resolutionChoice === "custom" ? "var(--accent-soft)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="resolutionChoice"
                  checked={resolutionChoice === "custom"}
                  onChange={() => setResolutionChoice("custom")}
                  style={{ marginTop: 3 }}
                />
                <div>
                  <strong>Custom Alignment / New Policy Formulation</strong>
                  <div className="tiny" style={{ color: "var(--text-secondary)" }}>Record agreed compromise across teams.</div>
                </div>
              </label>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, marginBottom: 6 }}>
                Resolution Rationale & Notes
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Detail the agreed consensus or team sign-off..."
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <button className="btn" onClick={() => setResolveModalOpen(false)}>
                Cancel
              </button>
              <button className="btn primary" onClick={handleResolveSubmit}>
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <EvidenceDrawer
        evidence={selectedEvidence}
        source={selectedEvidence ? state.sources.find((s) => s.id === selectedEvidence.sourceId) : undefined}
        onClose={() => setSelectedEvidence(null)}
      />
    </main>
  );
}
