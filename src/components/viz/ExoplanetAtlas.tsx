"use client";

import { useEffect, useMemo, useState } from "react";
import { PlaybackButton, useRangePlayback } from "./playback";
import "./research-samples.css";
import "./research-atlases.css";

type Planet = [string, string, number | null, number, number, number | null];
type Data = { retrieved: string; total: number; planets: Planet[] };
const methods: Record<string, string> = { Transit: "#f5bf92", "Radial Velocity": "#89c8bd", Imaging: "#c4b5e8", Microlensing: "#e78e93" };
const color = (method: string) => methods[method] ?? "#a8b2c4";
const x = (period: number) => 62 + (Math.log10(period) + 1) / 10 * 680;
const y = (radius: number) => 318 - (Math.log10(radius) + 1) / 2.5 * 270;
const fmt = (n: number) => n >= 100 ? n.toLocaleString("en-GB", { maximumFractionDigits: 0 }) : n.toLocaleString("en-GB", { maximumFractionDigits: 2 });

export default function ExoplanetAtlas() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);
  const [method, setMethod] = useState("All methods");
  const [year, setYear] = useState(2026);
  const [selection, setSelection] = useState("");
  const playback = useRangePlayback(year, (next) => { setYear(next); setSelection(""); }, {
    min: 1992, max: 2026, step: 1, delay: 280, ready: !!data,
  });
  useEffect(() => {
    fetch("/data/exoplanet-atlas.json").then(r => { if (!r.ok) throw new Error(); return r.json(); }).then((d: Data) => { if (!Array.isArray(d.planets) || !d.planets.length) throw new Error(); setData(d); }).catch(() => setError(true));
  }, []);
  const visible = useMemo(() => (data?.planets ?? []).filter(p => (method === "All methods" || (method === "Other methods" ? !(p[1] in methods) : p[1] === method)) && p[2] !== null && p[2] <= year).sort((a, b) => a[0].localeCompare(b[0])), [data, method, year]);
  const selected = visible.find(p => p[0] === selection);
  const counts = Object.keys(methods).map(m => ({ name: m, count: visible.filter(p => p[1] === m).length }));
  return <div className="research-viz atlas-viz">
    <div className="research-header"><span>FIELD NOTES / 07</span><span>NASA EXOPLANET ARCHIVE ↗</span></div>
    <div className="research-intro"><div><p className="research-eyebrow">A CENSUS OF OTHER WORLDS</p><h2>Beyond our<br/><em>solar system.</em></h2></div><p>Thousands of confirmed worlds, each plotted by the length of its year and its estimated size.</p></div>
    {error ? <p role="alert">The exoplanet data could not be loaded. Please refresh.</p> : !data ? <p role="status">Loading the planet catalogue…</p> : <>
      <div className="atlas-metrics"><div><strong>{visible.length.toLocaleString()}</strong><span>WORLDS SHOWN</span></div><div><strong>{data.total.toLocaleString()}</strong><span>IN SOURCE CATALOGUE</span></div><div><strong>{year}</strong><span>DISCOVERED BY</span></div></div>
      <PlaybackButton {...playback} description="exoplanet discoveries" className="research-action mt-4" />
      <div className="atlas-controls"><label>DISCOVERY METHOD<select value={method} onChange={e => { setMethod(e.target.value); setSelection(""); }}><option>All methods</option>{Object.keys(methods).map(m => <option key={m}>{m}</option>)}<option>Other methods</option></select></label><label>DISCOVERIES THROUGH <strong>{year}</strong><input type="range" min="1992" max="2026" value={year} onChange={e => playback.select(Number(e.target.value))}/></label></div>
      <div className="atlas-chart"><svg viewBox="0 0 790 365" role="img" aria-label={`Scatter plot showing ${visible.length} confirmed exoplanets by orbital period and estimated radius. Both axes are logarithmic. Use the planet selector to inspect individual points.`}>
        {[.1, 1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000].map(t => <g key={t}><line x1={x(t)} x2={x(t)} y1="48" y2="318" stroke="#ffffff" strokeOpacity=".1"/><text x={x(t)} y="337" textAnchor="middle" className="atlas-axis">{t >= 1000 ? `10${String(Math.log10(t)).replace(/\d/g, n => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(n)])}` : t}</text></g>)}
        {[.1, 1, 10].map(t => <g key={t}><line x1="62" x2="742" y1={y(t)} y2={y(t)} stroke="#ffffff" strokeOpacity=".12"/><text x="50" y={y(t)+3} textAnchor="end" className="atlas-axis">{t}</text></g>)}
        <text x="62" y="26" className="atlas-axis">PLANET RADIUS / EARTH RADII ↑</text><text x="742" y="358" textAnchor="end" className="atlas-axis">ORBITAL PERIOD / DAYS →</text>
        {visible.map(p => <circle key={p[0]} cx={x(p[3])} cy={y(p[4])} r={selected?.[0] === p[0] ? 5 : 2.1} fill={color(p[1])} fillOpacity={selected?.[0] === p[0] ? 1 : .52} stroke={selected?.[0] === p[0] ? "white" : "none"} onClick={() => setSelection(p[0])} style={{cursor:"pointer"}}><title>{`${p[0]} · ${fmt(p[3])} days · ${fmt(p[4])} Earth radii`}</title></circle>)}
      </svg></div>
      <div className="atlas-legend">{counts.map(m => <span key={m.name}><i style={{background:color(m.name)}}/>{m.name} <b>{m.count.toLocaleString()}</b></span>)}<span><i style={{background:"#a8b2c4"}}/>Other methods</span></div>
      <div className="atlas-detail"><label>INSPECT A PLANET<select value={selected?.[0] ?? ""} onChange={e => setSelection(e.target.value)}><option value="">Choose from the visible worlds</option>{visible.map(p => <option key={p[0]} value={p[0]}>{p[0]}</option>)}</select></label>{selected ? <div className="atlas-facts"><strong>{selected[0]}</strong><span>{selected[1]} · {selected[2]}</span><span>{fmt(selected[3])} days per orbit</span><span>{fmt(selected[4])} Earth radii</span><span>{selected[5] == null ? "Distance unavailable" : `${fmt(selected[5])} parsecs away`}</span></div> : <p>Choose a point or a planet to inspect its measurements.</p>}</div>
      <p className="research-note">Both axes use logarithmic scales. Only planets with positive period and radius estimates and a discovery year are shown. The catalogue is shaped by what each detection method can find; some radii are calculated from mass rather than measured directly. Values are estimates from different publications and can change.</p>
    </>}
    <p className="research-source">Source: <a href="https://exoplanetarchive.ipac.caltech.edu/docs/API_PS_columns.html" target="_blank" rel="noreferrer">NASA Exoplanet Archive, Planetary Systems Composite Parameters</a>. Snapshot 17 November 2026. <a href="https://doi.org/10.3847/PSJ/ade3c2" target="_blank" rel="noreferrer">Christiansen et al. 2025</a>.</p>
  </div>;
}
