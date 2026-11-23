"use client";

import { useState } from "react";
import { Slider, Stat } from "./controls";
import { PlaybackButton, useRangePlayback } from "./playback";

// Thomas et al. (2023), pre-impact estimate and SP22 post-impact estimate.
const preImpactHours = 11.92148;
const postImpactHours = 11.372;
const extraOrbitHours = 1 / (1 / postImpactHours - 1 / preImpactHours);
const maxHours = Math.ceil(extraOrbitHours / 24) * 24;
const centre = [234, 195] as const;
const radius = 148;
const turn = 2 * Math.PI;

function degreesAhead(hours: number) {
  return 360 * hours / extraOrbitHours;
}

function position(cycles: number, distance = radius) {
  const angle = turn * (cycles % 1) - Math.PI / 2;
  return [centre[0] + distance * Math.cos(angle), centre[1] + distance * Math.sin(angle)];
}

export default function DartOrbit() {
  const [hours, setHours] = useState(72);
  const playback = useRangePlayback(hours, setHours, { min: 0, max: maxHours, step: 2.4, delay: 80 });
  const before = hours / preImpactHours;
  const after = hours / postImpactHours;
  const [beforeX, beforeY] = position(before);
  const [afterX, afterY] = position(after);
  const gap = (after - before) % 1;
  const [startX, startY] = position(before, radius + 15);
  const [endX, endY] = position(after, radius + 15);

  return (
    <section className="viz-panel grid items-center gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <svg viewBox="0 0 468 390" className="block w-full rounded-xl border border-line bg-canvas" role="img" aria-label="Schematic comparison using the measured orbital periods, with both markers starting at the same point">
          <circle cx={centre[0]} cy={centre[1]} r={radius} fill="none" className="stroke-muted opacity-45" strokeDasharray="4 4" />
          <line x1={centre[0]} x2={centre[0]} y1={centre[1] - radius - 14} y2={centre[1] - radius + 14} className="stroke-muted" />
          <text x={centre[0]} y="23" textAnchor="middle" className="fill-muted" fontSize="15">Shared start</text>
          <circle cx={centre[0]} cy={centre[1]} r="20" className="fill-line stroke-muted" />
          <text x={centre[0]} y={centre[1] + 42} textAnchor="middle" className="fill-ink" fontSize="17">Didymos</text>
          <path d={`M ${startX} ${startY} A ${radius + 15} ${radius + 15} 0 ${gap > 0.5 ? 1 : 0} 1 ${endX} ${endY}`} fill="none" className="stroke-(--viz-1) opacity-60" strokeWidth="3" />
          <circle cx={beforeX} cy={beforeY} r="11" fill="none" className="stroke-(--viz-2)" strokeWidth="3" />
          <circle cx={afterX} cy={afterY} r="6" className="fill-(--viz-1)" />
        </svg>
        <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-muted">
          <span><span className="text-(--viz-2)" aria-hidden="true">○ </span>At the old period</span>
          <span><span className="text-(--viz-1)" aria-hidden="true">● </span>At the new period</span>
        </div>
      </div>
      <div className="grid gap-5">
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Pre-impact period" value="11.92148 h" />
          <Stat label="Post-impact period" value="11.372 h" />
          <Stat label="Measured change (3σ)" value="−33.0 ± 1.0 min" />
          <div aria-live="polite"><Stat label="Accumulated phase lead" value={`${degreesAhead(hours).toFixed(1)}°`} /></div>
        </div>
        <Slider label="Elapsed time from shared start" min={0} max={maxHours} step={0.01} value={hours} onChange={playback.select} format={(time) => `${time.toFixed(2)} h`} />
        <div className="flex flex-wrap gap-2">
          <PlaybackButton {...playback} description="orbital comparison" />
          <button type="button" className="btn-secondary" onClick={() => playback.select(0)}>Shared start</button>
          <button type="button" className="btn-secondary" onClick={() => playback.select(72)}>Three days</button>
          <button type="button" className="btn-secondary" onClick={() => playback.select(Number(extraOrbitHours.toFixed(2)))}>One extra orbit</button>
        </div>
        <p className="text-sm text-muted">The two markers line up again after about {(extraOrbitHours / 24).toFixed(1)} days, when the faster moonlet is one complete orbit ahead.</p>
      </div>
    </section>
  );
}
