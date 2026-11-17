# Public data samples

These original interactive designs use local snapshots so they work without a live external data service. Each links to the source and research from the visual itself as well as from the page, including when embedded. Their illustrations and layouts were created for this site; they do not reproduce published figures. Recheck source terms and citations before reuse in a research publication; attribution alone is not a blanket legal clearance.

## Wine chemical fingerprints

- Page: `/viz/wine-chemical-fingerprints`.
- Original source files `public/data/uci-wine.data` and `public/data/uci-wine.names` are unchanged snapshots of [UCI Wine](https://doi.org/10.24432/C5PC7J), retrieved 16 November 2026 from `https://archive.ics.uci.edu/ml/machine-learning-databases/wine/`. Credit: Stefan Aeberhard, M. Forina, the UCI Machine Learning Repository, and Riccardo Leardi (attribute information). UCI supplies this dataset under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); the display is adapted.
- All 178 records (three classes, 13 numeric attributes) are parsed in source row order. Each class mean is calculated from its own rows. Every radial axis is independently normalised to `(value - dataset minimum) / (dataset maximum - dataset minimum)` using all 178 records; the centre and outer ring represent that feature's observed sample minimum and maximum. The table exposes unscaled mean values and the chosen row. The illustration does not infer class names, quality, taste or causality.
- The arbitrary order and disparate normalisations make polygon area unsuitable as an aggregate metric. Group means conceal within-class variation. UCI notes that the samples come from one Italian region and that units are not supplied for all attributes.
- UCI lists [Aeberhard, Coomans and de Vel (1994)](https://doi.org/10.1016/0031-3203(94)90145-7) as an introductory paper. Cite it and the dataset independently; the visual is an original rendering.

## Hemoglobin in four parts

- Page: `/viz/hemoglobin-in-four-parts`.
- The unmodified coordinate file `public/data/1A3N.pdb` is a snapshot of [PDB entry 1A3N](https://doi.org/10.2210/pdb1A3N/pdb), downloaded 16 November 2026 from `https://files.rcsb.org/download/1A3N.pdb`. It is an X-ray diffraction structure of human deoxyhemoglobin, deposited by J. R. Tame and B. Vallone, with 1.8 Å resolution as reported in the coordinate file.
- The browser reads alpha-carbon (`ATOM`, `CA`) coordinates in chains A–D, accepting the blank or A alternate location, and the iron (`HETATM`, `HEM`, `FE`) coordinates. The four chains are centred on the mean of their alpha carbons, split at gaps above 5 Å, and drawn as smoothed Catmull–Rom tubes. The gold spheres mark iron centres with exaggerated radii. Other atoms are omitted. Chain colours and tubing are illustrative; they do not depict bonds, surfaces, or a measured animation. The model starts stationary.
- The source coordinate archive is dedicated to the public domain under [CC0 1.0](https://www.rcsb.org/pages/usage-policy); the site gives attribution and links the [Tame and Vallone paper](https://doi.org/10.1107/S0907444900006387). This applies to coordinate data, not automatically to third-party illustrations or text.

## Lives in the data

- Page: `/viz/life-expectancy-lines`.
- Source: [World Bank World Development Indicators, SP.DYN.LE00.IN](https://data.worldbank.org/indicator/SP.DYN.LE00.IN), retrieved 16 November 2026, API dataset last updated 11 November 2026. Underlying sources include the United Nations Population Division and national statistical offices. World Bank data are available under [CC BY 4.0 with World Bank additional terms](https://datacatalog.worldbank.org/public-licenses); the browser file is adapted as described below.
- Original API responses: `data/source/worldbank-life-expectancy-1960-2024.json` and `data/source/worldbank-countries.json`. Retrieved via `https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN?format=json&per_page=20000&date=1960:2024` and `https://api.worldbank.org/v2/country?format=json&per_page=400`.
- Run `node scripts/prepare-worldbank-life.mjs` to produce `public/data/worldbank-life-expectancy-compact.json`: this excludes World Bank aggregate regions (region ID `NA`), retains countries and economies with at least one value, joins on ISO3 code, orders by country name, and stores values in 1960–2024 order with nulls for missing years. Numeric values are unchanged; only the displayed values are rounded to one decimal. Region names use the World Bank's categories and are not necessarily geographic continents.
- The plot joins consecutive observations but breaks at missing values, never filling them. The vertical scale is 0–90 years; the cursor shows only the value for the selected year. Selected countries remain highlighted regardless of the background region filter. Playback stops at the end and starts paused.
- Period life expectancy is a hypothetical life-table measure, not a forecast for a baby born in that year. The underlying series may use estimation and interpolation; uncertainty and within-country differences are not shown. See the [World Bank metadata](https://databank.worldbank.org/metadataglossary/world-development-indicators/series/SP.DYN.LE00.IN), [UN population methodology](https://population.un.org/wpp/assets/Files/WPP2024_Methodology-Report_Final.pdf), and [Luy et al. (2020)](https://doi.org/10.1159/000500955) on interpretation.

## Earthquakes beneath 2025

- Page: `/viz/earthquakes-beneath-2025`.
- File: `public/data/usgs-earthquakes-2025-m6.geojson`, an unchanged snapshot of the [USGS ANSS Comprehensive Earthquake Catalog](https://earthquake.usgs.gov/data/comcat/), retrieved 16 November 2026. It contains 145 catalog events at the time of download.
- Reproduce with the [USGS FDSN event service](https://earthquake.usgs.gov/fdsnws/event/1/USGS): `format=geojson`, `starttime=2025-01-01`, `endtime=2026-01-01`, `minmagnitude=6`, `eventtype=earthquake`, `orderby=time-asc`. Display applies the half-open UTC interval [2025-01-01, 2026-01-01), because the API's end time can be inclusive.
- Time on the horizontal axis is UTC origin time, and depth on the vertical axis comes from the third GeoJSON coordinate in kilometres. Circle radius increases linearly with magnitude for visibility; circle area is not proportional to energy. Colours group depths below 70 km, 70–299 km, and 300 km or deeper. The diagram is not geographic. The filter retains dimmed out-of-period points for context; counts and event selection include only the chosen period.
- Magnitude, time, location, and depth are estimated, sometimes revised, and may use different magnitude types. The sample includes aftershocks and does not represent every earthquake or its effects. It is a fixed snapshot, not a live warning system.
- Cite [USGS ANSS ComCat](https://doi.org/10.5066/F7MS3QZH) and [Guy et al. (2015)](https://doi.org/10.3133/ofr20151120). USGS generally makes its own information public domain, but [its reuse policy](https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits) notes that third-party material can have separate rights; retain contributor attribution and verify the specific use.

## TRAPPIST-1 orbital dance

- Page: `/viz/trappist-one-orbital-dance`.
- File: `public/data/trappist-1.csv`; per-field source references: `public/data/trappist-1-references.csv`.
- Source: [NASA Exoplanet Archive Planetary Systems Composite Parameters](https://exoplanetarchive.ipac.caltech.edu/docs/API_PS_columns.html), accessed 16 November 2026. This research has made use of the NASA Exoplanet Archive, operated by the California Institute of Technology under contract with NASA under the Exoplanet Exploration Program.
- Reproduce using the TAP sync endpoint `https://exoplanetarchive.ipac.caltech.edu/TAP/sync` with query `select pl_name,pl_orbper,pl_orbsmax,pl_rade from pscomppars where hostname = 'TRAPPIST-1' order by pl_orbper` and `format=csv`. The references snapshot uses the same query with the three respective `_reflink` fields. All displayed values in this snapshot are attributed to [Agol et al. (2021)](https://doi.org/10.3847/PSJ/abd022).
- The drawing invents initial phases, colour, size, and circular geometry. Orbit spacing uses a square-root mapping of semi-major axis for readability. Angular velocity is calculated from the archived orbital period; this is not an ephemeris or a dynamical simulation. The animation starts paused.
- This is a fixed snapshot, not a live catalog; updates may change values and source references. When refreshing, verify all seven rows, the individual references, and the visualisation metadata.

## Atmospheric CO₂ spiral

- Page: `/viz/atmosphere-in-spirals`.
- File: `public/data/co2_mm_mlo.csv`, downloaded unchanged from [NOAA's monthly mean CSV](https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv); the source file says it was created 9 October 2026. [NOAA's data page](https://gml.noaa.gov/ccgg/trends/data.html) requests acknowledgement of Xin Lan/NOAA GML and Ralph Keeling/Scripps.
- The source combines Scripps measurements from March 1958 through April 1974 and NOAA data thereafter. It includes interpolated months. Negative standard deviation marks NOAA interpolations, but Scripps uncertainty and interpolation flags are unavailable; the interface distinguishes these cases. Maunakea supplied data from December 2022 to July 4, 2023 following the Mauna Loa eruption. The last year may be incomplete.
- Position around the spiral encodes month; distance from its centre encodes year, not CO₂. Colour uses the monthly mean column, clamped to the indicated 310–435 ppm scale. The accessible year slider exposes numeric values; a dash denotes a month absent from the snapshot. The record is not a global mean and source data are subject to revision.
- Supporting research: [Keeling et al. (1976)](https://doi.org/10.1111/j.2153-3490.1976.tb00701.x) and [Thoning et al. (1989)](https://doi.org/10.1029/JD094iD06p08549). NOAA's file describes its data use and requests appropriate credit; consult it and the provider for publication use.
