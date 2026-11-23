import { readFile, writeFile } from "node:fs/promises";

// Retain the full source snapshots in data/source; serve compact, typed fields.
const planets = JSON.parse(await readFile("data/source/exoplanets-pscomppars.json", "utf8"));
const usable = planets.filter(p => p.pl_name && Number.isFinite(p.pl_orbper) && p.pl_orbper > 0 && Number.isFinite(p.pl_rade) && p.pl_rade > 0);
const result = {
  retrieved: "2026-11-17", total: planets.length,
  planets: usable.map(p => [p.pl_name, p.discoverymethod ?? "Unknown", p.disc_year, p.pl_orbper, p.pl_rade, p.sy_dist]),
};
await writeFile("public/data/exoplanet-atlas.json", JSON.stringify(result));

const climate = JSON.parse(await readFile("data/source/noaa-global-temp.json", "utf8"));
if (climate.description.base_period !== "1901-2000" || !climate.description.title.includes("January - December")) throw new Error("Unexpected NOAA series");
const annual = Object.entries(climate.data).map(([year, value]) => [Number(year), value.departure]).filter(([year, value]) => Number.isInteger(year) && Number.isFinite(value));
await writeFile("public/data/noaa-annual-temperature.json", JSON.stringify({ retrieved: "2026-11-17", baseline: "1901–2000", annual }));
console.log(`Prepared ${result.planets.length}/${result.total} planets and ${annual.length} annual temperature values.`);

const [gdpMeta, gdp] = JSON.parse(await readFile("data/source/worldbank-gdp-2023.json", "utf8"));
const life = JSON.parse(await readFile("public/data/worldbank-life-expectancy-compact.json", "utf8"));
const lifeById = new Map(life.series.map(c => [c.id, c]));
const countries = gdp.flatMap(row => {
  const c = lifeById.get(row.countryiso3code);
  const years = c?.values[2023 - life.startYear];
  return c && typeof row.value === "number" && row.value > 0 && typeof years === "number" ? [{ id: c.id, name: c.name, region: c.region, gdp: row.value, life: years }] : [];
}).sort((a, b) => a.name.localeCompare(b.name));
await writeFile("public/data/worldbank-health-income-2023.json", JSON.stringify({ year: 2023, gdpUpdated: gdpMeta.lastupdated, lifeUpdated: life.lastUpdated, countries }));
console.log(`Prepared ${countries.length} economies with both GDP and life expectancy values.`);
