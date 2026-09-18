export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return `${formatDate(iso)} · ${date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function entityPath(kind: string, id: string): string {
  switch (kind) {
    case "process":
      return `/knowledge/processes/${id}`;
    case "decision":
      return `/knowledge/decisions/${id}`;
    case "change":
      return `/changes/${id}`;
    case "conflict":
      return `/conflicts/${id}`;
    case "action":
      return `/actions`;
    case "agent":
      return `/agents/${id}`;
    case "artifact":
      return `/artifacts/${id}`;
    case "person":
      return `/people/${id}`;
    case "project":
      return `/projects/${id}`;
    case "system":
    case "team":
    case "source":
      return `/knowledge/item/${kind}/${id}`;
    default:
      return "/knowledge";
  }
}

export function kindLabel(kind: string): string {
  switch (kind) {
    case "person":
      return "Person";
    case "team":
      return "Team";
    case "system":
      return "System";
    case "process":
      return "Process";
    case "decision":
      return "Decision";
    case "project":
      return "Project";
    case "source":
      return "Source";
    case "change":
      return "Change";
    case "conflict":
      return "Conflict";
    case "action":
      return "Action";
    case "agent":
      return "Agent";
    case "artifact":
      return "Artifact";
    default:
      return "Entity";
  }
}

export function formatRelativeTime(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return formatDate(iso);
}
