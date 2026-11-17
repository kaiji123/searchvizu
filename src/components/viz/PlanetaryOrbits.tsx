"use client";

import { useEffect, useState } from "react";
import "./research-samples.css";

type Planet = { name: string; period: number; distance: number; radius: number };
const colours = ["#f4b696", "#f0c6a0", "#dfb7ac", "#a7d8cd", "#aed3ed", "#c0b2e2", "#e5bfd6"];

export default function PlanetaryOrbits() {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState(3);
  const [day, setDay] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch("/data/trappist-1.csv").then((response) => {
      if (!response.ok) throw new Error("Dataset unavailable");
      return response.text();
    }).then((csv) => {
      const rows = csv.trim().split(/\r?\n/).slice(1).map((line) => {
        const [name, period, distance, radius] = line.split(",");
        return { name: name.replaceAll('"', ""), period: Number(period), distance: Number(distance), radius: Number(radius) };
      });
      if (rows.length !== 7 || rows.some((p) => !p.period || !p.distance || !p.radius)) throw new Error("Invalid dataset");
      setPlanets(rows);
    }).catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setDay((value) => Math.min(60, value + 0.05)), 50);
    return () => window.clearInterval(timer);
  }, [playing]);
  const active = planets[selected];
  const orbit = (distance: number) => 42 + 174 * Math.sqrt((distance - planets[0].distance) / (planets[6].distance - planets[0].distance));

  return <div className="research-viz orbit-viz">
    <div className="research-header"><span>FIELD NOTES / 01</span><span>NASA EXOPLANET ARCHIVE ↗</span></div>
    <div className="research-intro"><div><p className="research-eyebrow">A SYSTEM IN MOTION</p><h2>Seven worlds.<br /><em>One small star.</em></h2></div><p>Travel to TRAPPIST-1 and watch seven planets move to their own remarkable rhythms.</p></div>
    {error ? <p role="alert">The planetary dataset could not be loaded. Please try refreshing.</p> : planets.length === 0 ? <p role="status">Loading planetary data…</p> : <>
      <div className="orbit-layout">
        <div className="orbit-art"><svg viewBox="0 0 500 500" role="img" aria-label="Schematic orbital positions for the seven TRAPPIST-1 planets. The alignment is illustrative.">
          <defs><radialGradient id="star-glow"><stop stopColor="#ffbd8b" stopOpacity=".55"/><stop offset="1" stopColor="#ff8962" stopOpacity="0"/></radialGradient></defs>
          {Array.from({ length: 52 }, (_, i) => <circle key={i} cx={(i * 139 + 17) % 500} cy={(i * 223 + 31) % 500} r={i % 9 === 0 ? 1.2 : 0.6} fill="#dce6ff" opacity={0.2 + (i % 4) * 0.1} />)}
          {planets.map((p, i) => <circle key={p.name} cx="250" cy="250" r={orbit(p.distance)} fill="none" stroke={i === selected ? "#9fb8c6" : "#617181"} strokeOpacity={i === selected ? .7 : .24} strokeWidth={i === selected ? 1.4 : .8} />)}
          <circle cx="250" cy="250" r="40" fill="url(#star-glow)" /><circle cx="250" cy="250" r="11" fill="#ffd5ae" /><circle cx="250" cy="250" r="7" fill="#fff2d8" />
          {planets.map((p, i) => { const angle = day / p.period * Math.PI * 2 - Math.PI / 2; const r = orbit(p.distance); const x = 250 + Math.cos(angle) * r; const y = 250 + Math.sin(angle) * r; return <g key={p.name}><circle cx={x} cy={y} r={i === selected ? 12 : 8} fill={colours[i]} opacity=".15"/><circle cx={x} cy={y} r={i === selected ? 5.5 : 4} fill={colours[i]}/></g>; })}
        </svg><div className="orbit-caption"><span>SCHEMATIC / NOT TO SCALE</span><span>DAY {day.toFixed(1)}</span></div></div>
        <div className="orbit-details"><p className="research-eyebrow">SELECT A WORLD</p><div className="planet-buttons">{planets.map((p, i) => <button type="button" key={p.name} onClick={() => setSelected(i)} aria-pressed={selected === i} style={{ "--planet": colours[i] } as React.CSSProperties}>{p.name.slice(-1)}</button>)}</div><div className="planet-name"><span style={{ background: colours[selected] }} /> <h3>{active.name}</h3></div><p className="orbit-description">A distant world orbiting an ultracool dwarf star.</p><div className="planet-stat"><span>ONE ORBIT</span><strong>{active.period.toFixed(2)} <small>Earth days</small></strong></div><div className="planet-stat"><span>ORBITAL SEMI-MAJOR AXIS</span><strong>{active.distance.toFixed(4)} <small>AU</small></strong></div><div className="planet-stat"><span>PLANET RADIUS</span><strong>{active.radius.toFixed(2)} <small>× Earth</small></strong></div></div>
      </div>
      <div className="orbit-controls"><button type="button" className="research-action" onClick={() => { if (day >= 60) setDay(0); setPlaying(!playing || day >= 60); }}>{playing && day < 60 ? "❚❚ Pause" : "▶ Play"}</button><label htmlFor="orbit-day">Elapsed days <strong>{day.toFixed(1)}</strong></label><input id="orbit-day" type="range" min="0" max="60" step="0.1" value={day} onChange={(event) => { setPlaying(false); setDay(Number(event.target.value)); }} /><span>60 days</span></div>
      <p className="research-note">Circular paths and starting alignment are illustrative, not actual positions. Orbit spacing is compressed; planet sizes and colours are artistic. Animation starts paused.</p>
    </>}
    <p className="research-source">Data: <a href="https://exoplanetarchive.ipac.caltech.edu/overview/TRAPPIST-1" target="_blank" rel="noreferrer">NASA Exoplanet Archive</a> · <a href="https://doi.org/10.3847/PSJ/abd022" target="_blank" rel="noreferrer">Agol et al. 2021</a>. NASA Exoplanet Archive operated by Caltech under contract with NASA.</p>
  </div>;
}
