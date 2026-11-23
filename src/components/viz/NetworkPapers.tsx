"use client";

import { useMemo, useState } from "react";
import { Segmented, Slider, Stat } from "./controls";
import { PlaybackButton, useRangePlayback } from "./playback";
import { adjacency, growingNetwork, networkStats, shortestRoute, smallWorld, type Attachment, type Edge } from "./network-models";

const RING_SIZE = 72;
const ROUTE_END = RING_SIZE / 2;
const degreeBands = [
  { label: "2", min: 2, max: 2 },
  { label: "3–4", min: 3, max: 4 },
  { label: "5–8", min: 5, max: 8 },
  { label: "9–16", min: 9, max: 16 },
  { label: "17+", min: 17, max: Infinity },
];

function ringPoint(index: number) {
  const angle = index * 2 * Math.PI / RING_SIZE - Math.PI / 2;
  return [240 + 182 * Math.cos(angle), 214 + 182 * Math.sin(angle)];
}

function growthPoint(index: number) {
  const angle = index * Math.PI * (3 - Math.sqrt(5));
  const radius = 182 * Math.sqrt(index / 127);
  return [240 + radius * Math.cos(angle), 214 + radius * Math.sin(angle)];
}

function link(edge: Edge, point: (index: number) => number[], className: string, key: string) {
  const [x1, y1] = point(edge[0]);
  const [x2, y2] = point(edge[1]);
  return <line key={key} {...{ x1, y1, x2, y2 }} className={className} />;
}

export function SmallWorldNetwork() {
  const [probability, setProbability] = useState(8);
  const playback = useRangePlayback(probability, setProbability, { min: 0, max: 100, step: 1, delay: 130 });
  const [seed, setSeed] = useState(19);
  const view = useMemo(() => {
    const links = smallWorld(RING_SIZE, probability / 100, seed);
    const neighbours = adjacency(RING_SIZE, links.map(({ edge }) => edge));
    return {
      links,
      route: shortestRoute(neighbours, 0, ROUTE_END),
      stats: networkStats(neighbours),
    };
  }, [probability, seed]);
  const rewired = view.links.filter((entry) => entry.rewired).length;

  return (
    <section className="viz-panel grid items-center gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <svg viewBox="0 0 480 428" className="mx-auto block w-full max-w-lg" role="img" aria-label="Ring network with dashed rewired edges and a solid highlighted shortest path between opposite nodes">
          {view.links.map(({ edge, rewired }, i) =>
            link(edge, ringPoint, rewired ? "stroke-(--viz-2) opacity-55 [stroke-dasharray:4_4]" : "stroke-muted opacity-25", String(i)),
          )}
          {view.route.slice(1).map((to, i) =>
            link([view.route[i], to], ringPoint, "stroke-(--viz-1) stroke-[3]", String(to)),
          )}
          {Array.from({ length: RING_SIZE }, (_, node) => {
            const [cx, cy] = ringPoint(node);
            const endpoint = node === 0 || node === ROUTE_END;
            return <circle key={node} {...{ cx, cy }} r={endpoint ? 6 : 2.6} className={endpoint ? "fill-(--viz-1)" : "fill-ink"} />;
          })}
        </svg>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-muted">
          <span><span aria-hidden="true" className="text-(--viz-2)">┄ </span>Rewired edge</span>
          <span><span aria-hidden="true" className="text-(--viz-1)">━ </span>Shortest route</span>
        </div>
      </div>
      <div className="grid gap-5">
        <PlaybackButton {...playback} description="network rewiring" className="btn-secondary justify-self-start" />
        <Slider label="Rewiring probability" min={0} max={100} step={1} value={probability} onChange={playback.select} format={(value) => `${value}%`} />
        <div className="grid grid-cols-2 gap-4" aria-live="polite">
          <Stat label="Edges rewired" value={`${rewired} / ${view.links.length}`} />
          <Stat label="Mean clustering" value={`${(100 * view.stats.clustering).toFixed(1)}%`} />
          <Stat label={view.stats.connected ? "Mean path length" : "Mean for reachable pairs"} value={`${view.stats.meanHops.toFixed(2)} hops`} />
          <Stat label="Highlighted route" value={view.route.length ? `${view.route.length - 1} hops` : "No path"} />
        </div>
        <button type="button" className="btn-secondary justify-self-start" onClick={() => setSeed(seed + 1)}>
          Resample network
        </button>
      </div>
    </section>
  );
}

export function GrowingHubsNetwork() {
  const [size, setSize] = useState(96);
  const playback = useRangePlayback(size, setSize, { min: 8, max: 128, step: 1, delay: 100 });
  const [attachment, setAttachment] = useState<Attachment>("preferential");
  const [seed, setSeed] = useState(19);
  const { edges, degrees } = useMemo(() => growingNetwork(size, attachment, seed), [size, attachment, seed]);
  const maxDegree = Math.max(...degrees);
  const hub = degrees.indexOf(maxDegree);
  const counts = degreeBands.map(({ min, max }) => degrees.filter((degree) => degree >= min && degree <= max).length);

  return (
    <section className="viz-panel grid items-center gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <svg viewBox="0 0 480 428" className="mx-auto block w-full max-w-lg" role="img" aria-label="Growing network with the oldest nodes towards the centre, node size indicating the number of links, and the highest-degree node highlighted">
          {edges.map((edge, i) => {
            const highlighted = edge.includes(hub);
            return link(edge, growthPoint, highlighted ? "stroke-(--viz-1) opacity-60" : "stroke-muted opacity-25", String(i));
          })}
          {degrees.map((degree, node) => {
            const [cx, cy] = growthPoint(node);
            return <circle key={node} {...{ cx, cy }} r={2 + Math.sqrt(degree)} className={node === hub ? "fill-(--viz-1)" : "fill-ink"} />;
          })}
        </svg>
        <p className="text-center text-sm text-muted">Older nodes sit closer to the centre. Larger nodes have more links.</p>
      </div>
      <div className="grid gap-5">
        <Segmented label="Attachment rule" value={attachment} onChange={setAttachment} options={[
          { value: "preferential", label: "Preferential" },
          { value: "uniform", label: "Uniform" },
        ]} />
        <PlaybackButton {...playback} description="network growth" className="btn-secondary justify-self-start" />
        <Slider label="Network size" min={8} max={128} step={1} value={size} onChange={playback.select} format={(value) => `${value} nodes`} />
        <div className="grid gap-2 text-sm" aria-live="polite">
          <div className="font-medium">Nodes by link count</div>
          {degreeBands.map(({ label }, i) => (
            <div key={label} className="grid grid-cols-[3rem_minmax(0,1fr)_2rem] items-center gap-2">
              <span className="text-muted">{label}</span>
              <span className="h-2 rounded-full bg-line" aria-hidden="true">
                <span className="block h-full rounded-full bg-(--viz-1)" style={{ width: `${100 * counts[i] / size}%` }} />
              </span>
              <span className="text-right tabular-nums">{counts[i]}</span>
            </div>
          ))}
          <p className="text-muted">Most-connected node: {maxDegree} links</p>
        </div>
        <button type="button" className="btn-secondary justify-self-start" onClick={() => setSeed(seed + 1)}>
          Resample network
        </button>
      </div>
    </section>
  );
}
