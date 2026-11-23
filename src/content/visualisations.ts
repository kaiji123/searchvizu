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

type CrystalComponentKey = "dna-crystal" | "gfp-crystal";
export type VizComponentKey = CrystalComponentKey | "sir-model" | "causal-dag" | "loss-surface" | "iris-data" | "penguin-data" | "planetary-orbits" | "carbon-spiral" | "seismic-year" | "life-lines" | "hemoglobin-3d" | "wine-fingerprints" | "exoplanet-atlas" | "warming-record" | "health-income" | "small-world-network" | "growing-hubs-network" | "lorenz-attractor" | "henon-attractor" | "reaction-diffusion" | "einstein-ring" | "dart-orbit";

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
    slug: "dart-changed-an-orbit",
    title: "The 33 minutes DART took off an orbit",
    summary: "Compare the measured periods of Dimorphos before and after NASA’s DART mission and see how quickly the difference adds up.",
    kind: "2d", discipline: "Planetary science", component: "dart-orbit", visibility: "public",
    attribution: { owner: "Cristina A. Thomas and colleagues", url: "https://doi.org/10.1038/s41586-023-05805-2" },
    about: ["After DART struck Dimorphos in September 2022, the moonlet took about 33 minutes less to orbit Didymos. Thomas and colleagues used ground-based brightness measurements and radar observations to estimate the change. Their published periods drive the two markers here."],
    howToRead: ["Start both markers at the top, then increase the elapsed time. The filled marker follows the new period and gradually pulls ahead of the projected position at the old period.", "Choose One extra orbit to see the markers nearly overlap after the post-impact orbit has gained a full lap."],
    limitations: ["The diagram compares phase using idealised circular paths of equal drawn radius and a common starting angle. The body sizes, orbital shape, and positions are schematic. The displayed periods are from the 2023 publication."],
    references: [{ label: "Thomas et al. (2023). Orbital period change of Dimorphos due to the DART kinetic impact. Nature.", url: "https://doi.org/10.1038/s41586-023-05805-2" }],
    version: 1, updated: "2026-11-23",
  },
  {
    slug: "einstein-ring",
    title: "When gravity makes a ring",
    summary: "Move a background source behind a point-mass lens and watch two images merge into an Einstein ring.",
    kind: "2d", discipline: "Gravitational lensing", component: "einstein-ring", visibility: "public",
    attribution: { owner: "Albert Einstein and Bohdan Paczyński", url: "https://doi.org/10.1126/science.84.2188.506" },
    about: ["Einstein’s 1936 note described how one star can bend the light of another into a ring when the observer, source, and lens align. Paczyński later used a point-mass lens model to study how unseen foreground objects could be detected through changes in the combined brightness of the images."],
    howToRead: ["Bring the source offset to zero to see a symmetric ring. Increase it until the lens lies outside the source disk and two distinct images appear. Both panels use angular distances measured in units of the Einstein radius.", "Magnification compares the total lensed flux with the unlensed flux. The lens preserves surface brightness in this model, so the increased apparent area makes the images brighter in total."],
    limitations: ["The model assumes an isolated point mass and a circular source with uniform surface brightness. It omits light from the foreground object, lens opacity, limb darkening, and telescope resolution."],
    references: [
      { label: "Einstein (1936). Lens-like action of a star by the deviation of light in the gravitational field. Science.", url: "https://doi.org/10.1126/science.84.2188.506" },
      { label: "Paczyński (1986). Gravitational microlensing by the galactic halo. The Astrophysical Journal.", url: "https://articles.adsabs.harvard.edu/pdf/1986ApJ...304....1P" },
    ],
    version: 1, updated: "2026-11-23",
  },
  {
    slug: "lorenz-attractor",
    title: "Two paths through the Lorenz attractor",
    summary: "Rotate a 3D phase portrait and scrub through two trajectories that start almost in the same place.",
    kind: "3d", discipline: "Nonlinear dynamics", component: "lorenz-attractor", visibility: "public",
    attribution: { owner: "Edward N. Lorenz", url: "https://wind.mit.edu/~emanuel/Lorenz/EdLorenz/Deterministic_63.pdf" },
    about: ["Lorenz derived a simplified three-variable system for fluid convection and found nonperiodic solutions that were sensitive to their initial conditions. This visualisation uses his standard parameter set (σ = 10, ρ = 28, β = 8/3) to compare two trajectories that differ only in their starting x coordinate."],
    howToRead: ["Set the perturbation to 0.001 and drag model time from zero to about 25. Compare the markers and watch the separation grow unevenly over time.", "The faint line shows the full reference trajectory. Solid and dashed trails show the last three model time units. Adjust azimuth and elevation to look at the same states from a different angle."],
    limitations: ["The trajectories use fourth-order Runge–Kutta integration with a step of 0.005 model time units. Numerical error can compound over long runs. The state-space variables describe a simplified convection model."],
    references: [{ label: "Lorenz (1963). Deterministic Nonperiodic Flow. Journal of the Atmospheric Sciences.", url: "https://wind.mit.edu/~emanuel/Lorenz/EdLorenz/Deterministic_63.pdf" }],
    version: 1, updated: "2026-11-23",
  },
  {
    slug: "henon-attractor",
    title: "Inside the Hénon attractor",
    summary: "Zoom into a folded point cloud and see individual bands split into finer ones.",
    kind: "2d", discipline: "Nonlinear dynamics", component: "henon-attractor", visibility: "public",
    attribution: { owner: "Michel Hénon", url: "https://doi.org/10.1007/BF01608556" },
    about: ["Hénon followed Lorenz’s work with a simpler system. The Hénon map iterates a two-dimensional quadratic rule. For a = 1.4 and b = 0.3, the orbit from (0, 0) approaches a bounded set with intricate structure."],
    howToRead: ["Choose Bands to magnify the outlined rectangle near the unstable fixed point. Choose Fine detail to magnify the next rectangle. Each view samples the same orbit with a larger sample at finer scales.", "The horizontal and vertical axes show the state variables x and y. Each dot is a successive state after the first 100 iterations are skipped."],
    limitations: ["The coordinate scales differ between axes to make the bands easier to see. Finite samples and pixel resolution limit the visible detail. The diagram illustrates numerical evidence for nested bands."],
    references: [{ label: "Hénon (1976). A two-dimensional mapping with a strange attractor. Communications in Mathematical Physics.", url: "https://doi.org/10.1007/BF01608556" }],
    version: 1, updated: "2026-11-23",
  },
  {
    slug: "patterns-from-reaction-diffusion",
    title: "Patterns from reaction and diffusion",
    summary: "Change the rates in the Gray–Scott model and watch the same starting patch grow into spots, stripes, or fade away.",
    kind: "2d", discipline: "Pattern formation", component: "reaction-diffusion", visibility: "public",
    attribution: { owner: "John E. Pearson", url: "https://doi.org/10.1126/science.261.5118.189" },
    about: ["Pearson used the Gray–Scott model to study how two interacting chemicals can produce complex spatial patterns. A small region starts with more V than the surrounding field. Reaction amplifies V where U is available, while diffusion moves both chemicals and the removal term depletes V."],
    howToRead: ["Switch between the three rate presets to compare the same initial disturbance after 1,800 steps. Restart from the seed to see the original patch, then play or advance 100 steps at a time.", "Colour shows the concentration of V on the same scale for every preset. Opposite edges of the square connect."],
    limitations: ["This browser simulation uses a 96 by 96 grid, a five-point finite difference stencil, and forward Euler updates. The smaller domain, seed, diffusion coefficients in grid units, and selected rates are illustrative settings. Pearson used a 256 by 256 grid for the paper’s main parameter survey."],
    references: [{ label: "Pearson (1993). Complex Patterns in a Simple System. Science.", url: "https://doi.org/10.1126/science.261.5118.189" }, { label: "Author’s preprint with equations and simulation methods.", url: "https://arxiv.org/abs/patt-sol/9304003" }],
    version: 1, updated: "2026-11-23",
  },
  {
    slug: "shortcuts-in-a-small-world",
    title: "Shortcuts in a small world",
    summary: "Rewire a ring of 72 nodes and see how a few new connections can shorten paths across the network.",
    kind: "2d", discipline: "Network science", component: "small-world-network", visibility: "public",
    attribution: { owner: "Duncan J. Watts and Steven H. Strogatz", url: "https://doi.org/10.1038/30918" },
    about: ["Watts and Strogatz showed that a network can retain tightly connected neighbourhoods even as shortcuts bring distant nodes within a few hops of one another. This simulation starts with a ring where each node is linked to its three nearest neighbours on either side."],
    howToRead: ["Start at 0% and raise the rewiring probability. Compare how quickly mean path length falls with how much local clustering remains.", "Dashed edges were rewired. The solid highlight follows one shortest route between the two marked nodes. Mean clustering measures how often a node’s neighbours are themselves connected, averaged across the network."],
    limitations: ["Each setting displays a single simulated network. Resampling shows how much the result depends on the random draw. The paper’s Figure 2 averaged repeated runs on larger networks."],
    references: [{ label: "Watts and Strogatz (1998). Collective dynamics of ‘small-world’ networks. Nature.", url: "https://doi.org/10.1038/30918" }],
    version: 1, updated: "2026-11-23",
  },
  {
    slug: "how-networks-grow-hubs",
    title: "How networks grow hubs",
    summary: "Grow a network one node at a time and compare what happens when newcomers favour already well-connected nodes.",
    kind: "2d", discipline: "Network science", component: "growing-hubs-network", visibility: "public",
    attribution: { owner: "Albert-László Barabási and Réka Albert", url: "https://doi.org/10.1126/science.286.5439.509" },
    about: ["Barabási and Albert studied what happens when networks grow and new nodes are more likely to link to nodes that already have many connections. This simulation starts with a triangle and gives each newcomer two distinct links to existing nodes."],
    howToRead: ["Increase network size to watch older nodes accumulate connections. Compare preferential attachment, where a node’s chance of being picked is proportional to its degree, with uniform attachment, where every eligible node has the same chance.", "The bars count nodes in each degree range. The diagram highlights one node with the highest degree and its links."],
    limitations: ["The graph is a small simulation. Its binned degree counts illustrate hub formation. Estimating a power law would require a much larger sample and a statistical fit."],
    references: [{ label: "Barabási and Albert (1999). Emergence of scaling in random networks. Science.", url: "https://doi.org/10.1126/science.286.5439.509" }],
    version: 1, updated: "2026-11-23",
  },
  {
    slug: "a-turn-of-dna",
    title: "A turn of DNA",
    summary: "Rotate a crystal structure of B-DNA and step through its twelve base pairs.",
    kind: "3d", discipline: "Structural biology", component: "dna-crystal", visibility: "public",
    attribution: { owner: "H. R. Drew and colleagues · Worldwide Protein Data Bank", url: "https://www.rcsb.org/structure/1BNA" },
    about: ["The Drew–Dickerson dodecamer is a synthetic DNA duplex whose 1.9 Å X-ray structure reveals how two strands twist around each other."],
    howToRead: ["Drag or use the rotate buttons to turn the duplex. Move the slider to highlight each base pair in sequence. The two coloured tubes pass through the C1′ sugar atoms of the two strands."],
    limitations: ["The tubes are interpolated and the rungs are schematic connectors between paired sugar atoms. This view omits individual bases, hydrogen bonds and solvent. The deposited model describes one sequence under crystal conditions."],
    references: [
      { label: "Drew et al. (1981). Structure of a B-DNA dodecamer: conformation and dynamics. PNAS.", url: "https://doi.org/10.1073/pnas.78.4.2179" },
      { label: "PDB 1BNA. Deposited coordinates, adapted for display.", url: "https://www.rcsb.org/structure/1BNA" },
      { label: "wwPDB archive data usage policy (CC0 1.0).", url: "https://www.rcsb.org/pages/usage-policy" },
    ], version: 1, updated: "2026-11-19",
  },
  {
    slug: "inside-the-green-glow",
    title: "Inside the green glow",
    summary: "Rotate green fluorescent protein and isolate the chromophore tucked inside its fold.",
    kind: "3d", discipline: "Structural biology", component: "gfp-crystal", visibility: "public",
    attribution: { owner: "M. Örmo and S. J. Remington · Worldwide Protein Data Bank", url: "https://www.rcsb.org/structure/1EMA" },
    about: ["Green fluorescent protein from Aequorea victoria folds around the chromophore responsible for its fluorescence. This experimentally determined 1.9 Å crystal structure is of the Thr65 variant."],
    howToRead: ["Rotate the model to see how the protein fold surrounds the green chromophore atoms. Toggle the protein trace to isolate the chromophore."],
    limitations: ["The tube interpolates selected backbone coordinates. Sphere sizes and colours are illustrative. The crystal model captures a static structure, and the rendering does not simulate fluorescence."],
    references: [
      { label: "Örmo et al. (1996). Crystal structure of the Aequorea victoria green fluorescent protein. Science.", url: "https://pubmed.ncbi.nlm.nih.gov/8703075/" },
      { label: "PDB 1EMA. Deposited coordinates, adapted for display.", url: "https://www.rcsb.org/structure/1EMA" },
      { label: "wwPDB archive data usage policy (CC0 1.0).", url: "https://www.rcsb.org/pages/usage-policy" },
    ], version: 1, updated: "2026-11-19",
  },
  {
    slug: "health-and-income", title: "Money, health and the space between",
    summary: "Compare economic output and life expectancy across 204 countries and economies.",
    kind: "2d", discipline: "Global development · Open data", component: "health-income", visibility: "public",
    attribution: { owner: "World Bank World Development Indicators", url: "https://databank.worldbank.org/source/world-development-indicators" },
    about: ["How do the resources available in an economy relate to the health of its population? This comparison places two commonly used World Bank indicators side by side for 2023.", "Each point is a country or economy for which both GDP per capita in current US dollars and period life expectancy at birth were available in the source snapshots."],
    howToRead: ["The horizontal axis is GDP per capita on a logarithmic scale; equal horizontal distances represent equal ratios. The vertical axis is life expectancy in years.", "Filter by region or choose an economy to examine its two values. Each point represents an economy, regardless of its population size."],
    limitations: ["A cross-sectional association is not evidence that GDP causes a particular life expectancy. The chart omits inequality, public services, conflict, demographics and many other factors.", "GDP per capita in current US dollars is sensitive to exchange rates and is not adjusted for local purchasing power. Life expectancy is a period estimate, not a forecast for an individual. Source coverage and uncertainty vary; only economies with both data points appear."],
    references: [
      { label: "World Bank World Development Indicators: GDP per capita (current US$), 2023; snapshot retrieved 17 November 2026.", url: "https://data.worldbank.org/indicator/NY.GDP.PCAP.CD" },
      { label: "World Bank World Development Indicators: life expectancy at birth, 2023; snapshot retrieved 16 November 2026.", url: "https://data.worldbank.org/indicator/SP.DYN.LE00.IN" },
      { label: "World Bank open-data licensing and terms of use.", url: "https://datacatalog.worldbank.org/public-licenses" },
    ], version: 1, updated: "2026-11-17",
  },
  {
    slug: "beyond-our-solar-system", title: "Beyond our solar system",
    summary: "Explore thousands of confirmed exoplanets by their size, orbital period and method of discovery.",
    kind: "2d", discipline: "Astronomy · Open data", component: "exoplanet-atlas", visibility: "public",
    attribution: { owner: "NASA Exoplanet Archive", url: "https://exoplanetarchive.ipac.caltech.edu/" },
    about: ["The confirmed planets beyond our solar system vary enormously in size and in the time they take to orbit their stars. Each point in this atlas represents a planet in the NASA Exoplanet Archive's composite catalogue.", "The snapshot contains 6,470 confirmed planets. The chart includes those with positive orbital period and radius estimates and a discovery year; filters make the uneven history of their discovery visible."],
    howToRead: ["Horizontal position shows orbital period in days; vertical position shows estimated radius in Earth radii. Both axes use logarithmic scales: equal distances represent equal ratios, not equal differences.", "Filter by discovery method or move the year slider. Choose a dot or use the planet selector to see its properties and distance, where available."],
    limitations: ["The planets shown are not representative of all planets: observations are biased towards objects that current instruments and discovery methods can detect. The graphic is not a map of positions, and does not establish habitability.", "Composite parameters can come from different studies and some radii are calculated from mass rather than directly measured. Estimates, discovery classifications and the archive itself may change; uncertainty ranges are not displayed. Planets missing a plotted value or discovery year are omitted."],
    references: [
      { label: "NASA Exoplanet Archive, Planetary Systems Composite Parameters, snapshot retrieved 17 November 2026.", url: "https://exoplanetarchive.ipac.caltech.edu/docs/API_PS_columns.html" },
      { label: "Christiansen et al. (2025), The NASA Exoplanet Archive and Exoplanet Follow-up Observing Program: Data, Tools, and Usage.", url: "https://doi.org/10.3847/PSJ/ade3c2" },
    ], version: 1, updated: "2026-11-17",
  },
  {
    slug: "shape-of-a-warming-world", title: "The shape of a warming world",
    summary: "Compare 176 years of global surface temperature anomalies in NOAA's land and ocean record.",
    kind: "2d", discipline: "Climate science · Open data", component: "warming-record", visibility: "public",
    attribution: { owner: "NOAA National Centers for Environmental Information", url: "https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/global/time-series" },
    about: ["Global temperature is not a single thermometer reading. NOAA combines land and ocean observations into an estimate of how each year's average differs from a reference period.", "This original interactive uses NOAA Climate at a Glance annual global land and ocean temperature departures from 1850 through 2025, relative to the 1901–2000 average."],
    howToRead: ["Each vertical mark represents an annual temperature departure in degrees Celsius. Blue indicates a year below the twentieth-century average; warmer colours indicate years above it.", "Use the two year sliders to inspect and compare individual annual values. The line joins the reported annual estimates."],
    limitations: ["The baseline is 1901–2000, not a pre-industrial reference. Annual departures are global averages, not local temperatures, and the difference between two years is not a long-term trend.", "Coverage, observation methods, and uncertainty change over time. The source values are rounded and may be revised; uncertainty intervals are not shown."],
    references: [
      { label: "NOAA National Centers for Environmental Information, Climate at a Glance: Global Time Series, annual global land and ocean temperature departures, snapshot retrieved 17 November 2026.", url: "https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/global/time-series" },
      { label: "NOAA Global Surface Temperature Dataset (NOAAGlobalTemp), methodology and dataset documentation.", url: "https://www.ncei.noaa.gov/products/land-based-station/noaa-global-temp" },
    ], version: 1, updated: "2026-11-17",
  },
  {
    slug: "wine-chemical-fingerprints", title: "A fingerprint in thirteen measures",
    summary: "Explore the chemistry of 178 wine samples through thirteen measurements and three cultivar groups.",
    kind: "2d", discipline: "Chemistry · Open data", component: "wine-fingerprints", visibility: "public",
    attribution: { owner: "Stefan Aeberhard and M. Forina · UCI Machine Learning Repository", url: "https://doi.org/10.24432/C5PC7J" },
    about: ["Thirteen chemical measurements form a distinctive profile for each sample in the UCI Wine dataset. The samples come from three cultivars grown in the same region of Italy.", "This interactive compares class averages and lets you inspect individual rows. It uses the original measurements donated to the UCI Machine Learning Repository, with each feature scaled across the sample for the radial view."],
    howToRead: ["Each spoke represents one measurement. The centre is the smallest value of that measurement in the dataset, and the outer ring is its largest; the scale is separate for every spoke.", "Toggle the three class averages and select a sample to compare it with them. The table reports unscaled source values and class means."],
    limitations: ["These are relative, dataset-specific scales, so equal distances on different spokes do not imply equal chemical quantities. The shapes and their area depend on the arbitrary ordering of features.", "Class averages conceal variation and do not demonstrate causation or predict taste or quality. The sample is small and geographically limited; the original source does not specify units for every feature."],
    references: [
      { label: "Aeberhard and Forina (1992), Wine [Dataset], UCI Machine Learning Repository; attribute information contributed by Riccardo Leardi. Adapted for display, CC BY 4.0.", url: "https://doi.org/10.24432/C5PC7J" },
      { label: "Aeberhard, Coomans and de Vel (1994), Comparative analysis of statistical pattern recognition methods in high dimensional settings.", url: "https://doi.org/10.1016/0031-3203(94)90145-7" },
      { label: "Creative Commons Attribution 4.0 International license.", url: "https://creativecommons.org/licenses/by/4.0/" },
    ], version: 1, updated: "2026-11-16",
  },
  {
    slug: "hemoglobin-in-four-parts", title: "Hemoglobin, in four parts",
    summary: "Turn a real molecular structure in three dimensions and explore the four protein chains that carry oxygen in blood.",
    kind: "3d", discipline: "Structural biology · Open data", component: "hemoglobin-3d", visibility: "public",
    attribution: { owner: "J. R. Tame and B. Vallone · Worldwide Protein Data Bank", url: "https://doi.org/10.2210/pdb1A3N/pdb" },
    about: ["Hemoglobin is the protein in red blood cells that carries oxygen. Its four protein chains each contain a heme group with an iron atom at its centre.", "This interactive draws on atomic coordinates from PDB entry 1A3N, a crystal structure of human deoxyhemoglobin deposited by Tame and Vallone. It is an original rendering of the deposited data, not a reproduction of a published illustration."],
    howToRead: ["Drag to rotate and scroll or pinch to zoom. Use the chain controls to show individual subunits; the rotate buttons offer a keyboard-accessible way to change the view.", "The coloured tubes follow the chain's alpha-carbon positions. Small gold markers identify heme iron atoms, not the complete heme molecules."],
    limitations: ["This is one experimentally derived structure of deoxyhemoglobin, not a movie of how it binds oxygen. The smooth tubes interpolate between sampled atoms and are not chemical bonds or full atomic surfaces.", "Colours and iron marker sizes are artistic. The coordinate model has experimental uncertainty and does not show every atom, solvent molecule or molecular interaction."],
    references: [
      { label: "Tame and Vallone (1998), Deoxy human hemoglobin, PDB 1A3N, worldwide Protein Data Bank; coordinate snapshot retrieved 16 November 2026, adapted for display. CC0 1.0.", url: "https://doi.org/10.2210/pdb1A3N/pdb" },
      { label: "Tame and Vallone (2000), The structures of deoxy human haemoglobin and the mutant Hb Tyrα42His at 120 K.", url: "https://doi.org/10.1107/S0907444900006387" },
      { label: "wwPDB archive data usage policy (CC0 1.0).", url: "https://www.rcsb.org/pages/usage-policy" },
    ], version: 1, updated: "2026-11-16",
  },
  {
    slug: "life-expectancy-lines", title: "Lives in the data",
    summary: "Trace six decades of life expectancy estimates and compare the paths of countries and economies.",
    kind: "2d", discipline: "Demography · Open data", component: "life-lines", visibility: "public",
    attribution: { owner: "World Bank World Development Indicators · United Nations Population Division", url: "https://data.worldbank.org/indicator/SP.DYN.LE00.IN" },
    about: ["Life expectancy at birth captures the mortality conditions of a particular year as one number. Drawing each economy's annual series together reveals both broad change and very different paths.", "This original interactive uses the World Bank's World Development Indicators series SP.DYN.LE00.IN, drawing on sources including the United Nations Population Division and national statistical offices."],
    howToRead: ["Each fine line is one country or economy; its height is period life expectancy at birth in years. Select two economies, choose a region for the background, and move through time to inspect their estimates.", "The year cursor reports values for that year. Gaps in source data are left as gaps rather than interpolated by this visualisation."],
    limitations: ["Period life expectancy is a hypothetical measure based on mortality rates in the selected year, not a prediction of how long a newborn will live. It can change sharply during temporary mortality shocks.", "Values are estimates, may include interpolation in the underlying source, and vary in data quality and coverage; no uncertainty intervals are shown. The World Bank's economies and regional classifications do not imply political endorsement."],
    references: [
      { label: "World Bank, World Development Indicators: life expectancy at birth, total (SP.DYN.LE00.IN), snapshot retrieved 16 November 2026; adapted for display. CC BY 4.0, subject to World Bank data terms.", url: "https://data.worldbank.org/indicator/SP.DYN.LE00.IN" },
      { label: "World Bank Open Data licensing and terms of use.", url: "https://datacatalog.worldbank.org/public-licenses" },
      { label: "United Nations Population Division, World Population Prospects 2024: Methodology of the United Nations Population Estimates and Projections.", url: "https://population.un.org/wpp/assets/Files/WPP2024_Methodology-Report_Final.pdf" },
      { label: "Luy et al. (2020), Life Expectancy: Frequently Used, but Hardly Understood.", url: "https://doi.org/10.1159/000500955" },
    ], version: 1, updated: "2026-11-16",
  },
  {
    slug: "earthquakes-beneath-2025", title: "A year beneath our feet",
    summary: "Explore the depth, timing and magnitude of earthquakes recorded around the world in 2025.",
    kind: "2d", discipline: "Earth science · Open data", component: "seismic-year", visibility: "public",
    attribution: { owner: "U.S. Geological Survey and contributing seismic networks", url: "https://earthquake.usgs.gov/data/comcat/" },
    about: ["Earthquakes happen deep within the Earth as well as near the surface. This interactive places a year of larger earthquakes on a single timeline to reveal the range of depths at which they occurred.", "The snapshot contains earthquakes of magnitude 6.0 and above, with origin times in 2025 UTC, from the USGS Advanced National Seismic System Comprehensive Earthquake Catalog (ComCat)."],
    howToRead: ["Time runs from left to right and reported depth increases downwards. Circle size represents magnitude, not the area affected or energy released.", "Choose a month to focus the view. Select a point or use the event selector to inspect its location, date, magnitude, and depth; follow the USGS link for the full event record."],
    limitations: ["This is a selected catalog of magnitude 6.0+ events, not every earthquake; aftershocks are included. Catalog entries and estimated magnitudes, locations and depths can be revised.", "The vertical axis is reported hypocentral depth, not a geographic cross-section. The chart does not show damage, shaking intensity, or tsunami risk. Magnitudes may use different measurement types."],
    references: [
      { label: "U.S. Geological Survey, ANSS Comprehensive Earthquake Catalog, worldwide magnitude 6.0+ earthquakes in 2025 (snapshot retrieved 16 November 2026).", url: "https://earthquake.usgs.gov/data/comcat/" },
      { label: "U.S. Geological Survey (2017), Advanced National Seismic System Comprehensive Catalog of Earthquake Events and Products.", url: "https://doi.org/10.5066/F7MS3QZH" },
      { label: "Guy et al. (2015), National Earthquake Information Center systems overview and integration, U.S. Geological Survey Open-File Report 2015–1120.", url: "https://doi.org/10.3133/ofr20151120" },
    ], version: 1, updated: "2026-11-16",
  },
  {
    slug: "trappist-one-orbital-dance", title: "Seven worlds, one tiny star",
    summary: "Set seven distant worlds in motion and explore the extraordinary rhythm of TRAPPIST-1.",
    kind: "2d", discipline: "Astronomy · Open data", component: "planetary-orbits", visibility: "public",
    attribution: { owner: "NASA Exoplanet Archive · Agol et al.", url: "https://exoplanetarchive.ipac.caltech.edu/overview/TRAPPIST-1" },
    about: ["Seven known planets circle the ultracool dwarf star TRAPPIST-1. Their orbital periods range from about one and a half to nearly nineteen Earth days.", "This original interactive uses period, orbital distance and planetary radius estimates from the NASA Exoplanet Archive's composite parameters table, attributed to Agol and colleagues."],
    howToRead: ["Choose a planet to inspect its estimated orbital period, semi-major axis and radius. Press play or scrub through the schematic's elapsed days.", "Each planet moves according to its measured orbital period. Orbit spacing is compressed for legibility; sizes and colours are artistic."],
    limitations: ["The circular orbits and shared starting alignment are schematic. Positions are not predictions or an ephemeris; real orbits, phases and interactions are more complicated.", "Estimates have uncertainty; this display uses a fixed archive snapshot without uncertainty intervals."],
    references: [
      { label: "NASA Exoplanet Archive, Planetary Systems Composite Parameters; TRAPPIST-1 (snapshot accessed 16 November 2026).", url: "https://exoplanetarchive.ipac.caltech.edu/overview/TRAPPIST-1" },
      { label: "Agol et al. (2021), Refining the Transit-timing and Photometric Analysis of TRAPPIST-1.", url: "https://doi.org/10.3847/PSJ/abd022" },
      { label: "Christiansen et al. (2025), The NASA Exoplanet Archive and Exoplanet Follow-up Observing Program: Data, Tools, and Usage.", url: "https://doi.org/10.3847/PSJ/ade3c2" },
    ], version: 1, updated: "2026-11-16",
  },
  {
    slug: "atmosphere-in-spirals", title: "The atmosphere, in spirals",
    summary: "Follow nearly seven decades of atmospheric carbon dioxide, one month at a time.",
    kind: "2d", discipline: "Climate science · Open data", component: "carbon-spiral", visibility: "public",
    attribution: { owner: "NOAA Global Monitoring Laboratory and Scripps Institution of Oceanography", url: "https://gml.noaa.gov/ccgg/trends/data.html" },
    about: ["The Mauna Loa carbon dioxide record captures both a seasonal cycle and a long-term rise. This spiral places each monthly mean within its year, making both patterns visible at once.", "The record combines Scripps measurements from 1958 through April 1974 with NOAA measurements thereafter. The underlying data are distributed by NOAA Global Monitoring Laboratory."],
    howToRead: ["Each ring represents a year, moving outward from 1958. Position around the ring is month; colour indicates the monthly mean CO₂ concentration in parts per million (ppm).", "Use the year slider to inspect individual monthly values. The colour scale is fixed across the complete record."],
    limitations: ["This is a single observatory record, not a direct global mean. Some missing months are interpolated in the source record.", "Measurements from December 2022 to July 4, 2023 came from nearby Maunakea after the Mauna Loa eruption. The final year in the snapshot may be incomplete; data can be revised by NOAA."],
    references: [
      { label: "Xin Lan, NOAA Global Monitoring Laboratory, and Ralph Keeling, Scripps Institution of Oceanography: Mauna Loa monthly mean CO₂ record (snapshot created 9 October 2026).", url: "https://gml.noaa.gov/ccgg/trends/data.html" },
      { label: "Keeling et al. (1976), Atmospheric carbon dioxide variations at Mauna Loa Observatory, Hawaii.", url: "https://doi.org/10.1111/j.2153-3490.1976.tb00701.x" },
      { label: "Thoning, Tans and Komhyr (1989), Atmospheric carbon dioxide at Mauna Loa Observatory 2: Analysis of the NOAA GMCC data, 1974–1985.", url: "https://doi.org/10.1029/JD094iD06p08549" },
    ], version: 1, updated: "2026-11-16",
  },
  {
    slug: "iris-flower-measurements", title: "The secret shapes of irises",
    summary: "Explore 150 flowers, four measurements and the patterns that distinguish three species.",
    kind: "2d", discipline: "Botany · Open data", component: "iris-data", visibility: "public",
    attribution: { owner: "R. A. Fisher and the UCI Machine Learning Repository", url: "https://doi.org/10.24432/C56C76" },
    about: ["Every dot is one iris flower. Compare its sepal and petal measurements to see how species cluster, overlap and defy simple boundaries.", "This visualisation uses the original iris.data file distributed by UCI, with species labels shortened for display. UCI notes that two records differ from those in Fisher’s paper."],
    howToRead: ["Choose a measurement for each axis and filter by species. Hover or tap a dot for its values.", "Measurements are in centimetres. Overlapping observations can occupy the same position."],
    limitations: ["These 150 observations are a historical sample, not a representative survey of all irises.", "UCI documents discrepancies in two records compared with the paper; the source values are retained here."],
    references: [
      { label: "Fisher, R. (1936). Iris [Dataset]. UCI Machine Learning Repository. Data adapted for display; CC BY 4.0.", url: "https://doi.org/10.24432/C56C76" },
      { label: "Creative Commons Attribution 4.0 International license.", url: "https://creativecommons.org/licenses/by/4.0/" },
      { label: "Fisher, R. A. (1936). The use of multiple measurements in taxonomic problems.", url: "https://doi.org/10.1111/j.1469-1809.1936.tb02137.x" },
    ], version: 1, updated: "2026-11-15",
  },
  {
    slug: "palmer-penguin-proportions", title: "The surprisingly different shapes of penguins",
    summary: "Meet the penguins of the Palmer Archipelago through their bills, flippers and body mass.",
    kind: "2d", discipline: "Ecology · Open data", component: "penguin-data", visibility: "public",
    attribution: { owner: "Kristen Gorman and Palmer Station LTER", url: "https://allisonhorst.github.io/palmerpenguins/" },
    about: ["Three species share the islands around Palmer Station, Antarctica. Their measurements reveal distinct clusters, but also plenty of variation within each species.", "This visual uses the palmerpenguins simplified dataset, collected by Kristen Gorman and the Palmer Station Long Term Ecological Research program and assembled by Allison Horst, Alison Hill and Kristen Gorman."],
    howToRead: ["Change the axes to compare bill, flipper and body measurements; select a species to isolate it.", "Every dot is an individual penguin. Lengths are in millimetres and body mass is in grams."],
    limitations: ["Only individuals with both selected measurements are plotted; the count of records missing either measurement is shown beneath the chart.", "This is a historical sample from three islands and three years, not a census of all penguins."],
    references: [
      { label: "Horst, A. M., Hill, A. P. & Gorman, K. B. palmerpenguins: Palmer Archipelago penguin data. Data adapted for display; CC0.", url: "https://allisonhorst.github.io/palmerpenguins/" },
      { label: "Creative Commons CC0 1.0 Universal public domain dedication.", url: "https://creativecommons.org/publicdomain/zero/1.0/" },
      { label: "Gorman, K. B., Williams, T. D. & Fraser, W. R. (2014). Ecological sexual dimorphism and environmental variability within a community of Antarctic penguins.", url: "https://doi.org/10.1371/journal.pone.0090081" },
    ], version: 1, updated: "2026-11-15",
  },
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
