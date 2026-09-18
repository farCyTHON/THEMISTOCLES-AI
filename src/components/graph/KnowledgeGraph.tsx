import { useEffect, useMemo, useRef, useState } from "react";
import type { GraphEdge, GraphNode } from "../../data/types";

const KIND_COLOR: Record<string, string> = {
  person: "#3867D6",
  team: "#2E6B8A",
  system: "#3867D6",
  process: "#2E9B67",
  decision: "#7567D8",
  project: "#D98C2B",
  source: "#667085",
};

export function KnowledgeGraph({
  nodes,
  edges,
  selectedId,
  emphasizedNodeIds = [],
  emphasizedEdgeIds = [],
  onSelect,
  onMove,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId: string | null;
  emphasizedNodeIds?: string[];
  emphasizedEdgeIds?: string[];
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
}) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 24, y: 24 });
  const drag = useRef<{
    mode: "pan" | "node";
    id?: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const neighbors = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const set = new Set<string>([selectedId]);
    edges.forEach((edge) => {
      if (edge.from === selectedId) set.add(edge.to);
      if (edge.to === selectedId) set.add(edge.from);
    });
    return set;
  }, [edges, selectedId]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const current = drag.current;
      if (!current) return;
      const dx = (event.clientX - current.startX) / scale;
      const dy = (event.clientY - current.startY) / scale;
      if (current.mode === "pan") {
        setPan({ x: current.origX + event.clientX - current.startX, y: current.origY + event.clientY - current.startY });
      } else if (current.id) {
        onMove(current.id, current.origX + dx, current.origY + dy);
      }
    };
    const up = () => {
      drag.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [onMove, scale]);

  return (
    <div
      className="card graph-canvas"
      onWheel={(event) => {
        event.preventDefault();
        const next = Math.min(1.8, Math.max(0.6, scale + (event.deltaY > 0 ? -0.08 : 0.08)));
        setScale(next);
      }}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).dataset.node) return;
        drag.current = { mode: "pan", startX: event.clientX, startY: event.clientY, origX: pan.x, origY: pan.y };
        onSelect(null);
      }}
    >
      <div className="graph-toolbar">
        <button className="btn" onClick={() => setScale((value) => Math.min(1.8, value + 0.1))}>
          Zoom in
        </button>
        <button className="btn" onClick={() => setScale((value) => Math.max(0.6, value - 0.1))}>
          Zoom out
        </button>
      </div>
      <svg width="100%" height="100%" role="img" aria-label="Organizational knowledge graph">
        <g transform={`translate(${pan.x} ${pan.y}) scale(${scale})`}>
          {edges.map((edge) => {
            const from = nodes.find((node) => node.id === edge.from);
            const to = nodes.find((node) => node.id === edge.to);
            if (!from || !to) return null;
            const emphasized = emphasizedEdgeIds.includes(edge.id);
            const relatedToSelection = !selectedId || (neighbors.has(edge.from) && neighbors.has(edge.to));
            const dimmed = selectedId
              ? !relatedToSelection
              : emphasizedNodeIds.length > 0 && !emphasized;
            const x1 = from.x + 90;
            const y1 = from.y + 24;
            const x2 = to.x + 90;
            const y2 = to.y + 24;
            return (
              <g key={edge.id} opacity={dimmed ? 0.25 : 1}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={emphasized ? "var(--accent)" : "var(--border-strong)"}
                  strokeWidth={emphasized ? 2.5 : 1.5}
                />
                {edge.label ? (
                  <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}>
                    <rect
                      x={-(edge.label.length * 3.4 + 8)}
                      y="-12"
                      width={edge.label.length * 6.8 + 16}
                      height="16"
                      rx="4"
                      fill="var(--surface)"
                      stroke="var(--border)"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="0"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fill="var(--text-secondary)"
                      fontSize="10"
                      fontWeight="500"
                    >
                      {edge.label}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
          {nodes.map((node) => {
            const emphasized = emphasizedNodeIds.includes(node.id);
            const selected = node.id === selectedId;
            const color = KIND_COLOR[node.kind] ?? "#667085";
            const dimmed = selectedId
              ? !neighbors.has(node.id)
              : emphasizedNodeIds.length > 0 && !emphasized;
            return (
              <g
                key={node.id}
                className={emphasized ? "graph-emphasis" : undefined}
                transform={`translate(${node.x} ${node.y})`}
                opacity={dimmed ? 0.38 : 1}
                data-node="true"
                onPointerDown={(event) => {
                  event.stopPropagation();
                  drag.current = {
                    mode: "node",
                    id: node.id,
                    startX: event.clientX,
                    startY: event.clientY,
                    origX: node.x,
                    origY: node.y,
                  };
                  onSelect(node.id);
                }}
                style={{ cursor: "grab" }}
              >
                <rect
                  width="180"
                  height="48"
                  rx="8"
                  fill="var(--surface)"
                  stroke={selected || emphasized ? color : "var(--border)"}
                  strokeWidth={selected ? 2.5 : emphasized ? 2 : 1}
                  data-node="true"
                />
                <rect width="4" height="48" rx="2" fill={color} data-node="true" />
                <text x="14" y="20" fontSize="13" fontWeight="600" fill="var(--text)" data-node="true">
                  {node.label}
                </text>
                <text x="14" y="36" fontSize="11" fill="var(--text-secondary)" data-node="true">
                  {node.subtitle}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <div className="legend">
        {Object.entries({
          People: KIND_COLOR.person,
          Teams: KIND_COLOR.team,
          Systems: KIND_COLOR.system,
          Processes: KIND_COLOR.process,
          Decisions: KIND_COLOR.decision,
          Projects: KIND_COLOR.project,
        }).map(([label, color]) => (
          <div className="legend-item" key={label}>
            <span className="swatch" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
