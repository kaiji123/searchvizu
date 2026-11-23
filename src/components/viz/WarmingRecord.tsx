"use client";

import { useEffect, useMemo, useState } from "react";
import { PlaybackButton, useRangePlayback } from "./playback";
import "./research-samples.css";
import "./research-atlases.css";

type Data = { baseline: string; retrieved: string; annual: [number, number][] };
const x = (year: number) => 53 + (year - 1850) / 175 * 690;
const y = (value: number) => 244 - (value + .6) / 2.2 * 220;
const signed = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
const colour = (value: number) => value < 0 ? "#7ab5c4" : value < .5 ? "#e4b783" : "#ee806c";

export default function WarmingRecord() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);
  const [year, setYear] = useState(2025);
  const [compare, setCompare] = useState(1900);
  const playback = useRangePlayback(year, setYear, { min: 1850, max: 2025, step: 1, delay: 90, ready: !!data });
  useEffect(() => {
    fetch("/data/noaa-annual-temperature.json").then(r => { if (!r.ok) throw new Error(); return r.json(); }).then((d: Data) => { if (!Array.isArray(d.annual) || d.annual.length < 100) throw new Error(); setData(d); }).catch(() => setError(true));
  }, []);
  const lookup = useMemo(() => new Map(data?.annual ?? []), [data]);
  const value = lookup.get(year), other = lookup.get(compare);
  const path = data?.annual.map(([yr, v], i) => `${i ? "L" : "M"}${x(yr).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return <div className="research-viz warming-viz">
    <div className="research-header"><span>FIELD NOTES / 08</span><span>NOAA GLOBAL CLIMATE RECORD ↗</span></div>
    <div className="research-intro"><div><p className="research-eyebrow">176 YEARS OF A CHANGING PLANET</p><h2>The shape<br/><em>of a warming world.</em></h2></div><p>Every line is a year. Together they reveal how global land and ocean temperatures have changed.</p></div>
    {error ? <p role="alert">The temperature record could not be loaded. Please refresh.</p> : !data ? <p role="status">Loading the climate record…</p> : <>
      <div className="warming-headline"><div><span>THE SELECTED YEAR · {year}</span><strong>{value == null ? "—" : signed(value)}<small> °C</small></strong><p>relative to the {data.baseline} average</p></div><div className="warming-compare"><span>COMPARE WITH · {compare}</span><strong>{other == null ? "—" : signed(other)}<small> °C</small></strong><p>{value == null || other == null ? "Data unavailable" : `${signed(value - other)} °C difference between selected years`}</p></div></div>
      <div className="warming-chart"><svg viewBox="0 0 780 290" role="img" aria-label={`Annual global land and ocean temperature departures from 1850 to 2025. ${year}: ${value == null ? "no data" : `${signed(value)} degrees Celsius`}. ${compare}: ${other == null ? "no data" : `${signed(other)} degrees Celsius`}. Select years with the sliders.`}>
        {[-.5, 0, .5, 1, 1.5].map(t => <g key={t}><line x1="53" x2="743" y1={y(t)} y2={y(t)} stroke="#fff" strokeOpacity={t === 0 ? .4 : .12} strokeDasharray={t === 0 ? "3 3" : undefined}/><text x="44" y={y(t)+4} textAnchor="end" className="atlas-axis">{t > 0 ? `+${t}` : t}</text></g>)}
        {data.annual.map(([yr, v]) => <line key={yr} x1={x(yr)} x2={x(yr)} y1={y(0)} y2={y(v)} stroke={colour(v)} strokeWidth="2.5" strokeOpacity={yr === year || yr === compare ? 1 : .55} onClick={() => setYear(yr)}><title>{`${yr}: ${signed(v)} °C`}</title></line>)}
        <path d={path} fill="none" stroke="#f6e5d4" strokeOpacity=".42" strokeWidth="1"/>
        {[year,compare].map((yr,i) => { const v = lookup.get(yr); return v == null ? null : <g key={i}><line x1={x(yr)} x2={x(yr)} y1="24" y2="253" stroke={i ? "#a9d5df" : "#f6dbbd"} strokeDasharray="3 4" opacity=".7"/><circle cx={x(yr)} cy={y(v)} r="4.5" fill={i ? "#a9d5df" : "#f6dbbd"}/></g>; })}
        {[1850,1900,1950,2000,2025].map(t => <text key={t} x={x(t)} y="274" textAnchor="middle" className="atlas-axis">{t}</text>)}<text x="53" y="14" className="atlas-axis">TEMPERATURE DEPARTURE / °C ↑</text>
      </svg></div>
      <PlaybackButton {...playback} description="temperature record" className="research-action mt-4" />
      <div className="warming-sliders"><label>SELECT YEAR <strong>{year}</strong><input type="range" min="1850" max="2025" value={year} onChange={e => playback.select(Number(e.target.value))}/></label><label>COMPARE YEAR <strong>{compare}</strong><input type="range" min="1850" max="2025" value={compare} onChange={e => setCompare(Number(e.target.value))}/></label></div>
      <div className="warming-key"><span><i style={{background:"#7ab5c4"}}/>Below the 20th-century average</span><span><i style={{background:"#ee806c"}}/>Above the 20th-century average</span></div>
      <p className="research-note">These are annual departures from the 1901–2000 average, not absolute temperatures or warming relative to a pre-industrial baseline. Individual years vary naturally; long-term changes are more informative than a single-year comparison. NOAA revises its estimates as observations and methods change.</p>
    </>}
    <p className="research-source">Source: <a href="https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/global/time-series" target="_blank" rel="noreferrer">NOAA National Centers for Environmental Information, Climate at a Glance: Global Time Series</a>. Land and ocean, annual averages; snapshot 17 November 2026. <a href="https://www.ncei.noaa.gov/products/land-based-station/noaa-global-temp" target="_blank" rel="noreferrer">NOAAGlobalTemp methodology</a>.</p>
  </div>;
}
