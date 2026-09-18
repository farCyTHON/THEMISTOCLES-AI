import { actions } from "./mockActions";
import { activities } from "./mockActivities";
import { agents } from "./mockAgents";
import { artifacts } from "./mockArtifacts";
import { changes } from "./mockChanges";
import { conflicts } from "./mockConflicts";
import { decisions } from "./mockDecisions";
import { graphEdges, graphNodes, searchHits } from "./mockKnowledgeGraph";
import { currentUserId, organization, people } from "./mockOrganization";
import { processes } from "./mockProcesses";
import { evidence, sources } from "./mockSources";
import { projects, systems } from "./mockSystems";
import { teams } from "./mockTeams";
import { watchers } from "./mockWatchers";
import { workspaces } from "./mockWorkspaces";
import type { KnowledgeSnapshot } from "./types";

export function createInitialSnapshot(): KnowledgeSnapshot {
  return {
    organization,
    currentUserId,
    people: structuredClone(people),
    teams: structuredClone(teams),
    systems: structuredClone(systems),
    projects: structuredClone(projects),
    processes: structuredClone(processes),
    decisions: structuredClone(decisions),
    sources: structuredClone(sources),
    evidence: structuredClone(evidence),
    activities: structuredClone(activities),
    changes: structuredClone(changes),
    conflicts: structuredClone(conflicts),
    watchers: structuredClone(watchers),
    actions: structuredClone(actions),
    agents: structuredClone(agents),
    artifacts: structuredClone(artifacts),
    workspaces: structuredClone(workspaces),
    graphNodes: structuredClone(graphNodes),
    graphEdges: structuredClone(graphEdges),
    searchHits: structuredClone(searchHits),
    signal: {
      channel: "#engineering",
      messages: [
        {
          speaker: "Alex Chen",
          text: "Starting next sprint, database migrations will move from Friday evening to Tuesday morning.",
        },
        {
          speaker: "Sam Lee",
          text: "I'll maintain the migration checklist.",
        },
      ],
    },
    processingSteps: [
      { id: "s1", label: "Signal ingested" },
      { id: "s2", label: "Entities identified" },
      { id: "s3", label: "Existing process matched" },
      { id: "s4", label: "Decision detected" },
      { id: "s5", label: "Workflow change detected" },
      { id: "s6", label: "Knowledge graph updated" },
      { id: "s7", label: "Version created" },
    ],
    mutationApplied: false,
  };
}
