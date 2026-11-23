"use client";

import { useMemo, useState } from "react";
import { Segmented, Slider, Stat } from "./controls";
import { PlaybackButton, useRangePlayback } from "./playback";
import { lorenzTrajectory, LORENZ_SAMPLE, separation, type Vector3 } from "./lorenz-model";

const duration = 40;
const baseline = lorenzTrajectory([1, 1, 1], duration);
const offsets = { "0.001": 0.001, "0.01": 0.01, "0.1": 0.1 };
type Offset = keyof typeof offsets;
const plot = { left: 48, right: 344, top: 15, bottom: 125 };
const distanceTicks = [-4, -2, 0, 2];

function projection(azimuth: number, elevation: number) {
  const yaw = azimuth * Math.PI / 180;
  const tilt = elevation * Math.PI / 180;
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);
  return ([x, y, z]: Vector3) => {
    const across = x * cosYaw - y * sinYaw;
    const depth = x * sinYaw + y * cosYaw;
    const up = (z - 24) * cosTilt - depth * sinTilt;
    return [250 + across * 7, 194 - up * 7];
  };
}

function linePoints(points: number[][]) {
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

function separationY(distance: number) {
  const log = Math.max(-4, Math.min(2, Math.log10(distance)));
  return plot.top + (2 - log) * (plot.bottom - plot.top) / 6;
}

export default function LorenzAttractor() {
  const [initialOffset, setInitialOffset] = useState<Offset>("0.001");
  const [time, setTime] = useState(25);
  const playback = useRangePlayback(time, setTime, { min: 0, max: duration, step: 0.25, delay: 80 });
  const [azimuth, setAzimuth] = useState(15);
  const [elevation, setElevation] = useState(8);
  const variant = useMemo(() => lorenzTrajectory([1 + offsets[initialOffset], 1, 1], duration), [initialOffset]);
  const distances = useMemo(() => baseline.map((point, i) => separation(point, variant[i])), [variant]);
  const project = useMemo(() => projection(azimuth, elevation), [azimuth, elevation]);
  const pathA = useMemo(() => baseline.map(project), [project]);
  const pathB = useMemo(() => variant.map(project), [project, variant]);
  const index = Math.round(time / LORENZ_SAMPLE);
  const trailStart = Math.max(0, index - Math.round(3 / LORENZ_SAMPLE));
  const xAt = (ratio: number) => plot.left + ratio * (plot.right - plot.left);

  return (
    <section className="viz-panel grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <svg viewBox="0 0 500 386" className="block w-full rounded-xl border border-line bg-canvas" role="img" aria-label="Rotatable projection of two Lorenz trajectories, with the last three time units highlighted and the current states marked">
          <polyline points={linePoints(pathA)} fill="none" className="stroke-muted opacity-25" strokeWidth="0.85" />
          <polyline points={linePoints(pathA.slice(trailStart, index + 1))} fill="none" className="stroke-(--viz-1)" strokeWidth="2" />
          <polyline points={linePoints(pathB.slice(trailStart, index + 1))} fill="none" className="stroke-(--viz-2)" strokeWidth="2" strokeDasharray="5 3" />
          <circle cx={pathA[index][0]} cy={pathA[index][1]} r="5" className="fill-(--viz-1)" />
          <rect x={pathB[index][0] - 3.5} y={pathB[index][1] - 3.5} width="7" height="7" className="fill-(--viz-2) stroke-canvas" />
        </svg>
        <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-muted">
          <li><span className="text-(--viz-1)" aria-hidden="true">● </span>Reference trajectory</li>
          <li><span className="text-(--viz-2)" aria-hidden="true">▪ </span>Perturbed trajectory</li>
        </ul>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Slider label="Azimuth" min={-180} max={180} step={1} value={azimuth} onChange={setAzimuth} format={(angle) => `${angle}°`} />
          <Slider label="Elevation" min={-90} max={90} step={1} value={elevation} onChange={setElevation} format={(angle) => `${angle}°`} />
        </div>
      </div>
      <div className="grid content-start gap-5 min-w-0">
        <Segmented label="Perturbation in initial x" value={initialOffset} onChange={setInitialOffset} options={[
          { value: "0.001", label: "0.001" }, { value: "0.01", label: "0.01" }, { value: "0.1", label: "0.1" },
        ]} />
        <PlaybackButton {...playback} description="trajectories" className="btn-secondary justify-self-start" />
        <Slider label="Model time" min={0} max={duration} step={LORENZ_SAMPLE} value={time} onChange={playback.select} format={(value) => value.toFixed(2)} />
        <div aria-live="polite"><Stat label="Current separation in state space" value={distances[index].toPrecision(4)} /></div>
        <div>
          <h2 className="mb-1 text-sm font-medium">Separation over time</h2>
          <svg viewBox="0 0 356 151" className="block w-full text-muted" role="img" aria-label="Euclidean separation of the two states versus model time on a logarithmic vertical scale">
            {distanceTicks.map((log) => {
              const y = separationY(10 ** log);
              return <g key={log}>
                <line x1={plot.left} x2={plot.right} y1={y} y2={y} className="stroke-line"/>
                <text x={plot.left - 7} y={y} dy=".35em" textAnchor="end" fill="currentColor" fontSize="12">{10 ** log}</text>
              </g>;
            })}
            {[0, 10, 20, 30, 40].map((tick) => (
              <text key={tick} x={xAt(tick / duration)} y="145" textAnchor="middle" fill="currentColor" fontSize="12">{tick}</text>
            ))}
            <polyline fill="none" points={linePoints(distances.map((distance, i) => [xAt(i / (distances.length - 1)), separationY(distance)]))} className="stroke-(--viz-1)" strokeWidth="1.5" />
            <line x1={xAt(time / duration)} x2={xAt(time / duration)} y1={plot.top} y2={plot.bottom} className="stroke-muted" strokeDasharray="3 3" />
            <circle cx={xAt(time / duration)} cy={separationY(distances[index])} r="3.5" className="fill-(--viz-1) stroke-surface" />
          </svg>
          <p className="mt-1 text-xs text-muted">Horizontal axis shows model time. The vertical scale is logarithmic.</p>
        </div>
      </div>
    </section>
  );
}
