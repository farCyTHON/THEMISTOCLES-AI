import type { ActionItem } from "./types";

export const actions: ActionItem[] = [
  {
    id: "act-001",
    title: "Update Enterprise Sales Playbook to 30-day onboarding SLA",
    description:
      "Align the Q3 Sales Playbook with Customer Success Policy v2.1. Replace the legacy 14-day rapid deployment clause with the ratified 30-day dedicated CSM onboarding cycle.",
    priority: "urgent",
    status: "proposed",
    proposedAt: "2026-09-16T15:00:00",
    proposedBy: "agent-sla",
    assignedTo: "person-james",
    targetKind: "process",
    targetId: "proc-onboard",
    relatedConflictId: "conf-001",
    relatedDecisionId: "dec-138",
    impactSummary:
      "Eliminates customer expectation mismatch and protects CSM capacity across enterprise accounts.",
    affectedEntities: [
      { kind: "process", id: "proc-onboard", label: "Customer Onboarding" },
      { kind: "team", id: "team-ops", label: "Sales & Customer Success" },
      { kind: "conflict", id: "conf-001", label: "Onboarding Period Conflict" },
      { kind: "person", id: "person-james", label: "James Okafor" },
      { kind: "person", id: "person-rachel", label: "Rachel Kim" },
    ],
  },
  {
    id: "act-002",
    title: "Deprecate legacy monthly billing clauses in EMEA proposal templates",
    description:
      "Audit all regional proposal decks circulating in the EMEA sales repository. Remove lingering monthly payment options to enforce Decision #142 annual upfront contract mandate.",
    priority: "high",
    status: "under-review",
    proposedAt: "2026-09-15T17:30:00",
    proposedBy: "agent-drift",
    assignedTo: "person-sarah",
    targetKind: "decision",
    targetId: "dec-142",
    relatedConflictId: "conf-002",
    relatedDecisionId: "dec-142",
    impactSummary:
      "Guarantees 100% legal and revenue compliance with annual billing policy across international deals.",
    affectedEntities: [
      { kind: "decision", id: "dec-142", label: "Decision #142 (Annual contracts)" },
      { kind: "project", id: "proj-atlas", label: "Project Atlas" },
      { kind: "person", id: "person-sarah", label: "Sarah Ahmed" },
    ],
  },
  {
    id: "act-003",
    title: "Schedule Tuesday 09:00 UTC Database Migration Dry-Run",
    description:
      "Execute an off-peak staging test of the schema migration workflow during the proposed Tuesday 09:00 window before formally updating Database Migration v2.4 in production.",
    priority: "medium",
    status: "approved",
    proposedAt: "2026-09-17T11:00:00",
    proposedBy: "person-alex",
    assignedTo: "person-sam",
    targetKind: "process",
    targetId: "proc-migrate",
    relatedConflictId: "conf-003",
    impactSummary:
      "Validates platform stability and team availability without interrupting Friday customer workflows.",
    affectedEntities: [
      { kind: "process", id: "proc-migrate", label: "Database Migration" },
      { kind: "system", id: "sys-db", label: "Database" },
      { kind: "person", id: "person-sam", label: "Sam Lee" },
    ],
  },
  {
    id: "act-004",
    title: "Formalize two-tier security incident routing matrix",
    description:
      "Configure automated PagerDuty escalation rules so Sev-1 pages the Security on-call engineer, while Sev-2 and below routes to Slack #security-triage.",
    priority: "medium",
    status: "executed",
    proposedAt: "2026-09-11T09:00:00",
    proposedBy: "agent-provenance",
    assignedTo: "person-maya",
    targetKind: "process",
    targetId: "proc-incident",
    relatedDecisionId: "dec-160",
    relatedConflictId: "conf-004",
    impactSummary:
      "Eliminated non-critical paging interruptions, allowing security team to focus on core review gates.",
    affectedEntities: [
      { kind: "process", id: "proc-incident", label: "Incident Response" },
      { kind: "team", id: "team-security", label: "Security" },
      { kind: "person", id: "person-maya", label: "Maya Patel" },
    ],
    executedAt: "2026-09-12T16:00:00",
    executedBy: "person-maya",
    executionResult:
      "Paging rules verified and active in production. Zero off-hour Sev-2 escalations logged since implementation.",
  },
  {
    id: "act-005",
    title: "Publish customer self-service authentication guidelines",
    description:
      "Document SSO, MFA, and delegated account management standards for the upcoming Customer Portal Redesign to fulfill security prerequisites.",
    priority: "high",
    status: "proposed",
    proposedAt: "2026-09-16T10:30:00",
    proposedBy: "person-lena",
    assignedTo: "person-maya",
    targetKind: "project",
    targetId: "proj-portal",
    relatedDecisionId: "dec-135",
    impactSummary:
      "Unblocks portal wireframes and ensures customer account self-service satisfies enterprise infosec gates.",
    affectedEntities: [
      { kind: "project", id: "proj-portal", label: "Customer Portal Redesign" },
      { kind: "person", id: "person-lena", label: "Lena Torres" },
      { kind: "person", id: "person-maya", label: "Maya Patel" },
    ],
  },
];
