// Rebuild the compact visualisation data from the two unmodified API snapshots.
import { readFile, writeFile } from "node:fs/promises";

const read = async (name) => JSON.parse(await readFile(new URL(`../data/source/${name}`, import.meta.url), "utf8"));
const [metadata, observations] = await read("worldbank-life-expectancy-1960-2024.json");
const [, countries] = await read("worldbank-countries.json");
const byId = new Map(countries.filter((c) => c.region.id !== "NA").map((c) => [c.id, { id: c.id, name: c.name, region: c.region.value.trim(), values: Array(65).fill(null) }]));
for (const row of observations) {
  const country = byId.get(row.countryiso3code);
  const index = Number(row.date) - 1960;
  if (country && index >= 0 && index < 65 && typeof row.value === "number" && Number.isFinite(row.value)) country.values[index] = row.value;
}
const series = [...byId.values()].filter((c) => c.values.some((v) => v !== null)).sort((a, b) => a.name.localeCompare(b.name));
await writeFile(new URL("../public/data/worldbank-life-expectancy-compact.json", import.meta.url), JSON.stringify({ source: "World Bank World Development Indicators, SP.DYN.LE00.IN", lastUpdated: metadata.lastupdated, startYear: 1960, series }));
console.log(`Wrote ${series.length} country and economy series.`);
