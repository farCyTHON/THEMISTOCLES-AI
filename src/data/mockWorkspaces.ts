import type { WorkspaceScope } from "./types";

export const workspaces: WorkspaceScope[] = [
  {
    id: "ws-all",
    name: "Acme Global Organization",
    description: "Enterprise-wide organizational memory, covering cross-departmental decisions, governance, and company-wide policies.",
    leadPersonId: "person-alex",
    memberCount: 8,
    activeDecisionsCount: 8,
    pendingActionsCount: 3,
    connectedSystems: ["sys-payment", "sys-api", "sys-db", "sys-cicd"],
  },
  {
    id: "ws-eng",
    name: "Engineering & Security Workspace",
    description: "Technical operations, deployment release gates, database schema migrations, and infrastructure security protocols.",
    leadPersonId: "person-alex",
    memberCount: 3,
    activeDecisionsCount: 4,
    pendingActionsCount: 1,
    connectedSystems: ["sys-payment", "sys-db", "sys-cicd"],
  },
  {
    id: "ws-prod",
    name: "Product & Strategy Workspace",
    description: "Product initiatives including Project Atlas pricing restructuring, self-service customer portal, and release roadmaps.",
    leadPersonId: "person-sarah",
    memberCount: 2,
    activeDecisionsCount: 3,
    pendingActionsCount: 2,
    connectedSystems: ["sys-payment", "sys-api"],
  },
  {
    id: "ws-ops",
    name: "Sales & Operations Workspace",
    description: "Revenue operations, enterprise sales playbook alignment, customer onboarding SLAs, and support triage workflows.",
    leadPersonId: "person-james",
    memberCount: 3,
    activeDecisionsCount: 3,
    pendingActionsCount: 2,
    connectedSystems: ["sys-api"],
  },
];
