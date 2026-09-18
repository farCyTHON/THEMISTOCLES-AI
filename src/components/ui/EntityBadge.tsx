export function EntityBadge({ kind, label }: { kind: string; label?: string }) {
  return <span className={`badge ${kind}`}>{label ?? kind}</span>;
}
