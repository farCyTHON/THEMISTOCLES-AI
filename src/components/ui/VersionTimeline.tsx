import type { ProcessVersion } from "../../data/types";

export function VersionTimeline({
  versions,
  selectedId,
  onSelect,
}: {
  versions: ProcessVersion[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const ordered = [...versions].reverse();
  return (
    <div className="card version-list">
      {ordered.map((version) => (
        <button
          key={version.id}
          className={`version-item ${selectedId === version.id ? "selected" : ""}`}
          onClick={() => onSelect(version.id)}
        >
          <strong>{version.version}</strong>
          <span>{version.summary}</span>
          <span className="tiny">{version.isCurrent ? "Current" : ""}</span>
        </button>
      ))}
    </div>
  );
}
