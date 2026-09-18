import { EntityCard } from "../components/ui/EntityCard";
import { useKnowledge } from "../state/knowledgeContext";
import { formatDate } from "../lib/format";

export function ProcessesPage() {
  const { state } = useKnowledge();
  return (
    <main className="page">
      <header className="page-header">
        <h2>Processes</h2>
        <p>Current operating procedures, with versions and the changes that produced them.</p>
      </header>
      <div className="grid-cards" style={{ marginTop: 20 }}>
        {state.processes.map((item) => (
          <EntityCard
            key={item.id}
            to={`/knowledge/processes/${item.id}`}
            kind="process"
            title={item.name}
            description={item.recentChange}
            meta={`${item.currentVersion} · ${formatDate(item.lastUpdated)}`}
          />
        ))}
      </div>
    </main>
  );
}
