import { NavLink, useNavigate } from "react-router-dom";
import { useKnowledge } from "../../state/knowledgeContext";

export function Sidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate: () => void;
}) {
  const { state } = useKnowledge();
  const navigate = useNavigate();
  const user = state.people.find((person) => person.id === state.currentUserId);
  const openConflictsCount = state.conflicts.filter((c) => c.status === "open").length;
  const pendingActionsCount = (state.actions || []).filter((a) => a.status !== "executed").length;

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">
        <div className="brand-mark" aria-hidden>
          T
        </div>
        <div>
          <h1>THEMISTOCLES</h1>
          <p>{state.organization.tagline}</p>
        </div>
      </div>

      <nav className="nav-section" aria-label="Primary" style={{ overflowY: "auto", flex: 1 }}>
        <div className="nav-label">Memory & Pulse</div>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onNavigate}
        >
          Home
        </NavLink>
        <NavLink
          to="/chat"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onNavigate}
          style={{ fontWeight: 600, color: "var(--accent)" }}
        >
          Themistocles Memory
        </NavLink>
        <NavLink
          to="/pulse"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onNavigate}
        >
          Pulse
        </NavLink>

        <div className="nav-label" style={{ marginTop: 12 }}>
          Intelligence & Operations
        </div>
        <NavLink
          to="/actions"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onNavigate}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span>Action Center</span>
          {pendingActionsCount > 0 ? (
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: "10px",
                backgroundColor: "var(--warning)",
                color: "#1a1200",
              }}
            >
              {pendingActionsCount}
            </span>
          ) : null}
        </NavLink>
        <NavLink
          to="/agents"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onNavigate}
        >
          Autonomous Agents
        </NavLink>
        <NavLink
          to="/artifacts"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onNavigate}
        >
          Living Artifacts
        </NavLink>
        <NavLink
          to="/conflicts"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onNavigate}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span>Conflicts</span>
          {openConflictsCount > 0 ? (
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: "10px",
                backgroundColor: "var(--danger)",
                color: "#ffffff",
              }}
            >
              {openConflictsCount}
            </span>
          ) : null}
        </NavLink>
        <NavLink
          to="/knowledge/health"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onNavigate}
        >
          Knowledge Health
        </NavLink>

        <div className="nav-label" style={{ marginTop: 12 }}>
          Organizational Knowledge
        </div>
        <NavLink
          to="/knowledge"
          end
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onNavigate}
        >
          Knowledge Hub
        </NavLink>
        <NavLink
          to="/knowledge/decisions"
          className={({ isActive }) => `nav-link nested ${isActive ? "active" : ""}`}
          onClick={onNavigate}
        >
          Decisions
        </NavLink>
        <NavLink
          to="/changes"
          className={({ isActive }) => `nav-link nested ${isActive ? "active" : ""}`}
          onClick={onNavigate}
        >
          Changes
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) => `nav-link nested ${isActive ? "active" : ""}`}
          onClick={onNavigate}
        >
          Projects
        </NavLink>
        <NavLink
          to="/people"
          className={({ isActive }) => `nav-link nested ${isActive ? "active" : ""}`}
          onClick={onNavigate}
        >
          People
        </NavLink>
        <NavLink
          to="/knowledge/processes"
          className={({ isActive }) => `nav-link nested ${isActive ? "active" : ""}`}
          onClick={onNavigate}
        >
          Processes
        </NavLink>
        <NavLink
          to="/knowledge/graph"
          className={({ isActive }) => `nav-link nested ${isActive ? "active" : ""}`}
          onClick={onNavigate}
        >
          Graph
        </NavLink>

        <div className="nav-label" style={{ marginTop: 12 }}>
          Stream & Inputs
        </div>
        <NavLink
          to="/activity"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onNavigate}
        >
          Activity stream
        </NavLink>
        <NavLink
          to="/sources"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          onClick={onNavigate}
        >
          Sources
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p className="nav-label">Workspace</p>
        <button
          className="workspace-chip"
          onClick={() => {
            onNavigate();
            navigate("/workspace");
          }}
        >
          <span className="avatar">AC</span>
          <span>
            {user?.name}
            <small>{state.organization.name} Organization</small>
          </span>
        </button>
        <NavLink to="/profile" className="nav-link" onClick={onNavigate}>
          User profile
        </NavLink>
        <NavLink to="/settings" className="nav-link" onClick={onNavigate}>
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
