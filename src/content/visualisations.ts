// The registry of every visualisation the studio hosts.
//
// Adding a new client project = add an entry here + a component in
// src/components/viz/ + one line in src/components/viz/registry.tsx.
//
// Visibility controls where a page appears:
//   public   – listed in the portfolio and sitemap, indexable
//   unlisted – reachable by direct link only, marked noindex (for client
//              review, embargoed work, or clients who don't want promotion)
//   draft    – not served at all (404)

export type Visibility = "public" | "unlisted" | "draft";
export type VizKind = "2d" | "3d";

export type VizComponentKey = "sir-model" | "causal-dag" | "loss-surface";

export type Visualisation = {
  slug: string;
  title: string;
  summary: string;
  kind: VizKind;
  discipline: string;
  component: VizComponentKey;
  visibility: Visibility;
  attribution: {
    // Who the research belongs to. For studio demos this is the studio.
    owner: string;
    affiliation?: string;
    url?: string;
  };
  // The explanatory text shown beside the visual. Plain paragraphs.
  about: string[];
  howToRead: string[];
  // Honest limits of what the visual shows. Always fill this in.
  limitations: string[];
  references: { label: string; url?: string }[];
  // Bump when the visual changes in a way that could break existing embeds.
  version: number;
  updated: string; // ISO date
};

export const visualisations: Visualisation[] = [
  {
    slug: "sir-epidemic-model",
    title: "Interactive SIR / SEIR epidemic model",
    summary:
      "Adjust transmission, recovery and incubation to see how the epidemic curve, peak and final size respond.",
    kind: "2d",
    discipline: "Epidemiology",
    component: "sir-model",
    visibility: "public",
    attribution: { owner: "Studio demonstration" },
    about: [
      "Compartmental models split a population into groups: susceptible (S), exposed (E), infectious (I) and recovered (R). The model then describes how people move between those groups over time.",
      "This demo integrates the deterministic SIR and SEIR equations with a fourth-order Runge–Kutta solver in your browser. Every slider change re-solves the system, so you can see how sensitive the outcome is to each parameter.",
    ],
    howToRead: [
      "The basic reproduction number R₀ is the average number of people one case infects in a fully susceptible population.",
      "Above R₀ = 1 an outbreak grows; below it, it fades out. The dashed line marks the herd-immunity threshold, 1 − 1/R₀.",
      "Turn on SEIR to add a latent period. It delays and flattens the peak, but leaves the final size unchanged.",
    ],
    limitations: [
      "Illustrative only. The model is not calibrated to any real outbreak.",
      "It assumes homogeneous mixing, a closed population, no births or deaths, and lasting immunity.",
      "It is deterministic, so it ignores the chance early fade-out that matters for small outbreaks.",
    ],
    references: [
      {
        label:
          "Kermack, W. O. & McKendrick, A. G. (1927). A contribution to the mathematical theory of epidemics. Proc. R. Soc. Lond. A, 115, 700–721.",
        url: "https://doi.org/10.1098/rspa.1927.0118",
      },
      {
        label: "Keeling, M. J. & Rohani, P. (2008). Modeling Infectious Diseases in Humans and Animals. Princeton University Press.",
      },
    ],
    version: 1,
    updated: "2026-11-15",
  },
  {
    slug: "causal-dag-adjustment",
    title: "Causal diagram: which variables should you adjust for?",
    summary:
      "Click variables to adjust for them and watch each backdoor path open or close under the rules of d-separation.",
    kind: "2d",
    discipline: "Causal inference",
    component: "causal-dag",
    visibility: "public",
    attribution: { owner: "Studio demonstration" },
    about: [
      "A directed acyclic graph (DAG) encodes assumptions about what causes what. From it you can work out which variables to adjust for to estimate a causal effect from observational data.",
      "This demo lists every path between the exposure and the outcome. It checks in real time whether each path is open or blocked by the set you have chosen to adjust for, using the d-separation rules.",
    ],
    howToRead: [
      "Backdoor paths start with an arrow pointing into the exposure. They carry non-causal association, and a valid adjustment set must block all of them.",
      "Adjusting for a confounder blocks a path. Adjusting for a collider, or a descendant of one, opens a path that was previously blocked.",
      "Don't adjust for mediators or other descendants of the exposure. They sit on the causal path you are trying to measure.",
    ],
    limitations: [
      "The graph is a teaching example with invented structure, not a validated model of exercise and heart disease.",
      "Any conclusion is only as good as the assumed graph. Unmeasured confounders are not shown unless they are drawn in.",
    ],
    references: [
      { label: "Pearl, J. (2009). Causality: Models, Reasoning and Inference (2nd ed.). Cambridge University Press." },
      {
        label:
          "Greenland, S., Pearl, J. & Robins, J. M. (1999). Causal diagrams for epidemiologic research. Epidemiology, 10(1), 37–48.",
        url: "https://doi.org/10.1097/00001648-199901000-00008",
      },
    ],
    version: 1,
    updated: "2026-11-15",
  },
  {
    slug: "optimiser-loss-surface",
    title: "Optimisers on a 3D loss surface",
    summary:
      "Compare gradient descent, momentum and Adam as they search a non-convex surface. Orbit, zoom and tune the learning rate.",
    kind: "3d",
    discipline: "Machine learning",
    component: "loss-surface",
    visibility: "public",
    attribution: { owner: "Studio demonstration" },
    about: [
      "Training a neural network means searching a high-dimensional loss landscape for low points. A two-parameter surface can't show that full complexity, but it does make the behaviour of different optimisers visible.",
      "The surface here has a broad global basin, a shallower local minimum and a saddle region. The three optimisers start from the same point and are iterated live in your browser with the update rules from their original papers.",
    ],
    howToRead: [
      "Drag to orbit, scroll to zoom. Colour encodes height: darker means lower loss.",
      "Raise the learning rate to see plain gradient descent overshoot. Raise momentum to see it roll through the local minimum.",
      "Click “New start” to try another initial point.",
    ],
    limitations: [
      "This is a hand-built two-dimensional function, not the loss of a real model. Real landscapes have millions of dimensions and stochastic gradients.",
      "Gradients are exact here, with no mini-batch noise.",
    ],
    references: [
      {
        label: "Kingma, D. P. & Ba, J. (2015). Adam: A method for stochastic optimization. ICLR.",
        url: "https://arxiv.org/abs/1412.6980",
      },
      {
        label: "Polyak, B. T. (1964). Some methods of speeding up the convergence of iteration methods. USSR Comp. Math. & Math. Phys., 4(5), 1–17.",
      },
    ],
    version: 1,
    updated: "2026-11-15",
  },
];

export function getVisualisation(slug: string): Visualisation | undefined {
  const viz = visualisations.find((v) => v.slug === slug);
  return viz && viz.visibility !== "draft" ? viz : undefined;
}

export function publicVisualisations(): Visualisation[] {
  return visualisations.filter((v) => v.visibility === "public");
}

export function servedVisualisations(): Visualisation[] {
  return visualisations.filter((v) => v.visibility !== "draft");
}
