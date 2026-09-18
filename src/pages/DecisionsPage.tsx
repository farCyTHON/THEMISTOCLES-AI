import { EntityCard } from "../components/ui/EntityCard";
import { useKnowledge } from "../state/knowledgeContext";
import { formatDate } from "../lib/format";

export function DecisionsPage() {
  const { state } = useKnowledge();
  return (
    <main className="page">
      <header className="page-header">
        <h2>Decisions</h2>
        <p>Durable organizational decisions, with the evidence that produced them.</p>
      </header>
      <div className="grid-cards" style={{ marginTop: 20 }}>
        {state.decisions.map((item) => (
          <EntityCard
            key={item.id}
            to={`/knowledge/decisions/${item.id}`}
            kind="decision"
            title={`Decision #${item.number}`}
            description={item.title}
            meta={`${item.madeBy} · ${formatDate(item.date)}`}
          />
        ))}
      </div>
    </main>
  );
}
