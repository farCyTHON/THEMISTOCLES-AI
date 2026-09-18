import { useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { useKnowledge } from "../state/knowledgeContext";
import { EntityBadge } from "../components/ui/EntityBadge";
import { EvidenceDrawer } from "../components/knowledge/EvidenceDrawer";
import { formatDate, formatDateTime } from "../lib/format";
import type { Evidence } from "../data/types";

export function ArtifactDetailPage() {
  const { id } = useParams();
  const { state, dispatch } = useKnowledge();
  const navigate = useNavigate();

  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const artifact = state.artifacts.find((a) => a.id === id);
  if (!artifact) return <Navigate to="/artifacts" replace />;

  const author = state.people.find((p) => p.id === artifact.authorPersonId);
  const evidenceList = state.evidence.filter((e) => (artifact.evidenceIds || []).includes(e.id));
  const decisions = state.decisions.filter((d) => (artifact.relatedDecisionIds || []).includes(d.id));
  const projects = state.projects.filter((p) => (artifact.relatedProjectIds || []).includes(p.id));

  function handlePublish() {
    dispatch({ type: "publish-artifact", id: artifact!.id });
  }

  return (
    <main className="page" style={{ maxWidth: 940 }}>
      <div className="crumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/artifacts">Artifacts</Link>
        <span>/</span>
        <span>{artifact.title}</span>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: "var(--accent-soft)",
                color: "var(--accent)",
                textTransform: "uppercase",
              }}
            >
              Living Document · {artifact.currentVersion}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor:
                  artifact.status === "published"
                    ? "var(--success-soft)"
                    : "var(--warning-soft)",
                color:
                  artifact.status === "published"
                    ? "var(--success)"
                    : "var(--warning)",
                textTransform: "capitalize",
              }}
            >
              {artifact.status}
            </span>
          </div>
          <h2>{artifact.title}</h2>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: "15px" }}>
            Authored by {author ? author.name : "Organizational Lead"} · Updated {formatDate(artifact.lastUpdated)}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {artifact.status !== "published" ? (
            <button className="btn primary" onClick={handlePublish}>
              Publish Document →
            </button>
          ) : null}
          <button
            className="btn"
            onClick={() =>
              navigate(
                `/chat?contextKind=artifact&contextId=${artifact.id}&prompt=${encodeURIComponent(
                  `What evidence and decisions support the living artifact: "${artifact.title}"?`,
                )}`,
              )
            }
          >
            Ask Memory about this artifact →
          </button>
        </div>
      </header>

      {/* Grounded Provenance Banner */}
      <section
        className="card"
        style={{
          padding: "14px 18px",
          backgroundColor: "var(--surface)",
          borderLeft: "4px solid var(--success)",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <strong style={{ color: "var(--success)", fontSize: "13.5px" }}>
            ✓ Verifiable Organizational Artifact
          </strong>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
            Every statement in this living document is anchored in primary recorded conversations and ratified decisions.
          </p>
        </div>
        <span className="tiny" style={{ fontWeight: 600 }}>
          {evidenceList.length} Grounded Citations
        </span>
      </section>

      {/* Living Document Content */}
      <article
        className="card"
        style={{
          padding: "28px 32px",
          backgroundColor: "var(--surface)",
          fontSize: "15px",
          lineHeight: 1.65,
          color: "var(--text)",
        }}
      >
        <div style={{ whiteSpace: "pre-line" }}>{artifact.content}</div>
      </article>

      {/* Grounded Evidence Citations */}
      <section className="section" style={{ marginTop: 28 }}>
        <div className="section-head">
          <h3>Grounded Evidence Footnotes ({evidenceList.length})</h3>
          <span className="tiny">Click any item to inspect source transcript</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {evidenceList.map((ev) => {
            const src = state.sources.find((s) => s.id === ev.sourceId);
            return (
              <div
                key={ev.id}
                className="card clickable"
                onClick={() => setSelectedEvidence(ev)}
                style={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "13px" }}>{ev.title || src?.name || "Evidence Record"}</strong>
                  <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>Inspect →</span>
                </div>
                <blockquote style={{ margin: 0, fontStyle: "italic", fontSize: "13px", color: "var(--text)" }}>
                  “{ev.quote}”
                </blockquote>
                <div className="tiny" style={{ color: "var(--text-secondary)", marginTop: "auto" }}>
                  {ev.speaker ? `${ev.speaker} · ` : ""}{formatDate(ev.occurredAt)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Connected Entities & Revision History */}
      <section className="section">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
          {/* Related Decisions & Projects */}
          <div className="card" style={{ padding: "18px" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
              Connected Decisions & Projects
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {decisions.map((d) => (
                <Link
                  key={d.id}
                  to={`/knowledge/decisions/${d.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    backgroundColor: "var(--bg)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    textDecoration: "none",
                    color: "var(--text)",
                  }}
                >
                  <EntityBadge kind="decision" label="Decision" />
                  <strong>Decision #{d.number}: {d.title}</strong>
                  <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--accent)" }}>View →</span>
                </Link>
              ))}

              {projects.map((proj) => (
                <Link
                  key={proj.id}
                  to={`/projects/${proj.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    backgroundColor: "var(--bg)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    textDecoration: "none",
                    color: "var(--text)",
                  }}
                >
                  <EntityBadge kind="project" label="Project" />
                  <strong>{proj.name}</strong>
                  <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--accent)" }}>View →</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Revision History */}
          <div className="card" style={{ padding: "18px" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
              Living Revision History
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {artifact.history.map((rev, rIdx) => (
                <div
                  key={rIdx}
                  style={{
                    padding: "8px 10px",
                    backgroundColor: "var(--bg)",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <strong style={{ color: "var(--accent)" }}>{rev.version}</strong>
                    <span className="tiny" style={{ color: "var(--text-muted)" }}>
                      {formatDateTime(rev.updatedAt)}
                    </span>
                  </div>
                  <div style={{ color: "var(--text-secondary)", marginBottom: 2 }}>By {rev.author}</div>
                  <div>{rev.summary}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <EvidenceDrawer
        evidence={selectedEvidence}
        source={selectedEvidence ? state.sources.find((s) => s.id === selectedEvidence.sourceId) : undefined}
        onClose={() => setSelectedEvidence(null)}
      />
    </main>
  );
}
