import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useKnowledge } from "../state/knowledgeContext";
import { formatDate } from "../lib/format";
import type { LivingArtifact } from "../data/types";

export function ArtifactsPage() {
  const { state, dispatch } = useKnowledge();
  const navigate = useNavigate();

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Creation form state
  const [createType, setCreateType] = useState<"brief" | "sop" | "policy" | "report">("brief");
  const [createContextEntity, setCreateContextEntity] = useState<string>("proj-atlas");

  const filteredArtifacts = useMemo(() => {
    if (categoryFilter === "all") return state.artifacts;
    return state.artifacts.filter((art) => art.category === categoryFilter);
  }, [state.artifacts, categoryFilter]);

  const categoryBadge = (cat: string) => {
    const config: Record<string, { label: string; bg: string; color: string }> = {
      brief: { label: "Executive Brief", bg: "var(--accent-soft)", color: "var(--accent)" },
      sop: { label: "Standard / SOP", bg: "var(--decision-soft)", color: "var(--decision)" },
      policy: { label: "Company Policy", bg: "var(--warning-soft)", color: "var(--warning)" },
      report: { label: "Alignment Report", bg: "var(--success-soft)", color: "var(--success)" },
    };
    const c = config[cat] || { label: cat, bg: "var(--surface-2)", color: "var(--text)" };
    return (
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          padding: "2px 7px",
          borderRadius: "4px",
          backgroundColor: c.bg,
          color: c.color,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {c.label}
      </span>
    );
  };

  function handleGenerateArtifact() {
    const now = new Date().toISOString();
    let newArtifact: LivingArtifact;

    if (createContextEntity === "proj-atlas") {
      newArtifact = {
        id: `art-atlas-${Date.now()}`,
        title: createType === "brief" 
          ? "Executive Brief: Project Atlas & Annual Pricing Restructure"
          : createType === "sop"
          ? "Standard Operating Procedure: Enterprise Annual Contracts Transition"
          : createType === "report"
          ? "Strategic Alignment Report: Project Atlas Rollout"
          : "Policy Directive: Mandatory Annual Upfront Contracts",
        category: createType,
        status: "published",
        lastUpdated: now,
        authorPersonId: "person-sarah",
        currentVersion: "v1.0",
        summary:
          "Synthesized executive briefing detailing the strategic migration of Acme Enterprise accounts to annual upfront contracts pursuant to Decision #142.",
        content: `### Executive Overview
Under Decision #142, Acme has ratified the mandatory transition of all enterprise contracts from monthly invoicing to annual upfront agreements. This initiative is managed by Sarah Ahmed under Project Atlas.

### Strategic Drivers & Evidence Grounding
1. **Financial Predictability**: Cohort modeling by Finance demonstrates an anticipated 40% improvement in recurring revenue stability (Ref: James Okafor, Finance Quarterly Review).
2. **Customer Demand Alignment**: Enterprise procurement teams explicitly voiced preference for annual budgetary cycles over monthly voucher tracking (Ref: Customer Advisory Council).
3. **Operational Safeguards**: Sales compensation and standard pitch collateral have been recalibrated to ensure uniform market presentation.

### Operational Actions Triggered
- Deprecation of legacy monthly billing language in regional EMEA decks (Action act-002, flagged by Policy Drift Sentinel).
- Dedicated CSM 30-day onboarding SLAs established to support multi-year commitments (Action act-001).`,
        evidenceIds: ["ev-pricing-finance", "ev-pricing-sales", "ev-pricing-customer", "ev-pricing-leadership"],
        relatedDecisionIds: ["dec-142", "dec-138"],
        relatedProjectIds: ["proj-atlas"],
        history: [
          {
            version: "v1.0",
            updatedAt: now,
            author: "Sarah Ahmed",
            summary: "Initial artifact generation grounded in Decision #142 and customer advisory evidence.",
          },
        ],
      };
    } else if (createContextEntity === "proc-migrate") {
      newArtifact = {
        id: `art-migrate-${Date.now()}`,
        title: "Executive Brief: Database Migration Window Harmonization",
        category: createType,
        status: "published",
        lastUpdated: now,
        authorPersonId: "person-alex",
        currentVersion: "v1.0",
        summary:
          "Operational summary detailing the consensus shift of schema migrations to Tuesday mornings to guarantee platform engineering support.",
        content: `### Objective
Establish the rationale for migrating Database Schema Maintenance from Friday evenings to Tuesday mornings (v2.4).

### Grounding & Consensus
- Technical review determined Friday deploys risked weekend customer disruption without live on-call support.
- Slack #engineering consensus led by Alex Chen and Sam Lee scheduled dry-run testing during low-traffic windows.`,
        evidenceIds: ["ev-migrate-prior", "ev-slack-184"],
        relatedDecisionIds: ["dec-172"],
        relatedProjectIds: ["proj-payments"],
        history: [
          {
            version: "v1.0",
            updatedAt: now,
            author: "Alex Chen",
            summary: "Initial synthesized brief from Engineering Slack signals and staging dry-run results.",
          },
        ],
      };
    } else {
      // Generic grounded artifact
      newArtifact = {
        id: `art-onboard-${Date.now()}`,
        title: "Executive Alignment Brief: Enterprise Customer Onboarding",
        category: createType,
        status: "published",
        lastUpdated: now,
        authorPersonId: "person-rachel",
        currentVersion: "v1.0",
        summary:
          "Harmonization brief evaluating Customer Success workload and formalizing the 30-day dedicated onboarding SLA.",
        content: `### Executive Summary
Calibrates outward sales promises with Customer Success department capacity. Resolves Conflict C-001 by establishing a standard 30-day dedicated onboarding window.`,
        evidenceIds: ["ev-pricing-customer", "ev-onboard"],
        relatedDecisionIds: ["dec-138", "dec-155"],
        relatedProjectIds: ["proj-atlas"],
        history: [
          {
            version: "v1.0",
            updatedAt: now,
            author: "Rachel Kim",
            summary: "Initial draft generated to resolve SLA discrepancy.",
          },
        ],
      };
    }

    dispatch({ type: "create-artifact", artifact: newArtifact });
    setIsCreateOpen(false);
    navigate(`/artifacts/${newArtifact.id}`);
  }

  return (
    <main className="page">
      <div className="crumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Artifacts</span>
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
          <h2>Living Organizational Artifacts</h2>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Verifiable briefs, standards, and reports synthesized directly from organizational memory and anchored in primary evidence.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn primary" onClick={() => setIsCreateOpen(true)}>
            + Create Living Artifact
          </button>
          <button
            className="btn"
            onClick={() =>
              navigate(
                `/chat?prompt=${encodeURIComponent(
                  "What living artifacts are available in organizational memory and how are they grounded in evidence?",
                )}`,
              )
            }
          >
            Ask Memory about artifacts →
          </button>
        </div>
      </header>

      {/* Category Filter Chips */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          className={`filter-chip ${categoryFilter === "all" ? "active" : ""}`}
          onClick={() => setCategoryFilter("all")}
        >
          All Artifacts ({state.artifacts.length})
        </button>
        <button
          className={`filter-chip ${categoryFilter === "brief" ? "active" : ""}`}
          onClick={() => setCategoryFilter("brief")}
        >
          Executive Briefs ({state.artifacts.filter((a) => a.category === "brief").length})
        </button>
        <button
          className={`filter-chip ${categoryFilter === "sop" ? "active" : ""}`}
          onClick={() => setCategoryFilter("sop")}
        >
          Standards & SOPs ({state.artifacts.filter((a) => a.category === "sop").length})
        </button>
        <button
          className={`filter-chip ${categoryFilter === "report" ? "active" : ""}`}
          onClick={() => setCategoryFilter("report")}
        >
          Alignment Reports ({state.artifacts.filter((a) => a.category === "report").length})
        </button>
      </div>

      {/* Artifacts Grid */}
      <section className="section">
        {filteredArtifacts.length ? (
          <div className="grid-cards">
            {filteredArtifacts.map((artifact) => {
              const author = state.people.find((p) => p.id === artifact.authorPersonId);

              return (
                <article
                  key={artifact.id}
                  className="card clickable"
                  onClick={() => navigate(`/artifacts/${artifact.id}`)}
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    borderTop: "3px solid var(--accent)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        {categoryBadge(artifact.category)}
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 6px",
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
                        <span className="tiny" style={{ color: "var(--text-muted)" }}>
                          {artifact.currentVersion}
                        </span>
                      </div>
                      <h3 style={{ margin: "2px 0 0", fontSize: "16px" }}>{artifact.title}</h3>
                    </div>

                    <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--accent)" }}>
                      Read Document →
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                    {artifact.summary}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "12px", color: "var(--text-secondary)" }}>
                    <span>By {author ? author.name : "Organizational Lead"}</span>
                    <span>·</span>
                    <span>Updated {formatDate(artifact.lastUpdated)}</span>
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="tiny" style={{ fontWeight: 600, color: "var(--success)" }}>
                      ✓ {artifact.evidenceIds.length} Verified Evidence Footnotes
                    </span>
                    <span className="tiny" style={{ color: "var(--text-muted)" }}>
                      {artifact.history.length} revision{artifact.history.length !== 1 ? "s" : ""} logged
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="card empty" style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
            <p style={{ margin: 0 }}>No living artifacts matching this category.</p>
          </div>
        )}
      </section>

      {/* Artifact Creation Modal (Prototype Grounded Generation) */}
      {isCreateOpen ? (
        <div
          className="drawer-backdrop"
          onClick={() => setIsCreateOpen(false)}
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
              maxWidth: 560,
              backgroundColor: "var(--surface)",
              boxShadow: "var(--shadow-lg)",
              padding: "26px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px" }}>Create Living Organizational Artifact</h3>
                <p className="tiny" style={{ margin: "4px 0 0", color: "var(--text-secondary)" }}>
                  Synthesize verifiable documentation grounded in local decisions, evidence, and changes.
                </p>
              </div>
              <button className="btn icon-btn" onClick={() => setIsCreateOpen(false)}>
                ✕
              </button>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: 6 }}>
                Artifact Type
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { id: "brief", label: "Executive Brief" },
                  { id: "sop", label: "Standard / SOP" },
                  { id: "report", label: "Alignment Report" },
                  { id: "policy", label: "Policy Brief" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`btn ${createType === t.id ? "primary" : ""}`}
                    onClick={() => setCreateType(t.id as any)}
                    style={{ justifyContent: "center", fontSize: "13px" }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: 6 }}>
                Context Entity Scope
              </label>
              <select
                value={createContextEntity}
                onChange={(e) => setCreateContextEntity(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  fontSize: "13.5px",
                }}
              >
                <option value="proj-atlas">Project Atlas (Enterprise Pricing Restructure)</option>
                <option value="proc-migrate">Database Migration (Maintenance Window Alignment)</option>
                <option value="proc-onboard">Customer Onboarding (SLA Harmonization)</option>
              </select>
            </div>

            {/* Grounding Context Preview */}
            <div
              style={{
                padding: "12px 14px",
                backgroundColor: "var(--bg)",
                borderRadius: "6px",
                borderLeft: "3px solid var(--success)",
                fontSize: "12.5px",
                lineHeight: 1.45,
              }}
            >
              <strong style={{ color: "var(--success)", display: "block", marginBottom: 4 }}>
                ✓ Grounded in Local Organizational Memory:
              </strong>
              {createContextEntity === "proj-atlas" ? (
                <span>
                  Synthesizing Decision #142, Customer Advisory Council feedback (Rachel Kim), Finance cohort model (James Okafor), and Project Atlas transition roadmap.
                </span>
              ) : createContextEntity === "proc-migrate" ? (
                <span>
                  Synthesizing Database Migration v2.4, Slack #engineering consensus signals, and off-peak staging trial dry-run results.
                </span>
              ) : (
                <span>
                  Synthesizing Customer Success Policy v2.1, Q3 Sales Playbook SLA analysis, and CSAT cohort metrics.
                </span>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <button className="btn" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </button>
              <button className="btn primary" onClick={handleGenerateArtifact}>
                ⚡ Generate Living Artifact →
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
