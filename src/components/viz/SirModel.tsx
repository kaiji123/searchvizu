"use client";

import { useMemo, useState, type PointerEvent } from "react";
import { Slider, Toggle, Stat } from "./controls";

type State = [s: number, e: number, i: number, r: number];

type Params = {
  r0: number;
  infectiousDays: number;
  latentDays: number;
  seir: boolean;
  days: number;
  initialInfected: number; // fraction of population
};

// Right-hand side of the SIR / SEIR system on population fractions.
function derivatives([s, e, i]: State, p: Params): State {
  const gamma = 1 / p.infectiousDays;
  const beta = p.r0 * gamma;
  const infection = beta * s * i;
  if (!p.seir) return [-infection, 0, infection - gamma * i, gamma * i];
  const sigma = 1 / p.latentDays;
  return [-infection, infection - sigma * e, sigma * e - gamma * i, gamma * i];
}

function add(a: State, b: State, k: number): State {
  return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k, a[3] + b[3] * k];
}

// Classic fourth-order Runge–Kutta, sampled once per day.
function solve(p: Params): State[] {
  const steps = 8;
  const dt = 1 / steps;
  let y: State = [1 - p.initialInfected, 0, p.initialInfected, 0];
  const out: State[] = [y];
  for (let day = 0; day < p.days; day++) {
    for (let k = 0; k < steps; k++) {
      const k1 = derivatives(y, p);
      const k2 = derivatives(add(y, k1, dt / 2), p);
      const k3 = derivatives(add(y, k2, dt / 2), p);
      const k4 = derivatives(add(y, k3, dt), p);
      y = [0, 1, 2, 3].map((j) => y[j] + (dt / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])) as State;
    }
    out.push(y);
  }
  return out;
}

const W = 720;
const H = 340;
const M = { top: 16, right: 20, bottom: 40, left: 48 };
const IW = W - M.left - M.right;
const IH = H - M.top - M.bottom;

const SERIES = [
  { idx: 0, key: "S", label: "Susceptible", color: "var(--viz-1)" },
  { idx: 1, key: "E", label: "Exposed", color: "var(--viz-4)" },
  { idx: 2, key: "I", label: "Infectious", color: "var(--viz-2)" },
  { idx: 3, key: "R", label: "Recovered", color: "var(--viz-3)" },
] as const;

export default function SirModel() {
  const [p, setP] = useState<Params>({
    r0: 2.2,
    infectiousDays: 7,
    latentDays: 5,
    seir: false,
    days: 180,
    initialInfected: 0.001,
  });
  const [hoverDay, setHoverDay] = useState<number | null>(null);

  const series = useMemo(() => solve(p), [p]);
  const set = <K extends keyof Params>(k: K, v: Params[K]) => setP((prev) => ({ ...prev, [k]: v }));

  const x = (d: number) => M.left + (d / p.days) * IW;
  const y = (v: number) => M.top + (1 - v) * IH;

  let peakDay = 0;
  series.forEach((st, d) => {
    if (st[2] > series[peakDay][2]) peakDay = d;
  });
  const peak = series[peakDay][2];
  const last = series[series.length - 1];
  const finalSize = last[3] + last[2] + last[1] - p.initialInfected;
  const hit = p.r0 > 1 ? 1 - 1 / p.r0 : 0;

  const tickStep = p.days <= 120 ? 20 : p.days <= 240 ? 30 : 60;
  const xTicks = Array.from({ length: Math.floor(p.days / tickStep) + 1 }, (_, i) => i * tickStep);
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const visible = SERIES.filter((s) => p.seir || s.key !== "E");

  function onMove(e: PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    setHoverDay(Math.max(0, Math.min(p.days, Math.round(frac * p.days))));
  }

  const hovered = hoverDay !== null ? series[hoverDay] : null;

  return (
    <div className="viz-panel">
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-hidden>
            {visible.map((s) => (
              <span key={s.key} className="inline-flex items-center gap-2 text-muted">
                <span className="h-0.5 w-5 rounded" style={{ background: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto select-none touch-none"
            role="img"
            aria-label={`Epidemic curves over ${p.days} days. Peak infectious ${(peak * 100).toFixed(1)}% on day ${peakDay}; final size ${(finalSize * 100).toFixed(1)}%.`}
          >
            {yTicks.map((t) => (
              <g key={t}>
                <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="var(--grid)" />
                <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-[var(--muted)] text-[11px]">
                  {t * 100}%
                </text>
              </g>
            ))}
            {xTicks.map((t) => (
              <text key={t} x={x(t)} y={H - M.bottom + 18} textAnchor="middle" className="fill-[var(--muted)] text-[11px]">
                {t}
              </text>
            ))}
            <text x={M.left + IW / 2} y={H - 4} textAnchor="middle" className="fill-[var(--muted)] text-[11px]">
              Day
            </text>

            {hit > 0 && (
              <g>
                <line
                  x1={M.left}
                  x2={W - M.right}
                  y1={y(hit)}
                  y2={y(hit)}
                  stroke="var(--viz-3)"
                  strokeDasharray="4 4"
                  opacity={0.7}
                />
                <text x={W - M.right - 4} y={y(hit) - 6} textAnchor="end" className="fill-[var(--muted)] text-[11px]">
                  Herd-immunity threshold {(hit * 100).toFixed(0)}%
                </text>
              </g>
            )}

            {visible.map((s) => (
              <path
                key={s.key}
                d={series.map((st, d) => `${d === 0 ? "M" : "L"}${x(d).toFixed(2)},${y(st[s.idx]).toFixed(2)}`).join("")}
                fill="none"
                stroke={s.color}
                strokeWidth={2.25}
                strokeLinejoin="round"
              />
            ))}

            <circle cx={x(peakDay)} cy={y(peak)} r={4} fill="var(--viz-2)" stroke="var(--surface)" strokeWidth={2} />

            {hovered && hoverDay !== null && (
              <g pointerEvents="none">
                <line x1={x(hoverDay)} x2={x(hoverDay)} y1={M.top} y2={M.top + IH} stroke="var(--muted)" opacity={0.5} />
                {visible.map((s) => (
                  <circle key={s.key} cx={x(hoverDay)} cy={y(hovered[s.idx])} r={3.5} fill={s.color} />
                ))}
              </g>
            )}

            <rect
              x={M.left}
              y={M.top}
              width={IW}
              height={IH}
              fill="transparent"
              onPointerMove={onMove}
              onPointerDown={onMove}
              onPointerLeave={() => setHoverDay(null)}
            />
          </svg>
          <p className="mt-2 min-h-5 text-sm text-muted tabular-nums" aria-live="polite">
            {hovered && hoverDay !== null
              ? `Day ${hoverDay}: ` + visible.map((s) => `${s.key} ${(hovered[s.idx] * 100).toFixed(1)}%`).join(" · ")
              : "Hover or tap the chart to read values on a given day."}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <Slider label="R₀" value={p.r0} min={0.5} max={6} step={0.1} format={(v) => v.toFixed(1)} onChange={(v) => set("r0", v)} />
          <Slider
            label="Infectious period"
            value={p.infectiousDays}
            min={2}
            max={21}
            step={1}
            format={(v) => `${v} days`}
            onChange={(v) => set("infectiousDays", v)}
          />
          <Toggle label="Add latent period (SEIR)" checked={p.seir} onChange={(v) => set("seir", v)} />
          {p.seir && (
            <Slider
              label="Latent period"
              value={p.latentDays}
              min={1}
              max={14}
              step={1}
              format={(v) => `${v} days`}
              onChange={(v) => set("latentDays", v)}
            />
          )}
          <Slider label="Time horizon" value={p.days} min={60} max={365} step={5} format={(v) => `${v} days`} onChange={(v) => set("days", v)} />
          <div className="grid grid-cols-2 gap-3 border-t border-line pt-4">
            <Stat label="Peak infectious" value={`${(peak * 100).toFixed(1)}%`} />
            <Stat label="Peak day" value={peak > p.initialInfected * 1.01 ? String(peakDay) : "—"} />
            <Stat label="Ever infected" value={`${(finalSize * 100).toFixed(1)}%`} />
            <Stat label="Threshold" value={`${(hit * 100).toFixed(0)}%`} />
          </div>
        </div>
      </div>
    </div>
  );
}
