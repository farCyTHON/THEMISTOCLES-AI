import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useKnowledge } from "../../state/knowledgeContext";
import { entityPath, formatDate } from "../../lib/format";

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  targetKind: string;
  targetId: string;
}

export function NotificationPopover({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state } = useKnowledge();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  const notifications: NotificationItem[] = [];

  if (state.mutationApplied && state.mutation) {
    notifications.push({
      id: "notif-mutation",
      title: "Workflow updated",
      detail: `${state.mutation.processName} → ${state.mutation.version}`,
      time: "Just now",
      targetKind: "process",
      targetId: state.mutation.processId,
    });
  }

  notifications.push({
    id: "notif-dec-184",
    title: "Decision recorded",
    detail: "Decision #184 — Security review",
    time: formatDate("2026-09-12T14:43:00"),
    targetKind: "decision",
    targetId: "dec-184",
  });

  notifications.push({
    id: "notif-api-own",
    title: "Ownership changed",
    detail: "API Gateway → Operations",
    time: formatDate("2026-09-08T11:05:00"),
    targetKind: "system",
    targetId: "sys-api",
  });

  if (!open) return null;

  return (
    <div className="notif-popover" ref={ref}>
      <div className="notif-header">
        <strong>Notifications</strong>
      </div>
      <div className="notif-list">
        {notifications.map((item) => (
          <button
            key={item.id}
            className="notif-item"
            onClick={() => {
              onClose();
              navigate(entityPath(item.targetKind, item.targetId));
            }}
          >
            <span className="notif-title">{item.title}</span>
            <span className="notif-detail">{item.detail}</span>
            <span className="notif-time">{item.time}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
