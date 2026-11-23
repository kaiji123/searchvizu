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
  "dart-orbit": dynamic(() => import("./DartOrbit"), { ssr: false, loading: Loading }),
  "einstein-ring": dynamic(() => import("./EinsteinRing"), { ssr: false, loading: Loading }),
  "lorenz-attractor": dynamic(() => import("./LorenzAttractor"), { ssr: false, loading: Loading }),
  "henon-attractor": dynamic(() => import("./HenonAttractor"), { ssr: false, loading: Loading }),
  "reaction-diffusion": dynamic(() => import("./ReactionDiffusion"), { ssr: false, loading: Loading }),
  "small-world-network": dynamic(() => import("./NetworkPapers").then((module) => module.SmallWorldNetwork), { ssr: false, loading: Loading }),
  "growing-hubs-network": dynamic(() => import("./NetworkPapers").then((module) => module.GrowingHubsNetwork), { ssr: false, loading: Loading }),
  "dna-crystal": dynamic(() => import("./CrystalStructures").then((module) => module.DnaCrystal), { ssr: false, loading: Loading }),
  "gfp-crystal": dynamic(() => import("./CrystalStructures").then((module) => module.GfpCrystal), { ssr: false, loading: Loading }),
  "health-income": dynamic(() => import("./HealthAndIncome"), { ssr: false, loading: Loading }),
  "exoplanet-atlas": dynamic(() => import("./ExoplanetAtlas"), { ssr: false, loading: Loading }),
  "warming-record": dynamic(() => import("./WarmingRecord"), { ssr: false, loading: Loading }),
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
