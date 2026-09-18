import { useKnowledge } from "../state/knowledgeContext";

export function ProfilePage() {
  const { state } = useKnowledge();
  const user = state.people.find((person) => person.id === state.currentUserId);
  const team = state.teams.find((item) => item.id === user?.teamId);
  return (
    <main className="page">
      <header className="page-header">
        <h2>User profile</h2>
        <p>You are viewing Acme as an employee, not as a platform administrator.</p>
      </header>
      <section className="card" style={{ padding: 18, marginTop: 18 }}>
        <dl className="kv">
          <dt>Name</dt>
          <dd>{user?.name}</dd>
          <dt>Role</dt>
          <dd>{user?.role}</dd>
          <dt>Team</dt>
          <dd>{team?.name}</dd>
          <dt>Email</dt>
          <dd>{user?.email}</dd>
        </dl>
      </section>
    </main>
  );
}
