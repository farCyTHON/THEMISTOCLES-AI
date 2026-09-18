import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useKnowledge } from "../state/knowledgeContext";
import { EntityBadge } from "../components/ui/EntityBadge";
import { EvidenceDrawer } from "../components/knowledge/EvidenceDrawer";
import { entityPath, formatDateTime } from "../lib/format";
import type { Evidence, EntityKind } from "../data/types";

interface NextActionItem {
  label: string;
  url: string;
  primary?: boolean;
}

interface GroundedItem {
  title: string;
  detail: string;
  link: string;
  badge?: string;
}

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
    groundedList?: GroundedItem[];
    nextActions?: NextActionItem[];
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
    } else if (contextKind === "workspace") {
      const ws = (state.workspaces || []).find((item) => item.id === contextId);
      if (ws) contextLabel = `Workspace: ${ws.name}`;
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
            summary: `Action "${act.title}" is currently in ${act.status.toUpperCase()} state with ${act.priority.toUpperCase()} priority, assigned to ${act.assignedTo}.`,
            why: act.description,
            evidenceIds: act.evidenceIds,
            affectedEntities: act.affectedEntities,
            nextActions: [
              { label: "Inspect in Action Center →", url: "/actions", primary: true },
              ...(act.relatedDecisionId
                ? [{ label: "Review Related Decision →", url: `/knowledge/decisions/${act.relatedDecisionId}` }]
                : []),
              ...(act.relatedConflictId
                ? [{ label: "Review Related Conflict →", url: `/conflicts/${act.relatedConflictId}` }]
                : []),
            ],
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
            summary: `Autonomous Sentinel "${ag.name}" is currently ${ag.status.toUpperCase()}. It monitors on ${ag.interval} cadence covering: [${ag.targetScopes.join(", ")}].`,
            why: `${ag.description} Last run: ${formatDateTime(ag.lastRun)}. Recorded ${ag.findingsCount} active finding(s).`,
            affectedEntities: ag.activeFindings.map((f) => ({ kind: "action" as EntityKind, id: f.actionId || f.id, label: f.summary })),
            nextActions: [
              { label: "Inspect Sentinel Rules & Logs →", url: `/agents/${ag.id}`, primary: true },
              { label: "Review Generated Actions →", url: "/actions" },
            ],
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
            summary: `Living Artifact "${art.title}" (${art.category.toUpperCase()}, ${art.currentVersion}) is grounded across ${art.evidenceIds.length} verified evidence sources.`,
            why: art.summary,
            evidenceIds: art.evidenceIds,
            affectedEntities: art.relatedDecisionIds.map((decId) => ({ kind: "decision" as EntityKind, id: decId, label: `Decision #${decId.replace("dec-", "")}` })),
            nextActions: [
              { label: "Read Living Artifact →", url: `/artifacts/${art.id}`, primary: true },
              { label: "View All Artifacts →", url: "/artifacts" },
            ],
          },
        };
      }
    }

    if (cKind === "workspace" && cId) {
      const ws = (state.workspaces || []).find((w) => w.id === cId);
      if (ws) {
        return {
          id: `msg-t-${Date.now()}`,
          sender: "themistocles",
          timestamp: now,
          answer: {
            summary: `Workspace "${ws.name}" encompasses ${ws.memberCount} team members across ${ws.connectedSystems.length} systems. It scopes ${ws.activeDecisionsCount} governance decisions and ${ws.pendingActionsCount} operational actions.`,
            why: ws.description,
            affectedEntities: [
              { kind: "person" as EntityKind, id: ws.leadPersonId, label: "Workspace Lead" },
            ],
            nextActions: [
              { label: `Open ${ws.name} Workspace View →`, url: "/workspace", primary: true },
              { label: "Review Scoped Actions →", url: "/actions" },
            ],
          },
        };
      }
    }

    // 2. "Create an executive brief for Project Atlas" (Deterministic Phase 3 Generation)
    if (
      (q.includes("create") || q.includes("generate") || q.includes("draft") || q.includes("write")) &&
      (q.includes("brief") || q.includes("artifact") || q.includes("report") || q.includes("memo") || q.includes("summary")) &&
      (q.includes("atlas") || q.includes("pricing") || q.includes("project"))
    ) {
      const existing = state.artifacts.find((a) => a.id === "art-pricing-brief" || a.id.startsWith("art-atlas-"));
      const artId = existing ? existing.id : "art-pricing-brief";

      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary: "Executive Brief prepared for Project Atlas (Enterprise Pricing & Annual Contracts).",
          why: "Synthesized directly from Decision #142, Customer Advisory Council feedback, Finance cohort revenue predictability models, and Project Atlas transition roadmap.",
          evidenceIds: ["ev-pricing-finance", "ev-pricing-sales", "ev-pricing-customer", "ev-pricing-leadership"],
          affectedEntities: [
            { kind: "project", id: "proj-atlas", label: "Project Atlas" },
            { kind: "decision", id: "dec-142", label: "Decision #142 (Annual Contracts)" },
            { kind: "person", id: "person-sarah", label: "Sarah Ahmed (PM)" },
          ],
          nextActions: [
            { label: "Open Living Artifact →", url: `/artifacts/${artId}`, primary: true },
            { label: "Review Decision #142 →", url: "/knowledge/decisions/dec-142" },
            { label: "View Action Center →", url: "/actions" },
          ],
        },
      };
    }

    // 3. "What should I review today?" / "What should I review?"
    if (
      q.includes("what should i review") ||
      q.includes("review today") ||
      q.includes("what to review") ||
      q.includes("needs my attention") ||
      q.includes("priority today")
    ) {
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary: "3 priority items require your operational attention today across governance, policy consistency, and SLA alignment.",
          why: "Synthesized from active conflicts, pending Action Center proposals, and autonomous sentinel scans.",
          evidenceIds: ["ev-pricing-customer", "ev-pricing-sales", "ev-incident"],
          groundedList: [
            {
              title: "1. Update Enterprise Sales Playbook (Action act-001)",
              detail: "Resolves Conflict C-001 between 14-day sales pitch and 30-day CS onboarding SLA.",
              link: "/actions",
              badge: "Urgent Action",
            },
            {
              title: "2. Audit EMEA Proposal Decks (Action act-002)",
              detail: "Enforces Decision #142 annual billing mandate across regional sales repositories.",
              link: "/actions",
              badge: "High Priority",
            },
            {
              title: "3. Investigate Policy Drift Sentinel Anomaly",
              detail: "Policy Drift Sentinel flagged legacy monthly clauses circulating in pitch collateral.",
              link: "/agents/agent-drift",
              badge: "Sentinel Finding",
            },
          ],
          affectedEntities: [
            { kind: "action", id: "act-001", label: "Action act-001" },
            { kind: "action", id: "act-002", label: "Action act-002" },
            { kind: "conflict", id: "conf-001", label: "Conflict C-001" },
            { kind: "decision", id: "dec-142", label: "Decision #142" },
          ],
          nextActions: [
            { label: "Open Action Center →", url: "/actions", primary: true },
            { label: "Review Conflict C-001 →", url: "/conflicts/conf-001" },
            { label: "Inspect Policy Drift Sentinel →", url: "/agents/agent-drift" },
          ],
        },
      };
    }

    // 4. "What actions need approval?"
    if (
      (q.includes("action") && (q.includes("approval") || q.includes("need") || q.includes("pending") || q.includes("review"))) ||
      q === "what actions need approval?" ||
      q.includes("actions pending")
    ) {
      const pending = state.actions.filter((a) => a.status === "proposed" || a.status === "under-review");
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary: `${pending.length} actions in the Action Center currently require review or approval before execution.`,
          why: "Operational proposals generated by sentinels and leads remain gated until signed off by stakeholders.",
          evidenceIds: ["ev-pricing-customer", "ev-pricing-sales"],
          groundedList: pending.map((a) => ({
            title: a.title,
            detail: `${a.priority.toUpperCase()} priority · Proposed by ${a.proposedBy} · ${a.impactSummary}`,
            link: "/actions",
            badge: a.status.toUpperCase(),
          })),
          affectedEntities: pending.map((a) => ({ kind: "action" as EntityKind, id: a.id, label: a.title })),
          nextActions: [
            { label: "Review All in Action Center →", url: "/actions", primary: true },
            { label: "View Active Sentinels →", url: "/agents" },
          ],
        },
      };
    }

    // 5. "What did the Policy Drift Detector find?"
    if (
      q.includes("drift") ||
      (q.includes("policy") && (q.includes("detector") || q.includes("sentinel") || q.includes("find") || q.includes("found")))
    ) {
      // Policy Drift Sentinel response
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary: "Policy Drift Sentinel detected that EMEA sales proposal templates are circulating legacy monthly billing terms contradictory to Decision #142, and Engineering Slack discussions moved database migrations to Tuesday morning ahead of SOP documentation.",
          why: "Cross-referencing active document repositories against ratified decision records revealed non-compliant pitch templates.",
          evidenceIds: ["ev-pricing-sales", "ev-pricing-leadership", "ev-migrate-prior"],
          affectedEntities: [
            { kind: "agent", id: "agent-drift", label: "Policy Drift Sentinel" },
            { kind: "decision", id: "dec-142", label: "Decision #142" },
            { kind: "action", id: "act-002", label: "Action act-002" },
            { kind: "action", id: "act-003", label: "Action act-003" },
          ],
          nextActions: [
            { label: "Inspect Policy Drift Sentinel →", url: "/agents/agent-drift", primary: true },
            { label: "Review Remediation Action act-002 →", url: "/actions" },
            { label: "Review Decision #142 →", url: "/knowledge/decisions/dec-142" },
          ],
        },
      };
    }

    // 6. "What are the agents monitoring?"
    if (
      q.includes("agent") ||
      q.includes("sentinel") ||
      q.includes("autonomous") ||
      q.includes("what are the agents monitoring") ||
      q.includes("monitoring")
    ) {
      const activeAgents = (state.agents || []).filter((a) => a.status === "active").length;
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary: `Themistocles operates 3 autonomous governance sentinels (${activeAgents} currently active): 1) Policy Drift Sentinel, 2) SLA Consistency Monitor, and 3) Provenance & Evidence Sentinel.`,
          why: "Sentinels continuously inspect knowledge nodes and emit suggested remediation actions into the Action Center whenever drift or divergence is detected.",
          evidenceIds: ["ev-pricing-customer", "ev-migrate-prior"],
          groundedList: state.agents.map((ag) => ({
            title: `${ag.name} (${ag.status.toUpperCase()})`,
            detail: `${ag.role} · Scope: ${ag.targetScopes.join(", ")} · ${ag.findingsCount} active finding(s)`,
            link: `/agents/${ag.id}`,
            badge: ag.status,
          })),
          affectedEntities: state.agents.map((ag) => ({ kind: "agent" as EntityKind, id: ag.id, label: ag.name })),
          nextActions: [
            { label: "View Autonomous Agents Overview →", url: "/agents", primary: true },
            { label: "Inspect Generated Actions →", url: "/actions" },
          ],
        },
      };
    }

    // 7. "What sources changed recently?"
    if (
      q.includes("source") ||
      q.includes("connector") ||
      q.includes("slack") ||
      q.includes("teams") ||
      q.includes("sources changed")
    ) {
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary: "Recent signals were ingested from Slack (#engineering), Microsoft Teams (Security Review), and Engineering Sync recordings. Ingestion captured the consensus moving Database Migrations to Tuesday mornings and Security Review sign-off for release v3.2.",
          why: "All connected source channels report active telemetry with zero sync failures logged in the last 48 hours.",
          evidenceIds: ["ev-slack-184", "ev-meeting-184", "ev-api-own"],
          groundedList: state.sources.map((s) => ({
            title: `${s.name} (${s.location})`,
            detail: `Kind: ${s.kind.toUpperCase()} · Status: ${s.connected ? "Connected" : "Disconnected"} · Last Synced: ${formatDateTime(s.lastSynced)}`,
            link: "/sources",
            badge: s.connected ? "Active" : "Offline",
          })),
          affectedEntities: state.sources.map((s) => ({ kind: "source" as EntityKind, id: s.id, label: s.name })),
          nextActions: [
            { label: "Manage Connected Sources →", url: "/sources", primary: true },
            { label: "Inspect Activity Stream →", url: "/activity" },
          ],
        },
      };
    }

    // 8. Conflicts
    if (q.includes("conflict") || q.includes("disagree") || q.includes("contradiction") || q.includes("discrepancy")) {
      const openCount = state.conflicts.filter((c) => c.status !== "resolved").length;
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary: `Themistocles currently monitors ${openCount} active organizational conflicts: 1) Customer onboarding timeframe (30 days CS Policy vs 14 days Sales Playbook), 2) Enterprise billing terms in EMEA proposals, and 3) Database schema migration window.`,
          why: "Knowledge contradictions occur when operational documents and live chat agreements evolve asynchronously without formal reconciliation.",
          evidenceIds: ["ev-pricing-customer", "ev-pricing-sales", "ev-migrate-prior"],
          affectedEntities: [
            { kind: "conflict", id: "conf-001", label: "Onboarding Period Conflict" },
            { kind: "conflict", id: "conf-002", label: "EMEA Billing Conflict" },
            { kind: "conflict", id: "conf-003", label: "Migration Window Conflict" },
          ],
          nextActions: [
            { label: "Review All Conflicts →", url: "/conflicts", primary: true },
            { label: "Inspect Conflict C-001 →", url: "/conflicts/conf-001" },
            { label: "Review Action act-001 →", url: "/actions" },
          ],
        },
      };
    }

    // 9. Pricing / Annual Contracts
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
          nextActions: [
            { label: "Inspect Decision #142 →", url: "/knowledge/decisions/dec-142", primary: true },
            { label: "Read Pricing Living Artifact →", url: "/artifacts/art-pricing-brief" },
            { label: "Review Project Atlas →", url: "/projects/proj-atlas" },
          ],
        },
      };
    }

    // 10. What changed / Recent changes
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
          nextActions: [
            { label: "View Organizational Pulse →", url: "/pulse", primary: true },
            { label: "Inspect Activity Stream →", url: "/activity" },
            { label: "Review Action Center →", url: "/actions" },
          ],
        },
      };
    }

    // 11. Living Artifacts
    if (q.includes("artifact") || q.includes("living document") || q.includes("standard") || q.includes("doc")) {
      return {
        id: `msg-t-${Date.now()}`,
        sender: "themistocles",
        timestamp: now,
        answer: {
          summary: `Themistocles maintains ${state.artifacts.length} living, grounded artifacts: 1) Executive Pricing Brief (Project Atlas), 2) Production Deployment Standard v3.2, and 3) Customer Onboarding Alignment Report.`,
          why: "Living artifacts prevent documentation from going stale by maintaining persistent footnote citations linked to primary source evidence.",
          evidenceIds: ["ev-pricing-finance", "ev-slack-184", "ev-pricing-customer"],
          groundedList: state.artifacts.map((art) => ({
            title: `${art.title} (${art.currentVersion})`,
            detail: `${art.category.toUpperCase()} · ${art.summary}`,
            link: `/artifacts/${art.id}`,
            badge: art.status,
          })),
          affectedEntities: state.artifacts.map((art) => ({ kind: "artifact" as EntityKind, id: art.id, label: art.title })),
          nextActions: [
            { label: "View All Living Artifacts →", url: "/artifacts", primary: true },
            { label: "Read Pricing Brief →", url: "/artifacts/art-pricing-brief" },
          ],
        },
      };
    }

    // Fallback: Honest, safety-first response (No fabrication)
    return {
      id: `msg-t-${Date.now()}`,
      sender: "themistocles",
      timestamp: now,
      answer: {
        summary:
          "I don't have enough recorded evidence in organizational memory to answer that.",
        why: "The current verified organizational dataset covers Enterprise Pricing (Decision #142), Production Security Reviews (Decision #184), API Gateway Ownership (Decision #179), Database Migration (v2.3), Operational Actions, Autonomous Sentinels, Living Artifacts, and active Organizational Conflicts.",
        isUnsupported: true,
        nextActions: [
          { label: "Review Pending Actions →", url: "/actions", primary: true },
          { label: "Explore Knowledge Hub →", url: "/knowledge" },
        ],
      },
    };
  }

  const suggestedQuestions = [
    "What should I review today?",
    "What actions need approval?",
    "What did the Policy Drift Detector find?",
    "What are the agents monitoring?",
    "What sources changed recently?",
    "Why did our pricing change?",
    "Create an executive brief for Project Atlas.",
    "Show unresolved organizational conflicts",
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
              Intelligence & Operations Layer
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: "14px" }}>
            Direct natural language querying over organizational decisions, evidence, actions, sentinels, and policies.
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
          /* Empty Chat State */
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
                  maxWidth: 540,
                  lineHeight: 1.5,
                }}
              >
                Explore decisions, pending actions, autonomous sentinels, living artifacts, and verifiable evidence.
              </p>
            </div>

            <div style={{ marginTop: 8, width: "100%", maxWidth: 680 }}>
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
                /* Themistocles Contextual Answer Card: ANSWER + EVIDENCE + RELATED ENTITIES + NEXT ACTION */
                <div
                  className="card"
                  style={{
                    width: "100%",
                    maxWidth: 780,
                    padding: "22px 26px",
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

                  {/* Grounded Items List (e.g. for Review Today, Actions Need Approval) */}
                  {msg.answer?.groundedList?.length ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <span className="tiny" style={{ color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
                        Identified Review Items ({msg.answer.groundedList.length})
                      </span>
                      {msg.answer.groundedList.map((item, iIdx) => (
                        <Link
                          key={iIdx}
                          to={item.link}
                          style={{
                            padding: "10px 12px",
                            backgroundColor: "var(--bg)",
                            borderRadius: "6px",
                            border: "1px solid var(--border)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            textDecoration: "none",
                            color: "var(--text)",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                              <strong style={{ fontSize: "13.5px" }}>{item.title}</strong>
                              {item.badge ? (
                                <span className="tiny" style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)", padding: "1px 6px", borderRadius: "4px", fontWeight: 600 }}>
                                  {item.badge}
                                </span>
                              ) : null}
                            </div>
                            <div style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>{item.detail}</div>
                          </div>
                          <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600, whiteSpace: "nowrap", marginLeft: 10 }}>
                            Review →
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : null}

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

                  {/* Supporting Evidence Quotes (Clickable to Drawer) */}
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
                                <span style={{ color: "var(--accent)", fontWeight: 600 }}>Inspect Evidence →</span>
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

                  {/* NEXT ACTIONS (No dead ends, direct action triggers) */}
                  {msg.answer?.nextActions?.length ? (
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                      <span className="tiny" style={{ color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 8 }}>
                        Next Recommended Actions:
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {msg.answer.nextActions.map((na, nIdx) => (
                          <Link
                            key={nIdx}
                            to={na.url}
                            className={`btn ${na.primary ? "primary" : ""}`}
                            style={{ fontSize: "12.5px", padding: "6px 12px" }}
                          >
                            {na.label}
                          </Link>
                        ))}
                      </div>
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
          placeholder={`Query ${contextLabel}... (e.g. "What should I review today?", "What actions need approval?")`}
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
