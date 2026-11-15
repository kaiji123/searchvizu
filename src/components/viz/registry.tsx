"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { VizComponentKey } from "@/content/visualisations";

function Loading() {
  return (
    <div className="viz-panel grid min-h-[360px] place-items-center text-sm text-muted" role="status">
      Loading visualisation…
    </div>
  );
}

// Each visualisation is code-split and rendered only in the browser, so a
// visitor to one page never downloads another page's libraries (e.g. Three.js).
const components: Record<VizComponentKey, ComponentType> = {
  "sir-model": dynamic(() => import("./SirModel"), { ssr: false, loading: Loading }),
  "causal-dag": dynamic(() => import("./CausalDag"), { ssr: false, loading: Loading }),
  "loss-surface": dynamic(() => import("./LossSurface3D"), { ssr: false, loading: Loading }),
};

export function VizRenderer({ component }: { component: VizComponentKey }) {
  const Component = components[component];
  return <Component />;
}
