"use client";

import { useState } from "react";
import { PlaybackButton, useRangePlayback } from "../playback";

type Point = { x: number; y: number; label: string };
export default function ScatterPlot({ title, xLabel, yLabel, points }: { title: string; xLabel: string; yLabel: string; points: Point[] }) {
  const [index, setIndex] = useState(-1);
  const playback = useRangePlayback(index, setIndex, { min: -1, max: points.length - 1, step: 1, delay: 850 });
  const selected = points[index];
  const extent = (values: number[]) => { if (!values.length) return [0, 1]; const min = Math.min(...values), max = Math.max(...values); const padding = (max - min || 1) * 0.08; return [min - padding, max + padding]; };
  const [xmin, xmax] = extent(points.map(p => p.x));
  const [ymin, ymax] = extent(points.map(p => p.y));
  const format = (value: number) => Number(value.toPrecision(4)).toString();
  return <section className="mt-4 overflow-hidden rounded-xl border border-line bg-surface p-5 sm:p-7"><p className="text-xs font-semibold uppercase tracking-wide text-accent">Interactive project visual</p><h2 className="mt-2 text-xl font-semibold">{title}</h2><p className="mt-1 text-sm text-muted">{points.length} observations. Hover or focus on a point for its values.</p>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <PlaybackButton {...playback} description="point sequence" />
      {selected && <p className="text-sm text-muted">{selected.label || `Observation ${index + 1}`} · {xLabel} {format(selected.x)} · {yLabel} {format(selected.y)}</p>}
    </div>
    <svg className="mt-4 w-full" viewBox="0 0 640 400" role="img" aria-label={`${title}: ${yLabel} against ${xLabel}`}>
    {[0,1,2,3,4].map(i => <g key={i}><line x1={70+i*130} y1="35" x2={70+i*130} y2="325" stroke="var(--grid)"/><line x1="70" y1={325-i*72.5} x2="590" y2={325-i*72.5} stroke="var(--grid)"/><text x={70+i*130} y="347" textAnchor="middle" fill="var(--muted)" fontSize="11">{format(xmin+(xmax-xmin)*i/4)}</text><text x="60" y={329-i*72.5} textAnchor="end" fill="var(--muted)" fontSize="11">{format(ymin+(ymax-ymin)*i/4)}</text></g>)}
    {points.map((p,i) => <circle key={i} cx={70+(p.x-xmin)/(xmax-xmin)*520} cy={325-(p.y-ymin)/(ymax-ymin)*290} r={i === index ? 8 : 5} fill={i === index ? "var(--viz-2)" : "var(--viz-1)"} fillOpacity=".8" tabIndex={0}><title>{p.label || `Observation ${i+1}`}: {xLabel} {p.x}; {yLabel} {p.y}</title></circle>)}
    <text x="330" y="382" textAnchor="middle" fill="var(--ink)" fontSize="12">{xLabel}</text><text transform="translate(15 180) rotate(-90)" textAnchor="middle" fill="var(--ink)" fontSize="12">{yLabel}</text>
  </svg></section>;
}
