"use client";

import { useEffect, useMemo, useState } from "react";
import "./research-samples.css";

type Reading = { year: number; month: number; ppm: number; estimated: boolean };
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function colour(value: number) {
  const t = Math.max(0, Math.min(1, (value - 310) / 125));
  const stops = [[98, 180, 180], [239, 190, 113], [237, 106, 89]];
  const segment = Math.min(1, Math.floor(t * 2));
  const f = t * 2 - segment;
  return `rgb(${stops[segment].map((n, i) => Math.round(n + (stops[segment + 1][i] - n) * f)).join(",")})`;
}

export default function CarbonSpiral() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [year, setYear] = useState(2020);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch("/data/co2_mm_mlo.csv").then((response) => { if (!response.ok) throw new Error("Dataset unavailable"); return response.text(); }).then((csv) => {
      const data = csv.split(/\r?\n/).filter((line) => /^\d{4},/.test(line)).map((line) => {
        const [y, m, , value, , , deviation] = line.split(",").map(Number);
        return { year: y, month: m, ppm: value, estimated: (y > 1974 || (y === 1974 && m >= 5)) && deviation < 0 };
      }).filter((item) => item.ppm > 0 && item.month >= 1 && item.month <= 12);
      if (!data.length) throw new Error("Invalid dataset");
      setReadings(data);
    }).catch(() => setError(true));
  }, []);
  const current = useMemo(() => readings.filter((reading) => reading.year === year), [readings, year]);
  const lastYear = readings.at(-1)?.year ?? 2026;
  const minYear = readings[0]?.year ?? 1958;
  const polar = (r: number, month: number) => { const a = (month - 1) * Math.PI / 6 - Math.PI / 2; return [250 + r * Math.cos(a), 250 + r * Math.sin(a)]; };
  return <div className="research-viz carbon-viz">
    <div className="research-header"><span>FIELD NOTES / 02</span><span>NOAA × SCRIPPS ↗</span></div>
    <div className="research-intro"><div><p className="research-eyebrow">THE KEELING RECORD</p><h2>A changing<br /><em>atmosphere.</em></h2></div><p>A monthly pulse of carbon dioxide, recorded across generations and arranged in a spiral of time.</p></div>
    {error ? <p role="alert">The climate dataset could not be loaded. Please try refreshing.</p> : !readings.length ? <p role="status">Loading climate data…</p> : <>
      <div className="carbon-layout"><div className="carbon-art"><svg viewBox="0 0 500 500" role="img" aria-label="Concentric years of monthly carbon dioxide measurements, coloured by concentration. Use the year slider to view the values.">
        {[0, 3, 6, 9].map((m) => { const [x, y] = polar(221, m + 1); return <text key={m} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="carbon-month">{months[m].toUpperCase()}</text>; })}
        {[1960, 1980, 2000, 2020].filter((y) => y <= lastYear).map((y) => <circle key={y} cx="250" cy="250" r={42 + (y - minYear) * 2.35} fill="none" stroke="#ffffff" opacity=".09"/>)}
        {readings.map((p) => { const radius = 42 + (p.year - minYear) * 2.35 + (p.month - 1) * 2.35 / 12; const a1 = (p.month - 1) * Math.PI / 6 - Math.PI / 2; const a2 = a1 + Math.PI / 6 * .88; const x1 = 250 + radius * Math.cos(a1), y1 = 250 + radius * Math.sin(a1), x2 = 250 + radius * Math.cos(a2), y2 = 250 + radius * Math.sin(a2); return <path key={`${p.year}-${p.month}`} d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`} fill="none" stroke={colour(p.ppm)} strokeWidth={p.year === year ? 4.5 : 2.3} opacity={p.year === year ? 1 : .7} />; })}
        <text x="250" y="244" textAnchor="middle" className="carbon-center-year">{year}</text><text x="250" y="264" textAnchor="middle" className="carbon-center-label">SELECTED YEAR</text>
      </svg><div className="carbon-scale"><span>310 ppm</span><div /><span>435 ppm</span></div></div>
      <div className="carbon-details"><p className="research-eyebrow">EXPLORE THE RECORD</p><h3>{year}</h3><p>Monthly mean CO₂ <span>· ppm</span></p><div className="carbon-months">{months.map((month, i) => { const p = current.find((entry) => entry.month === i + 1); return <div key={month}><span>{month}</span><strong style={{ color: p ? colour(p.ppm) : undefined }}>{p ? p.ppm.toFixed(2) : "—"}{p?.estimated ? "*" : ""}</strong></div>; })}</div><p className="carbon-detail-note">{current.length < 12 ? "This year has an incomplete record. " : ""}* indicates a source-interpolated NOAA month. Earlier Scripps interpolation flags are unavailable.</p></div></div>
      <div className="carbon-control"><label htmlFor="carbon-year">YEAR <strong>{year}</strong></label><input id="carbon-year" type="range" min={minYear} max={lastYear} step="1" value={year} onChange={(event) => setYear(Number(event.target.value))}/><div><span>{minYear}</span><span>{lastYear}</span></div></div>
      <p className="research-note">Outward = later years · Around = months · Colour = CO₂ concentration. NOAA combines Scripps and NOAA data; Maunakea supplied observations during the 2022–23 eruption interruption.</p>
    </>}
    <p className="research-source">Data: <a href="https://gml.noaa.gov/ccgg/trends/data.html" target="_blank" rel="noreferrer">Xin Lan, NOAA/GML, and Ralph Keeling, Scripps Institution of Oceanography</a> · <a href="https://doi.org/10.1111/j.2153-3490.1976.tb00701.x" target="_blank" rel="noreferrer">Keeling et al. 1976</a>. Snapshot: 9 October 2026.</p>
  </div>;
}
