"use client";

import { useEffect, useMemo, useState } from "react";
import { PlaybackButton, useSequencePlayback } from "./playback";
import "./research-samples.css";
import "./research-atlases.css";

type Country = { id: string; name: string; region: string; gdp: number; life: number };
type Dataset = { year: number; countries: Country[] };
const colours = ["#f1b39e", "#a6d4c4", "#b4b8e4", "#e7c18b", "#98c6da", "#e39fba", "#cbd2ac"];
const px = (value: number) => 65 + (Math.log10(value) - 2) / 4 * 675;
const py = (value: number) => 308 - (value - 40) / 50 * 270;
const money = (value: number) => `$${Math.round(value).toLocaleString("en-GB")}`;

export default function HealthAndIncome() {
  const [data, setData] = useState<Dataset | null>(null);
  const [error, setError] = useState(false);
  const [region, setRegion] = useState("All regions");
  const [selectedId, setSelectedId] = useState("GBR");
  useEffect(() => {
    fetch("/data/worldbank-health-income-2023.json").then(r => { if (!r.ok) throw new Error(); return r.json(); }).then((d: Dataset) => { if (!Array.isArray(d.countries) || !d.countries.length) throw new Error(); setData(d); }).catch(() => setError(true));
  }, []);
  const regions = useMemo(() => [...new Set((data?.countries ?? []).map(c => c.region))].sort(), [data]);
  const visible = useMemo(() => (data?.countries ?? []).filter(c => region === "All regions" || c.region === region), [data, region]);
  const selected = visible.find(c => c.id === selectedId);
  const playback = useSequencePlayback(data ? ["All regions", ...regions] : [], region, (next) => {
    setRegion(next);
    setSelectedId("");
  }, 1400);
  const color = (r: string) => colours[regions.indexOf(r) % colours.length];
  return <div className="research-viz income-viz">
    <div className="research-header"><span>FIELD NOTES / 09</span><span>WORLD DEVELOPMENT INDICATORS ↗</span></div>
    <div className="research-intro"><div><p className="research-eyebrow">TWO MEASURES, MANY STORIES</p><h2>Money, health<br/><em>and the space between.</em></h2></div><p>Compare economic output and life expectancy across economies in a single year.</p></div>
    {error ? <p role="alert">The World Bank data could not be loaded. Please refresh.</p> : !data ? <p role="status">Loading the country data…</p> : <>
      <div className="atlas-metrics"><div><strong>{visible.length}</strong><span>ECONOMIES SHOWN</span></div><div><strong>{data.year}</strong><span>OBSERVATION YEAR</span></div><div><strong>2</strong><span>WORLD BANK INDICATORS</span></div></div>
      <PlaybackButton {...playback} description="regional comparisons" className="research-action mt-4" />
      <div className="income-controls"><label>EXPLORE A REGION<select value={region} onChange={e => playback.select(e.target.value)}><option>All regions</option>{regions.map(r => <option key={r}>{r}</option>)}</select></label><label>INSPECT AN ECONOMY<select value={selected?.id ?? ""} onChange={e => setSelectedId(e.target.value)}><option value="">Choose an economy</option>{visible.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
      <div className="atlas-chart"><svg viewBox="0 0 790 360" role="img" aria-label={`Scatter plot of GDP per capita and life expectancy in ${data.year}. ${visible.length} economies shown. Use the economy selector to inspect each observation.`}>
        {[100,1000,10000,100000,1000000].map(t => <g key={t}><line x1={px(t)} x2={px(t)} y1="38" y2="308" stroke="#fff" strokeOpacity=".1"/><text x={px(t)} y="330" textAnchor="middle" className="atlas-axis">{t >= 1000 ? `$${t/1000}k` : `$${t}`}</text></g>)}
        {[40,50,60,70,80,90].map(t => <g key={t}><line x1="65" x2="740" y1={py(t)} y2={py(t)} stroke="#fff" strokeOpacity=".1"/><text x="53" y={py(t)+3} textAnchor="end" className="atlas-axis">{t}</text></g>)}
        <text x="65" y="20" className="atlas-axis">LIFE EXPECTANCY AT BIRTH / YEARS ↑</text><text x="740" y="352" textAnchor="end" className="atlas-axis">GDP PER PERSON / CURRENT US$ · LOG SCALE →</text>
        {visible.map(c => <circle key={c.id} cx={px(c.gdp)} cy={py(c.life)} r={selected?.id === c.id ? 7 : 4.1} fill={color(c.region)} fillOpacity={selected?.id === c.id ? 1 : .68} stroke={selected?.id === c.id ? "white" : "none"} strokeWidth="2" onClick={() => setSelectedId(c.id)} style={{cursor:"pointer"}}><title>{`${c.name}: ${money(c.gdp)} GDP per capita, ${c.life.toFixed(1)} years`}</title></circle>)}
      </svg></div>
      <div className="atlas-legend">{regions.map(r => <span key={r}><i style={{background:color(r)}}/>{r}</span>)}</div>
      <div className="atlas-detail">{selected ? <div className="atlas-facts"><strong>{selected.name}</strong><span>{selected.region}</span><span>{money(selected.gdp)} GDP per capita</span><span>{selected.life.toFixed(1)} years life expectancy</span></div> : <p>Select a point or use the economy selector to inspect its values.</p>}</div>
      <p className="research-note">GDP per capita is measured in current US dollars, not adjusted for purchasing power or income inequality. Life expectancy is a period estimate, not an individual prediction. Both measures have uncertainty; only economies with both values are shown. The association does not establish a causal relationship.</p>
    </>}
    <p className="research-source">Data: World Bank World Development Indicators, <a href="https://data.worldbank.org/indicator/NY.GDP.PCAP.CD" target="_blank" rel="noreferrer">GDP per capita (current US$)</a> and <a href="https://data.worldbank.org/indicator/SP.DYN.LE00.IN" target="_blank" rel="noreferrer">life expectancy at birth</a>, 2023. GDP snapshot 17 November 2026; life expectancy snapshot 16 November 2026. <a href="https://datacatalog.worldbank.org/public-licenses" target="_blank" rel="noreferrer">CC BY 4.0, subject to World Bank terms</a>.</p>
  </div>;
}
