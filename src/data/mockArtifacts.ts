import type { LivingArtifact } from "./types";

export const artifacts: LivingArtifact[] = [
  {
    id: "art-pricing-brief",
    title: "Enterprise Pricing Restructure Brief — Project Atlas",
    category: "brief",
    status: "published",
    lastUpdated: "2026-09-15T10:00:00",
    authorPersonId: "person-sarah",
    currentVersion: "v1.2",
    summary:
      "Strategic synthesis documenting the migration of Enterprise accounts from monthly billing to annual upfront contracts, revenue impact models, and cross-functional transition workflows.",
    content: `### Executive Summary

Under Decision #142 ratified on September 14, 2026, Acme has formally transitioned all enterprise contracts from monthly invoicing to mandatory annual upfront agreements. This initiative—tracked internally as Project Atlas—simplifies procurement friction, stabilizes cash flow, and aligns product delivery with long-term customer value.

### Strategic Drivers & Evidence

1. **Revenue Predictability**: Finance cohort analysis indicated that annual commitments increase operational revenue predictability by 40% over four trailing quarters.
2. **Customer Procurement Alignment**: Feedback from the Customer Advisory Council (facilitated by Rachel Kim) highlighted that enterprise finance departments prefer annual PO cycles over monthly invoice approvals.
3. **Sales Workflow Realignment**: In response, Sales Director James Okafor updated standard proposal templates and revised target compensation to incentivize annual renewals.

### Active Alignments & Safeguards

- Legacy proposal templates lingering in EMEA regional drives have been flagged by the Policy Drift Sentinel (Action act-002) for immediate deprecation.
- Customer onboarding workflows are currently being calibrated to guarantee dedicated CSM assignment over a standardized 30-day window.`,
    evidenceIds: [
      "ev-pricing-finance",
      "ev-pricing-sales",
      "ev-pricing-customer",
      "ev-pricing-leadership",
    ],
    relatedDecisionIds: ["dec-142", "dec-138"],
    relatedProjectIds: ["proj-atlas"],
    history: [
      {
        version: "v1.0",
        updatedAt: "2026-09-14T11:00:00",
        author: "Sarah Ahmed",
        summary: "Initial draft following ratification of Decision #142.",
      },
      {
        version: "v1.1",
        updatedAt: "2026-09-14T16:30:00",
        author: "James Okafor",
        summary: "Appended sales playbook transition guidelines and proposal deck references.",
      },
      {
        version: "v1.2",
        updatedAt: "2026-09-15T10:00:00",
        author: "Sarah Ahmed",
        summary: "Incorporated Finance cohort models and published as living artifact.",
      },
    ],
  },
  {
    id: "art-deploy-standard",
    title: "Production Release & Security Review Standard v3.2",
    category: "sop",
    status: "published",
    lastUpdated: "2026-09-13T14:00:00",
    authorPersonId: "person-maya",
    currentVersion: "v3.2",
    summary:
      "Official operational standard governing code deployments to production environments, enforcing mandatory two-person engineering review and security validation.",
    content: `### Purpose & Policy Authority

This Standard enforces the operational mandate established in Decision #184: Every production deployment must pass a verified Security Review gate before release into live clusters.

### Gate Sequence

1. **Code Freeze & Pre-Check**: Continuous Integration tests and static vulnerability scans must report clean status.
2. **Peer Review**: Minimum of two Engineering reviewers (including service codeowners).
3. **Security Gate**: Mandatory sign-off by a certified Security Engineer (Maya Patel or designated on-call delegate).
4. **Canary Staging**: 10% traffic rollout with telemetry monitoring for 15 minutes before global deployment.

### Audit & Compliance

- All approvals are cryptographically linked to Git commit SHAs and logged in Themistocles Activity Stream.
- Production pushes without two-gate confirmation automatically trigger a Sev-1 incident and page Security on-call.`,
    evidenceIds: ["ev-slack-184", "ev-meeting-184"],
    relatedDecisionIds: ["dec-184", "dec-172"],
    relatedProjectIds: ["proj-payments", "proj-security"],
    history: [
      {
        version: "v3.0",
        updatedAt: "2026-03-18T11:20:00",
        author: "Alex Chen",
        summary: "Staging approval gate introduced.",
      },
      {
        version: "v3.1",
        updatedAt: "2026-07-22T16:40:00",
        author: "Daniel Kim",
        summary: "Deployment ownership transfer documented.",
      },
      {
        version: "v3.2",
        updatedAt: "2026-09-13T14:00:00",
        author: "Maya Patel",
        summary: "Mandatory security gate codified pursuant to Decision #184.",
      },
    ],
  },
  {
    id: "art-onboarding-report",
    title: "Customer Onboarding Capacity & SLA Harmonization Report",
    category: "report",
    status: "review",
    lastUpdated: "2026-09-16T16:00:00",
    authorPersonId: "person-rachel",
    currentVersion: "v1.0",
    summary:
      "Cross-functional analysis evaluating customer onboarding benchmarks, CSM workload distribution, and recommending resolution for the 14-day vs 30-day SLA dispute.",
    content: `### Context of Discrepancy

A contradiction currently exists between Customer Success Policy v2.1 (which defines enterprise onboarding as a 30-day guided program) and the Q3 Sales Playbook (which advertises a 14-day rapid deployment guarantee).

### Workload & Fulfillment Findings

- Analysis of 18 enterprise accounts boarded during Q2 revealed an average time-to-full-activation of 28.4 days.
- Accelerating onboarding under 14 days resulted in a 35% increase in post-launch support escalations.
- Customer satisfaction scores (CSAT) were 22% higher among cohorts that completed the comprehensive 30-day onboarding sequence.

### Proposed Resolution

1. Adopt 30 days as the universal contract commitment across all sales collateral (Action act-001).
2. Introduce a 'Fast-Track Technical Checklist' for low-complexity accounts without altering formal contractual SLAs.`,
    evidenceIds: ["ev-pricing-customer", "ev-onboard"],
    relatedDecisionIds: ["dec-138", "dec-155"],
    relatedProjectIds: ["proj-atlas"],
    history: [
      {
        version: "v1.0",
        updatedAt: "2026-09-16T16:00:00",
        author: "Rachel Kim",
        summary: "Initial draft submitted to Executive leadership for conflict resolution.",
      },
    ],
  },
];
