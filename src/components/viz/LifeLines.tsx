"use client";

import { useEffect, useMemo, useState } from "react";
import "./research-samples.css";

type Series = { id: string; name: string; region: string; values: (number | null)[] };
type Dataset = { lastUpdated: string; startYear: number; series: Series[] };
const first = 1960, last = 2024;
const px = (year: number) => 55 + (year - first) / (last - first) * 690;
const py = (years: number) => 275 - years / 90 * 250;
function trajectory(values: (number | null)[]) {
  let drawing = false;
  return values.map((value, i) => {
    if (value === null) { drawing = false; return ""; }
    const command = drawing ? "L" : "M";
    drawing = true;
    return `${command}${px(first + i).toFixed(1)},${py(value).toFixed(1)}`;
  }).join(" ");
}

export default function LifeLines() {
  const [data, setData] = useState<Dataset | null>(null);
  const [error, setError] = useState(false);
  const [countryA, setCountryA] = useState("GBR");
  const [countryB, setCountryB] = useState("JPN");
  const [region, setRegion] = useState("All regions");
  const [year, setYear] = useState(2024);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    fetch("/data/worldbank-life-expectancy-compact.json").then((response) => { if (!response.ok) throw new Error("Dataset unavailable"); return response.json(); }).then((result: Dataset) => {
      if (result.startYear !== first || !Array.isArray(result.series) || !result.series.length) throw new Error("Invalid dataset");
      setData(result);
    }).catch(() => setError(true));
  }, []);
  useEffect(() => {
    if (!playing || year >= last) return;
    const timer = window.setTimeout(() => setYear(year + 1), 260);
    return () => window.clearTimeout(timer);
  }, [playing, year]);
  const series = data?.series;
  const paths = useMemo(() => (series ?? []).map((item) => ({ ...item, path: trajectory(item.values) })), [series]);
  const regions = useMemo(() => [...new Set((series ?? []).map((item) => item.region))].sort(), [series]);
  const a = paths.find((item) => item.id === countryA);
  const b = paths.find((item) => item.id === countryB);
  const comparison = [a, b];
  return <div className="research-viz life-viz">
    <div className="research-header"><span>FIELD NOTES / 04</span><span>WORLD DEVELOPMENT INDICATORS ↗</span></div>
    <div className="research-intro"><div><p className="research-eyebrow">A WORLD OF DIFFERENT PATHS</p><h2>Lives in<br /><em>the data.</em></h2></div><p>Explore how life expectancy at birth has changed across countries and economies since 1960.</p></div>
    {error ? <p role="alert">The life expectancy dataset could not be loaded. Please try refreshing.</p> : !data ? <p role="status">Loading life expectancy data…</p> : <>
      <div className="life-controls"><label htmlFor="life-a"><span className="life-dot life-dot-a"/> FIRST ECONOMY<select id="life-a" value={countryA} onChange={(event) => setCountryA(event.target.value)}>{data.series.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label htmlFor="life-b"><span className="life-dot life-dot-b"/> SECOND ECONOMY<select id="life-b" value={countryB} onChange={(event) => setCountryB(event.target.value)}>{data.series.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label htmlFor="life-region">BACKGROUND LINES<select id="life-region" value={region} onChange={(event) => setRegion(event.target.value)}><option>All regions</option>{regions.map((name) => <option key={name}>{name}</option>)}</select></label></div>
      <div className="life-chart"><svg viewBox="0 0 780 320" role="img" aria-label={`Life expectancy at birth from 1960 to 2024. ${a?.name} and ${b?.name} are highlighted. Use the year slider to inspect values.`}>
        {[0, 20, 40, 60, 80].map((tick) => <g key={tick}><line x1="55" x2="745" y1={py(tick)} y2={py(tick)} stroke="#ffffff" strokeOpacity=".13"/><text x="45" y={py(tick) + 4} textAnchor="end" className="life-axis">{tick}</text></g>)}
        {[1960, 1980, 2000, 2024].map((tick) => <text key={tick} x={px(tick)} y="302" textAnchor="middle" className="life-axis">{tick}</text>)}
        <text x="55" y="13" className="life-axis">LIFE EXPECTANCY AT BIRTH / YEARS</text>
        {paths.filter((item) => item.id !== countryA && item.id !== countryB && (region === "All regions" || item.region === region)).map((item) => <path key={item.id} d={item.path} fill="none" stroke="#97b6b1" strokeOpacity=".13" strokeWidth="1" />)}
        {comparison.map((item, index) => item && <path key={`${item.id}-${index}`} d={item.path} fill="none" stroke={index === 0 ? "#f2c4a2" : "#a7ded4"} strokeWidth="2.7" strokeDasharray={index === 1 ? "5 2" : undefined} />)}
        <line x1={px(year)} x2={px(year)} y1="25" y2="275" stroke="#f8f4e8" strokeOpacity=".65" strokeDasharray="3 5"/>
        {comparison.map((item, index) => { const value = item?.values[year - first]; return value == null ? null : <circle key={index} cx={px(year)} cy={py(value)} r="5" fill={index === 0 ? "#f2c4a2" : "#a7ded4"} stroke="#18292a" strokeWidth="2"/>; })}
      </svg></div>
      <div className="life-time"><button type="button" className="research-action" onClick={() => { if (year >= last) setYear(first); setPlaying(!playing || year >= last); }}>{playing && year < last ? "❚❚ Pause" : "▶ Play"}</button><label htmlFor="life-year">YEAR <strong>{year}</strong></label><input id="life-year" type="range" min={first} max={last} value={year} onChange={(event) => { setPlaying(false); setYear(Number(event.target.value)); }} /><span>{last}</span></div>
      <div className="life-readings">{comparison.map((item, i) => { const value = item?.values[year - first]; return <div key={i}><p><span className={`life-dot life-dot-${i === 0 ? "a" : "b"}`}/>{item?.name}</p><strong>{value == null ? "—" : value.toFixed(1)} <small>{value == null ? "no data" : "years"}</small></strong><span>at birth · {year}</span></div>; })}</div>
      <p className="research-note">Period life expectancy is a hypothetical measure using the mortality rates of that year; it is not a prediction of an individual’s lifespan. Estimates and coverage vary. No uncertainty intervals are shown.</p>
    </>}
    <p className="research-source">Data: <a href="https://data.worldbank.org/indicator/SP.DYN.LE00.IN" target="_blank" rel="noreferrer">World Bank World Development Indicators</a>, drawing on UN Population Division and other sources. Adapted for display; <a href="https://datacatalog.worldbank.org/public-licenses" target="_blank" rel="noreferrer">CC BY 4.0 and World Bank terms</a>. <a href="https://doi.org/10.1159/000500955" target="_blank" rel="noreferrer">Luy et al. 2020</a>. Snapshot: 16 November 2026.</p>
  </div>;
}
