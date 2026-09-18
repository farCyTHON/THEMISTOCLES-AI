import type { AgentEntity } from "./types";

export const agents: AgentEntity[] = [
  {
    id: "agent-drift",
    name: "Policy Drift Sentinel",
    description:
      "Continuously scans sales decks, internal documentation, and operational repositories to detect policy divergence from ratified decisions.",
    role: "Governance & Consistency",
    status: "active",
    interval: "Every 4 hours",
    lastRun: "2026-09-18T18:00:00",
    findingsCount: 2,
    activeFindings: [
      {
        id: "find-drift-01",
        detectedAt: "2026-09-15T16:45:00",
        summary: "EMEA Sales templates still circulating monthly billing terms contradictory to Decision #142.",
        severity: "high",
        relatedEntityKind: "decision",
        relatedEntityId: "dec-142",
        actionId: "act-002",
      },
      {
        id: "find-drift-02",
        detectedAt: "2026-09-17T09:10:00",
        summary: "Engineering Slack consensus regarding Tuesday migration disagrees with SOP v2.3 documentation.",
        severity: "medium",
        relatedEntityKind: "process",
        relatedEntityId: "proc-migrate",
        actionId: "act-003",
      },
    ],
    targetScopes: ["Sales Repositories", "Decision Records", "Documentation SOPs"],
    rules: [
      "Cross-check proposal contract terms against Decision #142 mandates.",
      "Verify process attributes match currently ratified versions.",
      "Flag deprecated clauses that persist in active templates.",
    ],
  },
  {
    id: "agent-sla",
    name: "SLA Consistency Monitor",
    description:
      "Monitors commitments promised in outbound sales collateral against internal operational capacity and fulfillment benchmarks.",
    role: "Cross-Functional Alignment",
    status: "active",
    interval: "Every 12 hours",
    lastRun: "2026-09-18T12:30:00",
    findingsCount: 1,
    activeFindings: [
      {
        id: "find-sla-01",
        detectedAt: "2026-09-16T14:20:00",
        summary: "Sales Playbook guarantees 14-day onboarding while Customer Success policy mandates 30 days.",
        severity: "high",
        relatedEntityKind: "process",
        relatedEntityId: "proc-onboard",
        actionId: "act-001",
      },
    ],
    targetScopes: ["Customer Onboarding", "Support Escalations", "Sales Playbooks"],
    rules: [
      "Compare outward SLA guarantees against team headcount benchmarks.",
      "Flag delivery timelines with more than 5 days operational variance.",
      "Alert department heads when unapproved promises enter pitch collateral.",
    ],
  },
  {
    id: "agent-provenance",
    name: "Provenance & Evidence Sentinel",
    description:
      "Audits the organizational knowledge graph to ensure every strategic claim, policy, and workflow mutation is anchored in verified evidence.",
    role: "Knowledge Integrity",
    status: "evaluating",
    interval: "Daily at 00:00 UTC",
    lastRun: "2026-09-18T00:00:00",
    findingsCount: 1,
    activeFindings: [
      {
        id: "find-prov-01",
        detectedAt: "2026-09-14T08:00:00",
        summary: "Decision #117 (Legacy Monthly Billing) lacks attached primary evidence records.",
        severity: "low",
        relatedEntityKind: "decision",
        relatedEntityId: "dec-117",
      },
    ],
    targetScopes: ["Decisions", "Process Mutation Logs", "Source Connectors"],
    rules: [
      "Flag decisions lacking at least one corroborated primary quote.",
      "Verify meeting timestamps correlate with signed attendance records.",
      "Audit connector health if last sync exceeds 48 hours.",
    ],
  },
];
