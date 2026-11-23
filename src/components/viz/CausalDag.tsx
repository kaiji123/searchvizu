"use client";

import { useMemo, useState } from "react";
import { Dag, type Edge, type PathResult } from "./causal";
import { PlaybackButton, useSequencePlayback } from "./playback";

type NodeDef = { id: string; label: string; x: number; y: number };

const EXPOSURE = "exercise";
const OUTCOME = "cvd";

const NODES: NodeDef[] = [
  { id: "exercise", label: "Exercise", x: 150, y: 240 },
  { id: "cvd", label: "Heart disease", x: 590, y: 240 },
  { id: "age", label: "Age", x: 370, y: 50 },
  { id: "ses", label: "Socio-economic status", x: 140, y: 110 },
  { id: "diet", label: "Diet", x: 460, y: 140 },
  { id: "bmi", label: "BMI", x: 400, y: 330 },
  { id: "awareness", label: "Health awareness", x: 110, y: 400 },
  { id: "screening", label: "Screening attendance", x: 350, y: 440 },
  { id: "family", label: "Family history", x: 610, y: 400 },
];

const EDGES: Edge[] = [
  ["exercise", "cvd"],
  ["age", "exercise"],
  ["age", "cvd"],
  ["ses", "exercise"],
  ["ses", "diet"],
  ["diet", "cvd"],
  ["diet", "bmi"],
  ["exercise", "bmi"],
  ["bmi", "cvd"],
  ["awareness", "exercise"],
  ["awareness", "screening"],
  ["family", "screening"],
  ["family", "cvd"],
];

const W = 720;
const H = 480;
const NODE_H = 34;
const byId = new Map(NODES.map((n) => [n.id, n]));
const labelOf = (id: string) => byId.get(id)!.label;
const nodeWidth = (n: NodeDef) => n.label.length * 7.4 + 28;

// Point where the segment from a's centre toward b's centre leaves a's box.
function boxExit(a: NodeDef, b: NodeDef, pad = 0) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const hw = nodeWidth(a) / 2 + pad;
  const hh = NODE_H / 2 + pad;
  const t = Math.min(dx === 0 ? Infinity : hw / Math.abs(dx), dy === 0 ? Infinity : hh / Math.abs(dy));
  return { x: a.x + dx * t, y: a.y + dy * t };
}

const edgeKey = (a: string, b: string) => `${a}->${b}`;

function describe(r: PathResult) {
  if (r.kind === "causal") {
    return r.open ? "Causal path, open. This is the effect you want to estimate." : `Causal path, blocked by adjusting for ${r.blockedBy.map(labelOf).join(", ")}.`;
  }
  const kind = r.kind === "backdoor" ? "Backdoor path" : "Non-causal path";
  if (r.open && r.openedColliders.length)
    return `${kind}, opened by conditioning on the collider ${r.openedColliders.map(labelOf).join(", ")}.`;
  if (r.open) return `${kind}, open. It adds confounding bias.`;
  return `${kind}, blocked at ${r.blockedBy.map(labelOf).join(", ")}.`;
}

export default function CausalDag() {
  const dag = useMemo(() => new Dag(NODES.map((n) => n.id), EDGES), []);
  const [adjusted, setAdjusted] = useState<Set<string>>(new Set());
  const [focus, setFocus] = useState<number | null>(null);

  const analysis = useMemo(() => dag.satisfiesBackdoor(EXPOSURE, OUTCOME, adjusted), [dag, adjusted]);
  const minimal = useMemo(() => dag.minimalAdjustmentSets(EXPOSURE, OUTCOME), [dag]);
  const descX = useMemo(() => dag.descendants(EXPOSURE), [dag]);

  const toggle = (id: string) => {
    if (id === EXPOSURE || id === OUTCOME) return;
    setAdjusted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const playback = useSequencePlayback(analysis.results.map((_, index) => index), focus, setFocus, 1200);
  const focused = focus !== null ? analysis.results[focus] : null;
  const focusEdges = new Set<string>();
  if (focused) {
    focused.nodes.forEach((n, i) => {
      if (i === 0) return;
      const a = focused.nodes[i - 1];
      focusEdges.add(dag.hasEdge(a, n) ? edgeKey(a, n) : edgeKey(n, a));
    });
  }
  const focusColor = focused ? (focused.open ? (focused.kind === "causal" ? "var(--viz-3)" : "var(--viz-2)") : "var(--muted)") : "";

  return (
    <div className="viz-panel">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full select-none" role="group" aria-label="Causal diagram. Select a variable to adjust for it.">
            <defs>
              {["base", "focus"].map((k) => (
                <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill={k === "focus" ? focusColor || "var(--muted)" : "var(--edge)"} />
                </marker>
              ))}
            </defs>

            {EDGES.map(([a, b]) => {
              const na = byId.get(a)!;
              const nb = byId.get(b)!;
              const p1 = boxExit(na, nb, 2);
              const p2 = boxExit(nb, na, 4);
              const on = focusEdges.has(edgeKey(a, b));
              return (
                <line
                  key={edgeKey(a, b)}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={on ? focusColor : "var(--edge)"}
                  strokeWidth={on ? 3 : 1.6}
                  strokeDasharray={on && !focused?.open ? "6 5" : undefined}
                  opacity={focused && !on ? 0.35 : 1}
                  markerEnd={`url(#arrow-${on ? "focus" : "base"})`}
                />
              );
            })}

            {NODES.map((n) => {
              const w = nodeWidth(n);
              const role = n.id === EXPOSURE ? "exposure" : n.id === OUTCOME ? "outcome" : adjusted.has(n.id) ? "adjusted" : "free";
              const fill = role === "exposure" ? "var(--viz-1)" : role === "outcome" ? "var(--viz-2)" : role === "adjusted" ? "var(--ink)" : "var(--surface)";
              const text = role === "free" ? "var(--ink)" : "var(--on-accent)";
              const interactive = role === "adjusted" || role === "free";
              const dimmed = focused && !focused.nodes.includes(n.id);
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x - w / 2},${n.y - NODE_H / 2})`}
                  opacity={dimmed ? 0.45 : 1}
                  className={interactive ? "cursor-pointer focus:outline-none" : undefined}
                  role={interactive ? "checkbox" : undefined}
                  aria-checked={interactive ? role === "adjusted" : undefined}
                  aria-label={interactive ? `Adjust for ${n.label}` : `${n.label} (${role})`}
                  tabIndex={interactive ? 0 : undefined}
                  onClick={() => toggle(n.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(n.id);
                    }
                  }}
                >
                  <rect
                    width={w}
                    height={NODE_H}
                    rx={NODE_H / 2}
                    fill={fill}
                    stroke={role === "free" ? (descX.has(n.id) ? "var(--viz-4)" : "var(--edge)") : "none"}
                    strokeWidth={1.5}
                    strokeDasharray={role === "free" && descX.has(n.id) ? "4 3" : undefined}
                    className="dag-node"
                  />
                  <text x={w / 2} y={NODE_H / 2} dy="0.34em" textAnchor="middle" fill={text} className="text-[13px] font-medium">
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full" style={{ background: "var(--viz-1)" }} /> Exposure
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full" style={{ background: "var(--viz-2)" }} /> Outcome
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-ink" /> Adjusted for
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full border border-dashed" style={{ borderColor: "var(--viz-4)" }} /> Descendant of exposure
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div
            className={`rounded-lg border p-3 text-sm ${analysis.valid ? "border-[var(--viz-3)] bg-[color-mix(in_oklab,var(--viz-3)_12%,transparent)]" : "border-[var(--viz-2)] bg-[color-mix(in_oklab,var(--viz-2)_10%,transparent)]"}`}
            aria-live="polite"
          >
            <div className="font-semibold">{analysis.valid ? "Valid adjustment set" : "Estimate would be biased"}</div>
            <div className="mt-1 text-muted">
              {adjusted.size === 0 ? "Adjusting for nothing." : `Adjusting for ${[...adjusted].map(labelOf).join(", ")}.`}{" "}
              {analysis.badAdjusted.length > 0 &&
                `${analysis.badAdjusted.map(labelOf).join(", ")} ${analysis.badAdjusted.length > 1 ? "are descendants" : "is a descendant"} of the exposure, so adjusting for it biases the estimate. `}
              {analysis.openBackdoor.length > 0 && `${analysis.openBackdoor.length} backdoor path${analysis.openBackdoor.length > 1 ? "s" : ""} still open.`}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Paths from exposure to outcome</h3>
            <PlaybackButton {...playback} description="causal paths" className="btn-secondary mb-3" />
            <ul className="flex flex-col gap-1.5" onPointerLeave={() => { if (!playback.playing) setFocus(null); }}>
              {analysis.results.map((r, i) => (
                <li key={r.nodes.join()}>
                  <button
                    type="button"
                    onPointerEnter={() => { if (!playback.playing) setFocus(i); }}
                    onFocus={() => { if (!playback.playing) setFocus(i); }}
                    onBlur={() => { if (!playback.playing) setFocus(null); }}
                    onClick={() => { playback.stop(); setFocus(focus === i ? null : i); }}
                    className="w-full rounded-md border border-line px-2.5 py-2 text-left text-xs transition hover:bg-canvas"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: r.open ? (r.kind === "causal" ? "var(--viz-3)" : "var(--viz-2)") : "var(--muted)" }}
                      />
                      <span className="font-medium">{r.nodes.map(labelOf).join(" — ")}</span>
                    </div>
                    <div className="mt-0.5 pl-4 text-muted">{describe(r)}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-line pt-3 text-sm">
            <div className="mb-1 font-semibold">Minimal sufficient sets</div>
            <ul className="flex flex-col gap-1">
              {minimal.map((s) => (
                <li key={s.join()}>
                  <button type="button" onClick={() => setAdjusted(new Set(s))} className="text-left underline decoration-line underline-offset-4 hover:decoration-current">
                    {s.length ? `{ ${s.map(labelOf).join(", ")} }` : "{ } (no adjustment needed)"}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setAdjusted(new Set())} className="mt-3 text-xs text-muted hover:text-ink">
              Clear adjustments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
