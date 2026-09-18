import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useKnowledge } from "../state/knowledgeContext";
import { EntityBadge } from "../components/ui/EntityBadge";
import { EvidenceDrawer } from "../components/knowledge/EvidenceDrawer";
import { entityPath, formatDateTime } from "../lib/format";
import type { Evidence, EntityKind } from "../data/types";

interface ChatMessage {
  id: string;
  sender: "user" | "themistocles";
  timestamp: string;
  text?: string;
  answer?: {
    summary: string;
    why?: string;
    decision?: { id: string; number: number; title: string };
    evidenceIds?: string[];
    affectedEntities?: { kind: EntityKind; id: string; label: string }[];
    conflictId?: string;
    isUnsupported?: boolean;
  };
}

export function MemoryChatPage() {
  const { state } = useKnowledge();
  const [searchParams, setSearchParams] = useSearchParams();

  const contextKind = searchParams.get("contextKind");
  const contextId = searchParams.get("contextId");
  const initialPrompt = searchParams.get("prompt");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Context name resolution
  let contextLabel = "Organization-wide memory";
  if (contextKind && contextId) {
    if (contextKind === "decision") {
      const d = state.decisions.find((item) => item.id === contextId);
      if (d) contextLabel = `Decision #${d.number} (${d.title})`;
    } else if (contextKind === "project") {
      const p = state.projects.find((item) => item.id === contextId);
      if (p) contextLabel = `Project: ${p.name}`;
    } else if (contextKind === "change") {
      const c = state.changes.find((item) => item.id === contextId);
      if (c) contextLabel = `Change: ${c.title}`;
    } else if (contextKind === "person") {
      const p = state.people.find((item) => item.id === contextId);
      if (p) contextLabel = `Person: ${p.name}`;
    } else if (contextKind === "conflict") {
      const conf = state.conflicts.find((item) => item.id === contextId);
      if (conf) contextLabel = `Conflict: ${conf.topic}`;
    } else if (contextKind === "action") {
      const a = (state.actions || []).find((item) => item.id === contextId);
      if (a) contextLabel = `Action: ${a.title}`;
    } else if (contextKind === "agent") {
      const ag = (state.agents || []).find((item) => item.id === contextId);
      if (ag) contextLabel = `Agent: ${ag.name}`;
    } else if (contextKind === "artifact") {
      const art = (state.artifacts || []).find((item) => item.id === contextId);
      if (art) contextLabel = `Artifact: ${art.title}`;
    }
  }

  // Handle initial prompt if passed via query params
  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      handleSendPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function clearContext() {
    setSearchParams({});
  }

  function handleSendPrompt(queryText: string) {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toISOString(),
      text: trimmed,
    };

    const responseMsg = generateMemoryResponse(trimmed, contextKind, contextId);

    setMessages((prev) => [...prev, userMsg, responseMsg]);
    setInput("");
  }

  function generateMemoryResponse(
    query: string,
    cKind: string | null,
    cId: string | null,
  ): ChatMessage {
    const q = query.toLowerCase();
    const now = new Date().toISOString();

    // 1. Context-specific queries
    if (cKind === "action" && cId) {
      const act = (state.actions || []).find((a) => a.id === cId);
      if (act) {
        return {
          id: `msg-t-${Date.now()}`,
          sender: "themistocles",
          timestamp: now,
          answer: {
            summary: `Action "${act.title}" is currently ${act.status} with ${act.priority} priority, assigned to ${act.assignedTo}.`,
            why: act.description,
            affectedEntities: act.affectedEntities,
          },
        };
      }
    }

    if (cKind === "agent" && cId) {
      const ag = (state.agents || []).find((a) => a.id === cId);
      if (ag) {
        return {
          id: `msg-t-${Date.now()}`,
          sender: "themistocles",
          timestamp: now,
          answer: {
            summary: `Autonomous Sentinel "${ag.name}" is currently ${ag.status}. It monitors at ${ag.interval} intervals with inspection scope over [${ag.targetScopes.join(", ")}].`,
            why: `${ag.description} Last run: ${ag.lastRun}. Total findings recorded: ${ag.findingsCount}.`,
            affectedEntities: ag.activeFindings.map((f) => ({ kind: "action" as EntityKind, id: f.actionId || f.id, label: f.summary })),
          },
        };
      }
    }

    if (cKind === "artifact" && cId) {
      const art = (state.artifacts || []).find((a) => a.id === cId);
      if (art) {
        return {
          id: `msg-t-${Date.now()}`,
          sender: "themistocles",
          timestamp: now,
          answer: {
            summary: `Living Artifact "${art.title}" (${art.category}, v${art.currentVersion}) is grounded across ${art.evidenceIds.length} verified evidence sources.`,
            why: art.summary,
            evidenceIds: art.evidenceIds,
            affectedEntities: art.relatedDecisionIds.map((decId) => ({ kind: "decision" as EntityKind, id: decId, label: `Decision ${decId}` })),
          },
        };
      }
    }

    if (cKind === "decision" && cId === "dec-142") {
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary:
            "Decision #142 shifted Enterprise customers from monthly billing to mandatory annual upfront contracts effective Q4.",
          why: "Enterprise customers requested predictable budgeting. Finance analysis led by James Okafor demonstrated a 40% improvement in revenue predictability.",
          decision: { id: "dec-142", number: 142, title: "Enterprise pricing moved to annual contracts" },
          evidenceIds: ["ev-pricing-finance", "ev-pricing-sales", "ev-pricing-customer", "ev-pricing-leadership"],
          affectedEntities: [
            { kind: "project", id: "proj-atlas", label: "Project Atlas" },
            { kind: "process", id: "proc-onboard", label: "Customer onboarding" },
            { kind: "person", id: "person-sarah", label: "Sarah Ahmed" },
          ],
        },
      };
    }

    if (cKind === "decision" && cId === "dec-184") {
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary:
            "Decision #184 instituted a mandatory Security Review gate for all production releases in Deployment Process v3.2.",
          why: "Near-miss incidents during production deploys indicated the need for a security checkpoint before release.",
          decision: { id: "dec-184", number: 184, title: "Mandatory security review before production deployment" },
          evidenceIds: ["ev-slack-184", "ev-meeting-184"],
          affectedEntities: [
            { kind: "process", id: "proc-deploy", label: "Deployment Process" },
            { kind: "process", id: "proc-sec-review", label: "Security Review" },
            { kind: "system", id: "sys-payment", label: "Payment Service" },
          ],
        },
      };
    }

    // 2. Pricing / Annual Contracts
    if (q.includes("pricing") || q.includes("annual contract") || q.includes("billing") || q.includes("dec-142") || q.includes("142")) {
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary:
            "Enterprise pricing was transitioned from monthly billing to annual contracts on September 14, 2026 under Decision #142.",
          why: "The change followed enterprise customer advisory council feedback and a cohort finance analysis showing 40% higher revenue predictability.",
          decision: { id: "dec-142", number: 142, title: "Enterprise pricing moved to annual contracts" },
          evidenceIds: ["ev-pricing-finance", "ev-pricing-sales", "ev-pricing-customer", "ev-pricing-leadership"],
          affectedEntities: [
            { kind: "project", id: "proj-atlas", label: "Project Atlas" },
            { kind: "process", id: "proc-onboard", label: "Customer onboarding" },
            { kind: "person", id: "person-sarah", label: "Sarah Ahmed" },
            { kind: "person", id: "person-james", label: "James Okafor" },
          ],
          conflictId: "conf-002",
        },
      };
    }

    // 3. What changed / Recent changes
    if (q.includes("what changed") || q.includes("recent changes") || q.includes("this week")) {
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary:
            "Three high-impact changes were recorded across the organization recently: Enterprise pricing shifted to annual billing, Deployment Process added a mandatory security gate (v3.2), and API Gateway ownership transferred to Operations.",
          why: "These changes align engineering capacity with core product delivery and address enterprise customer procurement requests.",
          decision: { id: "dec-142", number: 142, title: "Enterprise pricing moved to annual contracts" },
          evidenceIds: ["ev-pricing-leadership", "ev-slack-184", "ev-api-own"],
          affectedEntities: [
            { kind: "project", id: "proj-atlas", label: "Project Atlas" },
            { kind: "process", id: "proc-deploy", label: "Deployment Process" },
            { kind: "system", id: "sys-api", label: "API Gateway" },
          ],
        },
      };
    }

    // 4. Project Atlas
    if (q.includes("atlas") || q.includes("proj-atlas")) {
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary:
            "Project Atlas is the enterprise pricing restructuring initiative owned by Sarah Ahmed (Product). It encompasses the transition to annual contracts and updated sales workflows.",
          why: "Governed by Decision #142 (Annual contracts) and Decision #138 (Sales workflow updates).",
          decision: { id: "dec-142", number: 142, title: "Enterprise pricing moved to annual contracts" },
          evidenceIds: ["ev-pricing-leadership", "ev-pricing-sales"],
          affectedEntities: [
            { kind: "person", id: "person-sarah", label: "Sarah Ahmed (Lead)" },
            { kind: "process", id: "proc-onboard", label: "Customer onboarding" },
            { kind: "team", id: "team-ops", label: "Sales & Operations" },
          ],
          conflictId: "conf-002",
        },
      };
    }

    // 5. Conflicts / Disagreements / Contradictions
    if (q.includes("conflict") || q.includes("disagree") || q.includes("contradiction") || q.includes("discrepancy")) {
      const openCount = state.conflicts.filter((c) => c.status !== "resolved").length;
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary: `Themistocles currently monitors ${openCount} active organizational conflicts: 1) Customer onboarding timeframe (30 days CS Policy vs 14 days Sales Playbook), 2) Enterprise billing terms in EMEA proposals, and 3) Database schema migration window (Friday evening vs Tuesday morning).`,
          why: "Knowledge contradictions occur when operational documents and live chat agreements evolve asynchronously without formal reconciliation.",
          evidenceIds: ["ev-pricing-customer", "ev-pricing-sales", "ev-migrate-prior"],
          affectedEntities: [
            { kind: "conflict", id: "conf-001", label: "Onboarding Period Conflict" },
            { kind: "conflict", id: "conf-002", label: "EMEA Billing Conflict" },
            { kind: "conflict", id: "conf-003", label: "Migration Window Conflict" },
          ],
        },
      };
    }

    // 6. Onboarding
    if (q.includes("onboard")) {
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary:
            "Organizational memory tracks two distinct onboarding contexts: 1) Employee Onboarding is owned by Daniel Kim (Operations), providing first-week Themistocles access (Decision #155). 2) Customer Onboarding is currently subject to an open conflict between Customer Success (30 days) and Sales (14 days SLA).",
          why: "Rapid enterprise growth created an SLA divergence between sales promises and CSM onboarding capacity.",
          decision: { id: "dec-155", number: 155, title: "Onboarding includes organizational memory access" },
          evidenceIds: ["ev-onboard", "ev-pricing-customer"],
          affectedEntities: [
            { kind: "person", id: "person-daniel", label: "Daniel Kim" },
            { kind: "person", id: "person-rachel", label: "Rachel Kim" },
            { kind: "conflict", id: "conf-001", label: "Customer Onboarding Conflict" },
          ],
          conflictId: "conf-001",
        },
      };
    }

    // 7. Security / Deployment review
    if (q.includes("security") || q.includes("deploy") || q.includes("dec-184") || q.includes("184")) {
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary:
            "All production releases require a two-person review and a mandatory Security Review gate owned by Maya Patel (Security Engineer).",
          why: "Instituted under Decision #184 after production incident reviews identified the need for pre-release validation.",
          decision: { id: "dec-184", number: 184, title: "Mandatory security review before production deployment" },
          evidenceIds: ["ev-slack-184", "ev-meeting-184"],
          affectedEntities: [
            { kind: "process", id: "proc-deploy", label: "Deployment Process v3.2" },
            { kind: "person", id: "person-maya", label: "Maya Patel" },
            { kind: "person", id: "person-alex", label: "Alex Chen" },
          ],
        },
      };
    }

    // 8. Sarah Ahmed
    if (q.includes("sarah") || q.includes("ahmed")) {
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary:
            "Sarah Ahmed is Product Manager for Project Atlas. She authored Decision #142 (transitioning enterprise pricing to annual contracts) and oversees pricing and billing operational alignment.",
          why: "Sarah led the quarterly customer advisory cohort reviews that validated annual procurement demand.",
          decision: { id: "dec-142", number: 142, title: "Enterprise pricing moved to annual contracts" },
          evidenceIds: ["ev-pricing-leadership"],
          affectedEntities: [
            { kind: "person", id: "person-sarah", label: "Sarah Ahmed" },
            { kind: "project", id: "proj-atlas", label: "Project Atlas" },
          ],
        },
      };
    }

    // 9. API Gateway / sys-api
    if (q.includes("api gateway") || q.includes("dec-179") || q.includes("179") || q.includes("gateway")) {
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary:
            "API Gateway ownership was transferred from Engineering to Operations (Daniel Kim) under Decision #179 on September 8, 2026.",
          why: "Engineering was overburdened with both feature delivery and infrastructure upkeep. Moving the gateway freed up Engineering capacity.",
          decision: { id: "dec-179", number: 179, title: "Transfer API Gateway ownership to Operations" },
          evidenceIds: ["ev-api-own"],
          affectedEntities: [
            { kind: "system", id: "sys-api", label: "API Gateway" },
            { kind: "team", id: "team-ops", label: "Operations" },
            { kind: "person", id: "person-daniel", label: "Daniel Kim" },
          ],
        },
      };
    }

    // 10. Database Migration
    if (q.includes("migration") || q.includes("database") || q.includes("schema")) {
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary:
            "Database Migration process (v2.3) governs schema alterations. A schedule discrepancy currently exists between Friday evening maintenance and Tuesday morning low-traffic preferences.",
          why: "Alex Chen and Sam Lee discussed shifting migrations to Tuesday morning to ensure full team availability on deck.",
          evidenceIds: ["ev-migrate-prior", "ev-slack-184"],
          affectedEntities: [
            { kind: "process", id: "proc-migrate", label: "Database Migration" },
            { kind: "system", id: "sys-db", label: "Database" },
            { kind: "conflict", id: "conf-003", label: "Migration Window Conflict" },
          ],
          conflictId: "conf-003",
        },
      };
    }

    // 11. Actions & Governance
    if (q.includes("action") || q.includes("pending") || q.includes("approval") || q.includes("task") || q.includes("reconcil")) {
      const pending = (state.actions || []).filter((a) => a.status !== "executed");
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary: `There are currently ${pending.length} pending operational actions awaiting human review in the Action Center. Key items include reconciling the onboarding SLA conflict, updating deployment runbooks for security review gates, and migrating EMEA sales quotes to annual billing.`,
          why: "Operational actions are continuously synthesized from policy drift, sentinel scans, and verified organizational decisions to prevent execution lag.",
          evidenceIds: ["ev-pricing-sales", "ev-slack-184"],
          affectedEntities: [
            { kind: "action", id: "act-001", label: "Reconcile Onboarding SLA Conflict" },
            { kind: "action", id: "act-002", label: "Update Deployment Runbook for Security Review Gate" },
            { kind: "action", id: "act-003", label: "Audit EMEA Sales Quotes for Annual Terms" },
          ],
        },
      };
    }

    // 12. Autonomous Agents / Sentinels
    if (q.includes("agent") || q.includes("sentinel") || q.includes("autonomous") || q.includes("monitor") || q.includes("scan")) {
      const activeAgents = (state.agents || []).filter((a) => a.status === "active").length;
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary: `Themistocles operates 3 autonomous governance sentinels (${activeAgents} currently active): 1) Policy Drift Sentinel (watches documentation vs live Slack threads), 2) SLA Divergence Sentinel (monitors commitments across customer contracts), and 3) Provenance Verifier (verifies claims against primary sources).`,
          why: "Sentinels continuously inspect knowledge nodes and emit suggested remediation actions into the Action Center whenever drift or divergence is detected.",
          evidenceIds: ["ev-pricing-customer", "ev-migrate-prior"],
          affectedEntities: [
            { kind: "agent", id: "agent-drift", label: "Policy Drift Sentinel" },
            { kind: "agent", id: "agent-sla", label: "SLA Divergence Sentinel" },
            { kind: "agent", id: "agent-provenance", label: "Provenance Verifier" },
          ],
        },
      };
    }

    // 13. Living Artifacts
    if (q.includes("artifact") || q.includes("brief") || q.includes("living document") || q.includes("standard") || q.includes("draft") || q.includes("doc")) {
      const arts = state.artifacts || [];
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary: `Themistocles maintains ${arts.length} living, grounded artifacts: 1) Executive Pricing Brief (Q4 2026 Strategy), 2) Production Deployment Standard v3.2, and 3) Customer Onboarding Alignment Report. These documents continuously update their claims and citations as decisions and evidence change.`,
          why: "Living artifacts prevent organizational documentation from going stale by maintaining persistent footnote citations linked to primary source evidence.",
          evidenceIds: ["ev-pricing-finance", "ev-slack-184", "ev-pricing-customer"],
          affectedEntities: [
            { kind: "artifact", id: "art-pricing-brief", label: "Executive Pricing Brief" },
            { kind: "artifact", id: "art-deploy-standard", label: "Production Deployment Standard" },
            { kind: "artifact", id: "art-onboarding-report", label: "Customer Onboarding Alignment Report" },
          ],
        },
      };
    }

    // Fallback: Honest, safety-first response (Required by prompt)
    return {
      id: `msg-t-${Date.now()}`,
      sender: "themistocles",
      timestamp: now,
      answer: {
        summary:
          "I don't have enough recorded evidence in organizational memory to answer that.",
        why: "The current verified organizational dataset covers Enterprise Pricing (Decision #142), Production Security Reviews (Decision #184), API Gateway Ownership (Decision #179), Database Migration (v2.3), Operational Actions, Autonomous Sentinels, Living Artifacts, and active Organizational Conflicts.",
        isUnsupported: true,
      },
    };
  }

  const suggestedQuestions = [
    "Why did our pricing change?",
    "What operational actions are pending approval?",
    "What are our autonomous sentinels monitoring?",
    "Show grounded living artifacts",
    "What decisions affect Project Atlas?",
    "Show unresolved organizational conflicts",
    "Who owns customer onboarding?",
    "What evidence supports our latest product decision?",
  ];

  return (
    <main className="page" style={{ maxWidth: 900 }}>
      <div className="crumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Themistocles Memory</span>
      </div>

      {/* Header with Context Scope */}
      <header
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
          paddingBottom: 14,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ margin: 0 }}>Themistocles Memory</h2>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "12px",
                backgroundColor: "var(--accent-soft)",
                color: "var(--accent)",
              }}
            >
              Intelligence Layer
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: "14px" }}>
            Direct natural language querying over organizational decisions, evidence, changes, and policies.
          </p>
        </div>

        {/* Active Context Chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "var(--surface-2)",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            fontSize: "12.5px",
          }}
        >
          <span className="dot" style={{ backgroundColor: "var(--accent)" }} />
          <span>
            Scope: <strong>{contextLabel}</strong>
          </span>
          {contextKind ? (
            <button
              onClick={clearContext}
              title="Reset to organization-wide scope"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 4px",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              ✕
            </button>
          ) : null}
        </div>
      </header>

      {/* Chat Messages Stream */}
      <div
        style={{
          minHeight: 380,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          padding: "20px 0",
        }}
      >
        {messages.length === 0 ? (
          /* Empty Chat State (Required by prompt) */
          <div
            className="card"
            style={{
              padding: "36px 28px",
              textAlign: "center",
              backgroundColor: "var(--surface)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "10px",
                backgroundColor: "var(--accent-soft)",
                color: "var(--accent)",
                display: "grid",
                placeItems: "center",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              T
            </div>
            <div>
              <h3 style={{ margin: "0 0 6px", fontSize: "18px" }}>
                Ask Themistocles about your organization.
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  maxWidth: 520,
                  lineHeight: 1.5,
                }}
              >
                Explore decisions, people, projects, changes, evidence, and organizational context with verifiable provenance.
              </p>
            </div>

            <div style={{ marginTop: 8, width: "100%", maxWidth: 640 }}>
              <span
                className="tiny"
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Suggested starter queries
              </span>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    className="btn"
                    onClick={() => handleSendPrompt(q)}
                    style={{
                      justifyContent: "flex-start",
                      textAlign: "left",
                      fontSize: "13px",
                      padding: "10px 14px",
                      backgroundColor: "var(--bg)",
                    }}
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                gap: 6,
              }}
            >
              <div className="tiny" style={{ color: "var(--text-muted)", padding: "0 4px" }}>
                {msg.sender === "user" ? "You" : "Themistocles Memory"} · {formatDateTime(msg.timestamp)}
              </div>

              {msg.sender === "user" ? (
                /* User Prompt Bubble */
                <div
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "#ffffff",
                    padding: "12px 18px",
                    borderRadius: "14px 14px 2px 14px",
                    maxWidth: "80%",
                    fontSize: "14.5px",
                    lineHeight: 1.45,
                  }}
                >
                  {msg.text}
                </div>
              ) : (
                /* Themistocles Contextual Answer Card (Required by prompt) */
                <div
                  className="card"
                  style={{
                    width: "100%",
                    maxWidth: 780,
                    padding: "20px 24px",
                    borderRadius: "4px 14px 14px 14px",
                    backgroundColor: "var(--surface)",
                    boxShadow: "var(--shadow)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {/* Primary Answer */}
                  <div>
                    <span
                      className="tiny"
                      style={{
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontWeight: 700,
                        color: msg.answer?.isUnsupported ? "var(--warning)" : "var(--accent)",
                      }}
                    >
                      {msg.answer?.isUnsupported ? "Memory Limit" : "Answer"}
                    </span>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "15px",
                        lineHeight: 1.5,
                        color: "var(--text)",
                        fontWeight: 500,
                      }}
                    >
                      {msg.answer?.summary}
                    </p>
                  </div>

                  {/* Why Section */}
                  {msg.answer?.why ? (
                    <div
                      style={{
                        padding: "12px 14px",
                        backgroundColor: "var(--bg)",
                        borderRadius: "8px",
                        borderLeft: "3px solid var(--accent)",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          color: "var(--text-secondary)",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Why & Provenance
                      </strong>
                      <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.45 }}>{msg.answer.why}</p>
                    </div>
                  ) : null}

                  {/* Related Decision Badge */}
                  {msg.answer?.decision ? (
                    <div>
                      <span className="tiny" style={{ color: "var(--text-secondary)", textTransform: "uppercase" }}>
                        Ratified Decision
                      </span>
                      <div style={{ marginTop: 4 }}>
                        <Link
                          to={`/knowledge/decisions/${msg.answer.decision.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 12px",
                            backgroundColor: "var(--decision-soft)",
                            color: "var(--decision)",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          <EntityBadge kind="decision" label="Decision" />
                          <span>
                            Decision #{msg.answer.decision.number}: {msg.answer.decision.title} →
                          </span>
                        </Link>
                      </div>
                    </div>
                  ) : null}

                  {/* Supporting Evidence Quotes (Clickable) */}
                  {msg.answer?.evidenceIds?.length ? (
                    <div>
                      <span className="tiny" style={{ color: "var(--text-secondary)", textTransform: "uppercase" }}>
                        Supporting Evidence ({msg.answer.evidenceIds.length})
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                        {msg.answer.evidenceIds.map((evId) => {
                          const ev = state.evidence.find((e) => e.id === evId);
                          if (!ev) return null;
                          const src = state.sources.find((s) => s.id === ev.sourceId);
                          return (
                            <div
                              key={ev.id}
                              onClick={() => setSelectedEvidence(ev)}
                              style={{
                                padding: "8px 12px",
                                backgroundColor: "var(--bg)",
                                borderRadius: "6px",
                                cursor: "pointer",
                                border: "1px solid var(--border)",
                                transition: "background 0.15s ease",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                                <strong>
                                  {ev.title || src?.name || "Source Log"}
                                  {ev.speaker ? ` · ${ev.speaker}` : ""}
                                </strong>
                                <span style={{ color: "var(--accent)", fontWeight: 600 }}>Inspect →</span>
                              </div>
                              <div style={{ fontStyle: "italic", fontSize: "12.5px", marginTop: 2 }}>“{ev.quote}”</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {/* Affected Entities Chips */}
                  {msg.answer?.affectedEntities?.length ? (
                    <div>
                      <span className="tiny" style={{ color: "var(--text-secondary)", textTransform: "uppercase" }}>
                        Related & Affected Entities
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                        {msg.answer.affectedEntities.map((item) => (
                          <Link
                            key={item.id}
                            to={entityPath(item.kind, item.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 10px",
                              borderRadius: "6px",
                              backgroundColor: "var(--surface-2)",
                              fontSize: "12px",
                              color: "var(--text)",
                              textDecoration: "none",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <EntityBadge kind={item.kind} label={item.kind} />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Conflict notification if relevant */}
                  {msg.answer?.conflictId ? (
                    <div
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "var(--warning-soft)",
                        borderRadius: "6px",
                        borderLeft: "3px solid var(--warning)",
                        fontSize: "12.5px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>Notice: Active knowledge conflict associated with this topic.</span>
                      <Link to={`/conflicts/${msg.answer.conflictId}`} style={{ fontWeight: 600 }}>
                        Review conflict →
                      </Link>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Prompt Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt(input);
        }}
        style={{
          position: "sticky",
          bottom: 16,
          display: "flex",
          gap: 10,
          backgroundColor: "var(--surface)",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Query ${contextLabel}... (e.g. "Why did pricing change?", "Show conflicts")`}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--bg)",
            color: "var(--text)",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <button type="submit" className="btn primary" disabled={!input.trim()}>
          Ask Memory
        </button>
      </form>

      <EvidenceDrawer
        evidence={selectedEvidence}
        source={selectedEvidence ? state.sources.find((s) => s.id === selectedEvidence.sourceId) : undefined}
        onClose={() => setSelectedEvidence(null)}
      />
    </main>
  );
}
