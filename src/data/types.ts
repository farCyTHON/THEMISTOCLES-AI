export type EntityKind =
  | "person"
  | "team"
  | "system"
  | "process"
  | "decision"
  | "project"
  | "source"
  | "change"
  | "conflict"
  | "action"
  | "agent"
  | "artifact";

export type SourceKind = "slack" | "teams" | "meeting" | "drive" | "github";

export type ProcessStatus = "current" | "deprecated";
export type DecisionStatus = "active" | "superseded";
export type ChangeType = "policy" | "decision" | "process" | "project" | "ownership" | "relationship";
export type ImpactLevel = "high" | "medium" | "low";

export interface Organization {
  id: string;
  name: string;
  tagline: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  teamId: string;
  email: string;
  department?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
}

export interface SystemEntity {
  id: string;
  name: string;
  description: string;
  ownerTeamId: string;
  previousOwnerTeamId?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerTeamId: string;
  ownerPersonId?: string;
  status?: "active" | "planning" | "completed" | "on-hold";
  lastUpdated?: string;
  decisionIds?: string[];
  processIds?: string[];
  signalCount?: number;
}

export interface Relationship {
  targetKind: EntityKind;
  targetId: string;
  label: string;
}

export interface ProcessVersion {
  id: string;
  version: string;
  createdAt: string;
  summary: string;
  added: string[];
  changed: string[];
  reasonDecisionId?: string;
  reasonLabel?: string;
  isCurrent: boolean;
}

export interface WhyStep {
  label: string;
  title: string;
  targetKind?: EntityKind;
  targetId?: string;
}

export interface ProcessEntity {
  id: string;
  name: string;
  description: string;
  ownerTeamId: string;
  ownerPersonId?: string;
  status: ProcessStatus;
  currentVersion: string;
  lastUpdated: string;
  recentChange: string;
  attributeLabel?: string;
  previousValue?: string;
  currentValue?: string;
  relationships: Relationship[];
  evidenceIds: string[];
  history: ProcessVersion[];
  whyExplanation?: string;
  whySteps?: WhyStep[];
}

export interface Decision {
  id: string;
  number: number;
  title: string;
  summary: string;
  madeBy: string;
  date: string;
  impactProcessId?: string;
  impactLabel: string;
  status: DecisionStatus;
  evidenceIds: string[];
  reason?: string;
  affectedEntities?: { kind: EntityKind; id: string; label: string }[];
  supersededDecisionId?: string;
  personIds?: string[];
}

export interface Source {
  id: string;
  kind: SourceKind;
  name: string;
  location: string;
  connected: boolean;
  lastSynced: string;
}

export type EvidenceReliability = "verified" | "supported" | "needs-review" | "conflicting";
export type ConflictSeverity = "high" | "medium" | "low";
export type ConflictStatus = "open" | "under-review" | "resolved";

export interface Evidence {
  id: string;
  sourceId: string;
  quote: string;
  speaker?: string;
  occurredAt: string;
  meetingMark?: string;
  relatedKind: EntityKind;
  relatedId: string;
  title?: string;
  reliability?: EvidenceReliability;
  sourceType?: "slack" | "teams" | "meeting" | "document" | "policy";
  excerpt?: string;
  relatedDecisionId?: string;
  url?: string;
}

export interface ConflictSource {
  title: string;
  sourceName: string;
  sourceKind?: SourceKind | "policy" | "document";
  claim: string;
  date?: string;
  actor?: string;
  evidenceId?: string;
}

export interface Conflict {
  id: string;
  topic: string;
  severity: ConflictSeverity;
  status: ConflictStatus;
  detectedAt: string;
  summary: string;
  sourceA: ConflictSource;
  sourceB: ConflictSource;
  affectedEntities: { kind: EntityKind; id: string; label: string }[];
  impactedAreas: string[];
  relatedDecisionId?: string;
  resolutionChoice?: "sourceA" | "sourceB" | "custom";
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface Watcher {
  id: string;
  topic: string;
  targetKind: EntityKind;
  targetId: string;
  lastChange: string;
  status: string;
  recentSignals: string[];
  relatedDecisionId?: string;
  isWatched: boolean;
}

export type ActionStatus = "proposed" | "under-review" | "approved" | "executed" | "dismissed";
export type ActionPriority = "urgent" | "high" | "medium" | "low";

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: ActionPriority;
  status: ActionStatus;
  proposedAt: string;
  proposedBy: string;
  assignedTo: string;
  targetKind: EntityKind;
  targetId: string;
  source?: string;
  reason?: string;
  evidenceIds?: string[];
  relatedDecisionId?: string;
  relatedConflictId?: string;
  impactSummary: string;
  affectedEntities: { kind: EntityKind; id: string; label: string }[];
  executedAt?: string;
  executedBy?: string;
  executionResult?: string;
  dismissedAt?: string;
  dismissedBy?: string;
  dismissReason?: string;
  updatedAt?: string;
}

export type AgentStatus = "active" | "paused" | "evaluating";

export interface AgentFinding {
  id: string;
  detectedAt: string;
  summary: string;
  severity: "high" | "medium" | "low";
  relatedEntityKind: EntityKind;
  relatedEntityId: string;
  actionId?: string;
}

export interface AgentEntity {
  id: string;
  name: string;
  description: string;
  role: string;
  status: AgentStatus;
  interval: string;
  lastRun: string;
  findingsCount: number;
  activeFindings: AgentFinding[];
  targetScopes: string[];
  rules: string[];
}

export interface ArtifactVersion {
  version: string;
  updatedAt: string;
  author: string;
  summary: string;
}

export interface LivingArtifact {
  id: string;
  title: string;
  category: "brief" | "sop" | "policy" | "report";
  status: "published" | "draft" | "review";
  lastUpdated: string;
  authorPersonId: string;
  currentVersion: string;
  summary: string;
  content: string;
  evidenceIds: string[];
  relatedDecisionIds: string[];
  relatedProjectIds: string[];
  history: ArtifactVersion[];
}

export interface WorkspaceScope {
  id: string;
  name: string;
  description: string;
  leadPersonId: string;
  memberCount: number;
  activeDecisionsCount: number;
  pendingActionsCount: number;
  connectedSystems: string[];
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  occurredAt: string;
  entityKind: EntityKind;
  entityId: string;
  sourceLabel?: string;
  activityType?: string;
  actorName?: string;
  impactLevel?: ImpactLevel;
}

export interface Change {
  id: string;
  title: string;
  description: string;
  changeType: ChangeType;
  previousState: string;
  currentState: string;
  changedAt: string;
  reason?: string;
  actorPersonId?: string;
  approverPersonId?: string;
  decisionId?: string;
  evidenceIds: string[];
  affectedEntities: { kind: EntityKind; id: string; label: string }[];
  whySteps?: WhyStep[];
}

export interface GraphNode {
  id: string;
  kind: EntityKind;
  entityId: string;
  label: string;
  subtitle?: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface SearchHit {
  id: string;
  query: string;
  keywords: string[];
  answer: string;
  answerDetail?: string;
  entityKind: EntityKind;
  entityId: string;
  evidenceIds: string[];
  related: Relationship[];
  relatedDecisionId?: string;
  relatedProcessId?: string;
  requiresMutation?: boolean;
}

export interface ProcessingStep {
  id: string;
  label: string;
}

export interface InjectedSignal {
  channel: string;
  messages: { speaker: string; text: string }[];
}

export interface MutationResult {
  processId: string;
  processName: string;
  previousValue: string;
  currentValue: string;
  ownerName: string;
  version: string;
}

export interface KnowledgeSnapshot {
  organization: Organization;
  currentUserId: string;
  people: Person[];
  teams: Team[];
  systems: SystemEntity[];
  projects: Project[];
  processes: ProcessEntity[];
  decisions: Decision[];
  sources: Source[];
  evidence: Evidence[];
  activities: ActivityItem[];
  changes: Change[];
  conflicts: Conflict[];
  watchers: Watcher[];
  actions: ActionItem[];
  agents: AgentEntity[];
  artifacts: LivingArtifact[];
  workspaces: WorkspaceScope[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  searchHits: SearchHit[];
  signal: InjectedSignal;
  processingSteps: ProcessingStep[];
  mutationApplied: boolean;
}
