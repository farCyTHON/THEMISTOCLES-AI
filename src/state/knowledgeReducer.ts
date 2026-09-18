import type { KnowledgeSnapshot, MutationResult } from "../data/types";
import { createInitialSnapshot } from "../data/seed";
import type { KnowledgeAction, KnowledgeState } from "./knowledgeContext";

const MUTATION_AT = "2026-09-17T22:43:00";

function applyMutation(snapshot: KnowledgeSnapshot): {
  next: KnowledgeSnapshot;
  mutation: MutationResult;
} {
  const processes = snapshot.processes.map((process) => {
    if (process.id !== "proc-migrate") return process;
    const history = process.history.map((item) => ({ ...item, isCurrent: false }));
    history.push({
      id: "proc-migrate-v24",
      version: "v2.4",
      createdAt: MUTATION_AT,
      summary: "Schedule changed · Tuesday morning",
      added: ["Tuesday morning schedule"],
      changed: ["Friday evening → Tuesday morning"],
      reasonLabel: "New Slack signal",
      isCurrent: true,
    });
    return {
      ...process,
      ownerPersonId: "person-sam",
      ownerTeamId: "team-engineering",
      currentVersion: "v2.4",
      lastUpdated: MUTATION_AT,
      recentChange: "Friday evening → Tuesday morning",
      attributeLabel: "Schedule",
      previousValue: "Friday evening",
      currentValue: "Tuesday morning",
      evidenceIds: ["ev-migrate-alex", "ev-migrate-sam"],
      relationships: [
        ...process.relationships.filter((rel) => rel.targetId !== "person-sam"),
        { targetKind: "person" as const, targetId: "person-sam", label: "maintained by" },
      ],
      whyExplanation:
        "A new Slack conversation in #engineering moved enterprise migrations from Friday evening to Tuesday morning. Sam Lee will maintain the migration checklist. Themistocles recorded this as Database Migration v2.4.",
      whySteps: [
        { label: "New signal", title: "Slack · #engineering", targetKind: "source" as const, targetId: "src-slack-eng" },
        { label: "Slack conversation", title: "Alex Chen and Sam Lee in #engineering" },
        { label: "Detected workflow change", title: "Friday evening → Tuesday morning" },
        {
          label: "Current process",
          title: "Database Migration v2.4",
          targetKind: "process" as const,
          targetId: "proc-migrate",
        },
      ],
      history,
    };
  });

  const evidence = [
    {
      id: "ev-migrate-alex",
      sourceId: "src-slack-eng",
      quote:
        "Starting next sprint, database migrations will move from Friday evening to Tuesday morning.",
      speaker: "Alex Chen",
      occurredAt: MUTATION_AT,
      relatedKind: "process" as const,
      relatedId: "proc-migrate",
    },
    {
      id: "ev-migrate-sam",
      sourceId: "src-slack-eng",
      quote: "I'll maintain the migration checklist.",
      speaker: "Sam Lee",
      occurredAt: MUTATION_AT,
      relatedKind: "process" as const,
      relatedId: "proc-migrate",
    },
    ...snapshot.evidence,
  ];

  const activities = [
    {
      id: "act-migrate-live",
      title: "Database Migration workflow updated",
      detail: "Friday evening → Tuesday morning · Version v2.4 created",
      occurredAt: MUTATION_AT,
      entityKind: "process" as const,
      entityId: "proc-migrate",
      sourceLabel: "Slack · #engineering",
      activityType: "Process changed",
      actorName: "Alex Chen",
      impactLevel: "high" as const,
    },
    ...snapshot.activities,
  ];

  const changes = [
    {
      id: "change-live",
      title: "Database migration moved to Tuesday morning",
      description: "Enterprise database migrations moved from Friday evening to Tuesday morning.",
      changeType: "process" as const,
      previousState: "Friday evening",
      currentState: "Tuesday morning",
      changedAt: MUTATION_AT,
      reason: "Engineering team decided Tuesday mornings are a better window for enterprise migrations.",
      actorPersonId: "person-alex",
      decisionId: undefined,
      evidenceIds: ["ev-migrate-alex", "ev-migrate-sam"],
      affectedEntities: [
        { kind: "process" as const, id: "proc-migrate", label: "Database Migration" },
        { kind: "system" as const, id: "sys-db", label: "Database" },
      ],
      whySteps: [
        { label: "Previous state", title: "Friday evening" },
        { label: "New signal", title: "Slack · #engineering", targetKind: "source" as const, targetId: "src-slack-eng" },
        { label: "Detected change", title: "Friday evening → Tuesday morning" },
        { label: "Current state", title: "Tuesday morning" },
      ],
    },
    ...snapshot.changes,
  ];

  const graphNodes = snapshot.graphNodes.map((node) => {
    if (node.id === "node-migrate") {
      return { ...node, subtitle: "Process · v2.4", y: 36 };
    }
    if (node.id === "node-d184") {
      return { ...node, x: 720, y: 276 };
    }
    return node;
  });

  if (!graphNodes.some((node) => node.id === "node-schedule")) {
    graphNodes.push({
      id: "node-schedule",
      kind: "process",
      entityId: "proc-migrate",
      label: "Tuesday Schedule",
      subtitle: "Window",
      x: 520,
      y: 156,
    });
  }
  if (!graphNodes.some((node) => node.id === "node-sam")) {
    graphNodes.push({
      id: "node-sam",
      kind: "person",
      entityId: "person-sam",
      label: "Sam Lee",
      subtitle: "Person",
      x: 490,
      y: 276,
    });
  }

  const graphEdges = [...snapshot.graphEdges];
  if (!graphEdges.some((edge) => edge.id === "e-migrate-schedule")) {
    graphEdges.push({
      id: "e-migrate-schedule",
      from: "node-migrate",
      to: "node-schedule",
      label: "now",
    });
  }
  if (!graphEdges.some((edge) => edge.id === "e-schedule-sam")) {
    graphEdges.push({
      id: "e-schedule-sam",
      from: "node-schedule",
      to: "node-sam",
      label: "maintained by",
    });
  }

  const searchHits = snapshot.searchHits.map((hit) => {
    if (hit.id === "q-week") {
      return {
        ...hit,
        answer:
          "Engineering updated the Deployment Process to require a Security review, and database migrations now happen Tuesday mornings.",
        answerDetail: "API Gateway ownership also moved from platform work in Engineering to Operations.",
        evidenceIds: ["ev-slack-184", "ev-migrate-alex"],
        related: [
          { targetKind: "process" as const, targetId: "proc-deploy", label: "changed" },
          { targetKind: "process" as const, targetId: "proc-migrate", label: "changed" },
          { targetKind: "system" as const, targetId: "sys-api", label: "ownership" },
        ],
      };
    }
    if (hit.id === "q-migrate") {
      return { ...hit, requiresMutation: false };
    }
    return hit;
  });

  return {
    next: {
      ...snapshot,
      processes,
      evidence,
      activities,
      changes,
      graphNodes,
      graphEdges,
      searchHits,
      mutationApplied: true,
    },
    mutation: {
      processId: "proc-migrate",
      processName: "Database Migration",
      previousValue: "Friday evening",
      currentValue: "Tuesday morning",
      ownerName: "Sam Lee",
      version: "v2.4",
    },
  };
}

export function createInitialState(): KnowledgeState {
  return {
    ...createInitialSnapshot(),
    status: "idle",
    completedSteps: 0,
    mutation: null,
    selectedGraphNodeId: null,
    emphasizedNodeIds: [],
    emphasizedEdgeIds: [],
    freshActivityId: null,
  };
}

export function knowledgeReducer(
  state: KnowledgeState,
  action: KnowledgeAction,
): KnowledgeState {
  switch (action.type) {
    case "select-graph-node":
      return { ...state, selectedGraphNodeId: action.id };
    case "move-graph-node":
      return {
        ...state,
        graphNodes: state.graphNodes.map((node) =>
          node.id === action.id ? { ...node, x: action.x, y: action.y } : node,
        ),
      };
    case "start-processing":
      if (state.mutationApplied || state.status === "processing") return state;
      return { ...state, status: "processing", completedSteps: 0 };
    case "advance-step":
      if (state.status !== "processing") return state;
      return { ...state, completedSteps: state.completedSteps + 1 };
    case "apply-mutation": {
      if (state.mutationApplied) {
        return { ...state, status: "complete" };
      }
      const { next, mutation } = applyMutation(state);
      return {
        ...next,
        status: "complete",
        completedSteps: state.processingSteps.length,
        mutation,
        selectedGraphNodeId: "node-migrate",
        emphasizedNodeIds: ["node-migrate", "node-schedule", "node-sam"],
        emphasizedEdgeIds: ["e-migrate-schedule", "e-schedule-sam", "e-eng-migrate"],
        freshActivityId: "act-migrate-live",
      };
    }
    case "resolve-conflict":
      return {
        ...state,
        conflicts: state.conflicts.map((conflict) =>
          conflict.id === action.id
            ? {
                ...conflict,
                status: "resolved",
                resolutionChoice: action.resolutionChoice,
                resolutionNotes: action.notes || "Resolved by organizational consensus.",
                resolvedBy: action.resolvedBy || "Alex Chen",
                resolvedAt: new Date().toISOString(),
              }
            : conflict,
        ),
      };
    case "update-conflict-status":
      return {
        ...state,
        conflicts: state.conflicts.map((conflict) =>
          conflict.id === action.id ? { ...conflict, status: action.status } : conflict,
        ),
      };
    case "toggle-watcher":
      return {
        ...state,
        watchers: state.watchers.map((w) =>
          w.id === action.id ? { ...w, isWatched: !w.isWatched } : w,
        ),
      };
    case "update-action-status": {
      const now = new Date().toISOString();
      const updatedAction = state.actions.find((a) => a.id === action.id);
      let activities = state.activities;

      if (action.status === "executed" && updatedAction) {
        activities = [
          {
            id: `act-exec-${Date.now()}`,
            title: `Action Executed: ${updatedAction.title}`,
            detail: action.result || "Operational change executed across systems.",
            occurredAt: now,
            entityKind: "action",
            entityId: action.id,
            actorName: action.executedBy || "Alex Chen",
            impactLevel: updatedAction.priority === "urgent" ? "high" : "medium",
            activityType: "execution",
          },
          ...state.activities,
        ];
      }

      return {
        ...state,
        actions: state.actions.map((a) =>
          a.id === action.id
            ? {
                ...a,
                status: action.status,
                executedAt: action.status === "executed" ? now : a.executedAt,
                executedBy: action.executedBy || a.executedBy,
                executionResult: action.result || a.executionResult,
              }
            : a,
        ),
        activities,
      };
    }
    case "toggle-agent-status":
      return {
        ...state,
        agents: state.agents.map((ag) =>
          ag.id === action.id
            ? { ...ag, status: ag.status === "active" ? "paused" : "active" }
            : ag,
        ),
      };
    case "trigger-agent-scan":
      return {
        ...state,
        agents: state.agents.map((ag) =>
          ag.id === action.id
            ? {
                ...ag,
                lastRun: new Date().toISOString(),
                status: "active",
              }
            : ag,
        ),
      };
    case "publish-artifact":
      return {
        ...state,
        artifacts: state.artifacts.map((art) =>
          art.id === action.id
            ? { ...art, status: "published", lastUpdated: new Date().toISOString() }
            : art,
        ),
      };
    case "trigger-source-sync": {
      const now = new Date().toISOString();
      return {
        ...state,
        sources: state.sources.map((s) =>
          s.id === action.id ? { ...s, lastSynced: now, connected: true } : s,
        ),
      };
    }
    case "reset":
      return createInitialState();
    default:
      return state;
  }
}
