"use client";

import dynamic from "next/dynamic";
import ScatterPlot from "./ScatterPlot";

type Visual = { component: "scatter"; title: string; xLabel: string; yLabel: string; points: { x: number; y: number; label: string }[] } | { component: "optimiser-loss-surface"; title: string };
const LossSurface = dynamic(() => import("../LossSurface3D"), { ssr: false, loading: () => <div role="status" className="viz-panel mt-4 min-h-[360px] grid place-items-center text-sm text-muted">Loading 3D visualisation…</div> });

// Only registered application components are rendered; clients cannot upload code.
export function PrivateVisual({ visual }: { visual: Visual }) {
  switch (visual.component) {
    case "scatter": return <ScatterPlot {...visual} />;
    case "optimiser-loss-surface": return <div className="mt-4"><p className="mb-4 text-sm leading-relaxed text-muted">Studio demonstration: an illustrative surface, not a model fitted to this project’s data. Explore the three optimisers by changing their settings and rotating the view.</p><LossSurface /><p className="mt-3 text-xs text-muted">Related paper: <a href="https://arxiv.org/abs/1412.6980" target="_blank" rel="noreferrer" className="text-accent underline underline-offset-2">Kingma and Ba, Adam: A Method for Stochastic Optimization</a>.</p></div>;
  }
}
