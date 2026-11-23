"use client";

import { useEffect, useRef, useState } from "react";
import { Segmented, Stat } from "./controls";
import { PlaybackButton, useSequencePlayback } from "./playback";
import { visitHenonOrbit } from "./henon-model";

const views = {
  overview: { label: "Overview", x: [-1.5, 1.5], y: [-0.45, 0.45], places: 1, count: 100_000 },
  bands: { label: "Bands", x: [0.55, 0.70], y: [0.15, 0.21], places: 2, count: 500_000 },
  detail: { label: "Fine detail", x: [0.625, 0.64], y: [0.185, 0.191], places: 3, count: 1_000_000 },
};
type View = keyof typeof views;
const magnifications = ["overview", "bands", "detail"] as const;
const width = 720;
const height = 430;
const plot = { left: 82, right: 690, top: 25, bottom: 364 };
const tickFractions = [0, 1 / 3, 2 / 3, 1];
const formatCount = new Intl.NumberFormat("en-GB");

export default function HenonAttractor() {
  const [view, setView] = useState<View>("overview");
  const playback = useSequencePlayback(magnifications, view, setView, 1600);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = views[view];

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const theme = window.matchMedia("(prefers-color-scheme: dark)");
    const draw = () => {
      const colors = getComputedStyle(element);
      const [minX, maxX] = frame.x;
      const [minY, maxY] = frame.y;
      const x = (value: number) => plot.left + (value - minX) * (plot.right - plot.left) / (maxX - minX);
      const y = (value: number) => plot.bottom - (value - minY) * (plot.bottom - plot.top) / (maxY - minY);
      context.clearRect(0, 0, width, height);
      context.font = "19px system-ui";
      context.lineWidth = 1;
      context.strokeStyle = colors.getPropertyValue("--line").trim();
      context.fillStyle = colors.getPropertyValue("--muted").trim();
      for (const fraction of tickFractions) {
        const xValue = minX + fraction * (maxX - minX);
        const yValue = minY + fraction * (maxY - minY);
        context.beginPath();
        context.moveTo(x(xValue), plot.top);
        context.lineTo(x(xValue), plot.bottom);
        context.moveTo(plot.left, y(yValue));
        context.lineTo(plot.right, y(yValue));
        context.stroke();
        context.textAlign = "center";
        context.fillText(xValue.toFixed(frame.places), x(xValue), plot.bottom + 25);
        context.textAlign = "right";
        context.fillText(yValue.toFixed(view === "overview" ? 2 : frame.places), plot.left - 9, y(yValue) + 6);
      }
      const axisColor = colors.getPropertyValue("--ink").trim();
      context.fillStyle = axisColor;
      context.textAlign = "center";
      context.fillText("x", (plot.left + plot.right) / 2, height - 13);
      context.fillText("y", 15, (plot.top + plot.bottom) / 2);
      context.fillStyle = colors.getPropertyValue("--viz-1").trim();
      context.globalAlpha = 0.58;
      visitHenonOrbit(frame.count, (px, py) => {
        if (px >= minX && px <= maxX && py >= minY && py <= maxY) context.fillRect(x(px), y(py), 1.5, 1.5);
      });
      context.globalAlpha = 1;
      if (view !== "detail") {
        const next = view === "overview" ? views.bands : views.detail;
        context.strokeStyle = colors.getPropertyValue("--viz-2").trim();
        context.lineWidth = 2;
        context.strokeRect(x(next.x[0]), y(next.y[1]), x(next.x[1]) - x(next.x[0]), y(next.y[0]) - y(next.y[1]));
      }
    };
    draw();
    theme.addEventListener("change", draw);
    return () => theme.removeEventListener("change", draw);
  }, [frame, view]);

  return (
    <section className="viz-panel grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <canvas ref={canvas} width={width} height={height} className="block w-full rounded-xl border border-line bg-canvas" role="img" aria-label={`${frame.label} of the Hénon attractor, a point cloud of successive states in x and y`}>
        The Hénon attractor forms thin curved bands that resolve into more bands at finer scales.
      </canvas>
      <div className="grid gap-5">
        <PlaybackButton {...playback} description="magnification sequence" className="btn-secondary justify-self-start" />
        <Segmented<View> label="Magnification" value={view} onChange={playback.select} options={[
          { value: "overview", label: views.overview.label },
          { value: "bands", label: views.bands.label },
          { value: "detail", label: views.detail.label },
        ]} />
        <div className="grid grid-cols-2 gap-4" aria-live="polite">
          <Stat label="Orbit points sampled" value={formatCount.format(frame.count)} />
          <Stat label="x-axis span" value={(frame.x[1] - frame.x[0]).toPrecision(2)} />
        </div>
        <div className="text-sm text-muted">
          <p>{view === "detail" ? "Only points inside this small window are shown. Several thin bands are visible around the unstable fixed point." : "The outlined rectangle marks the area shown at the next magnification."}</p>
          <p className="mt-2">Each dot is one iteration of the map with a = 1.4 and b = 0.3.</p>
        </div>
      </div>
    </section>
  );
}
