export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="card empty">
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}
