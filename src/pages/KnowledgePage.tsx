import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EntityCard } from "../components/ui/EntityCard";
import { EmptyState } from "../components/ui/EmptyState";
import { ActivityItem } from "../components/ui/ActivityItem";
import { useKnowledge } from "../state/knowledgeContext";
import { entityPath, formatDate } from "../lib/format";

export function KnowledgePage() {
  const { state } = useKnowledge();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const collections = useMemo(() => {
    const q = query.toLowerCase();
    return {
      people: state.people.filter((item) => item.name.toLowerCase().includes(q)),
      systems: state.systems.filter((item) => item.name.toLowerCase().includes(q)),
      processes: state.processes.filter((item) => item.name.toLowerCase().includes(q)),
      decisions: state.decisions.filter(
        (item) => item.title.toLowerCase().includes(q) || String(item.number).includes(q),
      ),
      projects: state.projects.filter((item) => item.name.toLowerCase().includes(q)),
    };
  }, [query, state]);

  const empty =
    !collections.people.length &&
    !collections.systems.length &&
    !collections.processes.length &&
    !collections.decisions.length &&
    !collections.projects.length;

  return (
    <main className="page">
      <header className="page-header">
        <h2>Knowledge</h2>
        <p>Browse the people, systems, processes, and decisions Acme currently remembers.</p>
      </header>
      <div className="filter">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search knowledge..."
          aria-label="Search knowledge"
        />
      </div>

      {empty ? (
        <EmptyState title="No knowledge found." body="Try a broader search." />
      ) : (
        <>
          <Section title="People">
            {collections.people.map((item) => (
              <EntityCard
                key={item.id}
                to={entityPath("person", item.id)}
                kind="person"
                title={item.name}
                description={item.role}
              />
            ))}
          </Section>
          <Section title="Systems">
            {collections.systems.map((item) => (
              <EntityCard
                key={item.id}
                to={entityPath("system", item.id)}
                kind="system"
                title={item.name}
                description={item.description}
              />
            ))}
          </Section>
          <Section title="Processes">
            {collections.processes.map((item) => (
              <EntityCard
                key={item.id}
                to={`/knowledge/processes/${item.id}`}
                kind="process"
                title={item.name}
                description={item.recentChange}
                meta={`${item.currentVersion} · Updated ${formatDate(item.lastUpdated)}`}
              />
            ))}
          </Section>
          <Section title="Decisions">
            {collections.decisions.map((item) => (
              <EntityCard
                key={item.id}
                to={`/knowledge/decisions/${item.id}`}
                kind="decision"
                title={`Decision #${item.number}`}
                description={item.title}
                meta={formatDate(item.date)}
              />
            ))}
          </Section>
          {collections.projects.length ? (
            <Section title="Projects">
              {collections.projects.map((item) => (
                <EntityCard
                  key={item.id}
                  to={entityPath("project", item.id)}
                  kind="project"
                  title={item.name}
                  description={item.description}
                />
              ))}
            </Section>
          ) : null}
          <section className="section">
            <div className="section-head">
              <h3>Recently changed</h3>
              <Link to="/activity">View activity</Link>
            </div>
            <div className="card list">
              {state.activities.slice(0, 3).map((item) => (
                <ActivityItem
                  key={item.id}
                  title={item.title}
                  detail={item.detail}
                  occurredAt={item.occurredAt}
                  isFresh={item.id === state.freshActivityId}
                  onClick={() => navigate(entityPath(item.entityKind, item.entityId))}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <div className="section-head">
        <h3>{title}</h3>
      </div>
      <div className="grid-cards">{children}</div>
    </section>
  );
}
