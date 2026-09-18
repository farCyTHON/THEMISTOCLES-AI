import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { HomePage } from "./pages/HomePage";
import { PulsePage } from "./pages/PulsePage";
import { MemoryChatPage } from "./pages/MemoryChatPage";
import { ActionsPage } from "./pages/ActionsPage";
import { AgentsPage } from "./pages/AgentsPage";
import { AgentDetailPage } from "./pages/AgentDetailPage";
import { ArtifactsPage } from "./pages/ArtifactsPage";
import { ArtifactDetailPage } from "./pages/ArtifactDetailPage";
import { ConflictsPage } from "./pages/ConflictsPage";
import { ConflictDetailPage } from "./pages/ConflictDetailPage";
import { KnowledgeHealthPage } from "./pages/KnowledgeHealthPage";
import { ChangesPage } from "./pages/ChangesPage";
import { ChangeDetailPage } from "./pages/ChangeDetailPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { PeoplePage } from "./pages/PeoplePage";
import { PersonDetailPage } from "./pages/PersonDetailPage";
import { KnowledgePage } from "./pages/KnowledgePage";
import { GraphPage } from "./pages/GraphPage";
import { ProcessesPage } from "./pages/ProcessesPage";
import { ProcessDetailPage } from "./pages/ProcessDetailPage";
import { DecisionsPage } from "./pages/DecisionsPage";
import { DecisionDetailPage } from "./pages/DecisionDetailPage";
import { EntityPage } from "./pages/EntityPage";
import { ActivityPage } from "./pages/ActivityPage";
import { SourcesPage } from "./pages/SourcesPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/pulse" element={<PulsePage />} />
        <Route path="/chat" element={<MemoryChatPage />} />

        {/* Phase 3: Operations, Governance & Artifacts */}
        <Route path="/actions" element={<ActionsPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/agents/:id" element={<AgentDetailPage />} />
        <Route path="/artifacts" element={<ArtifactsPage />} />
        <Route path="/artifacts/:id" element={<ArtifactDetailPage />} />

        {/* Phase 2: Conflicts & Health */}
        <Route path="/conflicts" element={<ConflictsPage />} />
        <Route path="/conflicts/:id" element={<ConflictDetailPage />} />
        <Route path="/knowledge/health" element={<KnowledgeHealthPage />} />

        {/* Phase 1 & 2: Changes & Projects & People */}
        <Route path="/changes" element={<ChangesPage />} />
        <Route path="/changes/:id" element={<ChangeDetailPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/people/:id" element={<PersonDetailPage />} />

        {/* Knowledge & Existing Hub */}
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/knowledge/graph" element={<GraphPage />} />
        <Route path="/knowledge/processes" element={<ProcessesPage />} />
        <Route path="/knowledge/processes/:id" element={<ProcessDetailPage />} />
        <Route path="/knowledge/decisions" element={<DecisionsPage />} />
        <Route path="/knowledge/decisions/:id" element={<DecisionDetailPage />} />
        <Route path="/knowledge/item/:kind/:id" element={<EntityPage />} />

        {/* Streams & Workspace */}
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/sources" element={<SourcesPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
