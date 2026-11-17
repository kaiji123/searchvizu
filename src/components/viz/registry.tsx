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
  "wine-fingerprints": dynamic(() => import("./WineFingerprints"), { ssr: false, loading: Loading }),
  "hemoglobin-3d": dynamic(() => import("./Hemoglobin3D"), { ssr: false, loading: Loading }),
  "life-lines": dynamic(() => import("./LifeLines"), { ssr: false, loading: Loading }),
  "seismic-year": dynamic(() => import("./SeismicYear"), { ssr: false, loading: Loading }),
  "planetary-orbits": dynamic(() => import("./PlanetaryOrbits"), { ssr: false, loading: Loading }),
  "carbon-spiral": dynamic(() => import("./CarbonSpiral"), { ssr: false, loading: Loading }),
  "iris-data": dynamic(() => import("./IrisData"), { ssr: false, loading: Loading }),
  "penguin-data": dynamic(() => import("./PenguinData"), { ssr: false, loading: Loading }),
  "sir-model": dynamic(() => import("./SirModel"), { ssr: false, loading: Loading }),
  "causal-dag": dynamic(() => import("./CausalDag"), { ssr: false, loading: Loading }),
  "loss-surface": dynamic(() => import("./LossSurface3D"), { ssr: false, loading: Loading }),
};

export function VizRenderer({ component }: { component: VizComponentKey }) {
  const Component = components[component];
  return <Component />;
}
