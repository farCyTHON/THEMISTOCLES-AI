import type { Watcher } from "./types";

export const watchers: Watcher[] = [
  {
    id: "watch-atlas",
    topic: "Project Atlas (Enterprise Pricing Restructure)",
    targetKind: "project",
    targetId: "proj-atlas",
    lastChange: "Enterprise pricing policy changed to annual contracts",
    status: "Active monitoring · 1 open conflict",
    recentSignals: [
      "Decision #142 ratified annual billing model",
      "Conflicting monthly terms identified in EMEA proposal templates",
      "Sales onboarding workflows updated by James Okafor",
    ],
    relatedDecisionId: "dec-142",
    isWatched: true,
  },
  {
    id: "watch-onboard",
    topic: "Customer & Employee Onboarding",
    targetKind: "process",
    targetId: "proc-onboard",
    lastChange: "First-week organizational memory access checklist added",
    status: "Attention required · Onboarding period mismatch",
    recentSignals: [
      "CS Policy 30-day requirement vs Sales Playbook 14-day SLA dispute",
      "New hire feedback: Ramp time decreased by 25% with Themistocles",
    ],
    relatedDecisionId: "dec-155",
    isWatched: true,
  },
  {
    id: "watch-deploy",
    topic: "Production Deployment Gate",
    targetKind: "process",
    targetId: "proc-deploy",
    lastChange: "Security review checkpoint made mandatory in v3.2",
    status: "Healthy · 2-gate sequence operating normally",
    recentSignals: [
      "Maya Patel confirmed Security Review completed for 100% of releases",
      "Decision #184 applied across Engineering and Operations",
    ],
    relatedDecisionId: "dec-184",
    isWatched: true,
  },
  {
    id: "watch-payment",
    topic: "Payment Service Reliability",
    targetKind: "system",
    targetId: "sys-payment",
    lastChange: "Two-person review requirement enforced",
    status: "Stable · Monitored for schema migration window",
    recentSignals: [
      "Alex Chen logged schema migration schedule conflict with sam.lee",
      "Zero failed deploys since two-person review policy (Decision #172)",
    ],
    relatedDecisionId: "dec-172",
    isWatched: false,
  },
];
