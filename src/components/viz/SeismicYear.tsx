"use client";

import { useEffect, useMemo, useState } from "react";
import { PlaybackButton, useRangePlayback } from "./playback";
import "./research-samples.css";

type Event = { id: string; magnitude: number; place: string; time: number; depth: number; url: string; magnitudeType: string };
type Feature = { id: string; properties: { mag: number; place: string | null; time: number; url: string; magType: string }; geometry: { coordinates: number[] } };
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const beginning = Date.UTC(2025, 0, 1);
const ending = Date.UTC(2026, 0, 1);
const depthColour = (depth: number) => depth < 70 ? "#e4a882" : depth < 300 ? "#9bc9bb" : "#9faad3";
const dateLabel = (time: number) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(time);

export default function SeismicYear() {
  const [events, setEvents] = useState<Event[]>([]);
  const [month, setMonth] = useState(-1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const playback = useRangePlayback(month, (next) => { setMonth(next); setSelectedId(null); }, {
    min: 0, max: 11, step: 1, delay: 750, ready: events.length > 0,
  });
  useEffect(() => {
    fetch("/data/usgs-earthquakes-2025-m6.geojson").then((response) => { if (!response.ok) throw new Error("Dataset unavailable"); return response.json(); }).then((data: { features: Feature[] }) => {
      const entries = data.features.map((f) => ({ id: f.id, magnitude: f.properties.mag, place: f.properties.place ?? "Location unavailable", time: f.properties.time, depth: f.geometry.coordinates[2], url: f.properties.url, magnitudeType: f.properties.magType })).filter((e) => Number.isFinite(e.magnitude) && Number.isFinite(e.depth) && e.time >= beginning && e.time < ending);
      if (!entries.length) throw new Error("Invalid dataset");
      setEvents(entries);
    }).catch(() => setError(true));
  }, []);
  const visible = useMemo(() => events.filter((e) => month === -1 || new Date(e.time).getUTCMonth() === month), [events, month]);
  const selected = visible.find((event) => event.id === selectedId) ?? visible.reduce<Event | undefined>((largest, event) => !largest || event.magnitude > largest.magnitude ? event : largest, undefined);
  const x = (time: number) => 60 + (time - beginning) / (ending - beginning) * 700;
  const y = (depth: number) => 38 + depth / 600 * 255;
  return <div className="research-viz seismic-viz">
    <div className="research-header"><span>FIELD NOTES / 03</span><span>USGS EARTHQUAKE CATALOG ↗</span></div>
    <div className="research-intro"><div><p className="research-eyebrow">A YEAR OF EARTHQUAKES</p><h2>The world<br /><em>in motion.</em></h2></div><p>One year of magnitude 6+ earthquakes. Each mark is a moment recorded somewhere on Earth.</p></div>
    {error ? <p role="alert">The earthquake dataset could not be loaded. Please try refreshing.</p> : !events.length ? <p role="status">Loading earthquake data…</p> : <>
      <PlaybackButton {...playback} description="earthquake months" className="research-action mt-4" />
      <div className="seismic-toolbar"><div><strong>{visible.length}</strong><span> {month === -1 ? "EVENTS IN 2025" : `EVENTS IN ${monthNames[month].toUpperCase()}`}</span></div><label htmlFor="seismic-month">FILTER BY MONTH <select id="seismic-month" value={month} onChange={(event) => playback.select(Number(event.target.value))}><option value={-1}>All of 2025</option>{monthNames.map((name, i) => <option value={i} key={name}>{name}</option>)}</select></label></div>
      <div className="seismic-chart"><svg viewBox="0 0 790 340" role="img" aria-label="Earthquakes in 2025 plotted by time and reported depth. Use the event selector below for accessible details.">
        {[0, 100, 300, 500, 600].map((depth) => <g key={depth}><line x1="60" y1={y(depth)} x2="760" y2={y(depth)} stroke="#ffffff" strokeOpacity=".12"/><text x="48" y={y(depth) + 3} textAnchor="end" className="seismic-axis">{depth}</text></g>)}
        {monthNames.map((name, i) => { const mx = x(Date.UTC(2025, i, 1)); return <g key={name}><line x1={mx} x2={mx} y1="38" y2="293" stroke="#ffffff" strokeOpacity=".06"/><text x={mx} y="316" className="seismic-axis">{name.toUpperCase()}</text></g>; })}
        {events.map((event) => { const isVisible = month === -1 || new Date(event.time).getUTCMonth() === month; const isSelected = selected?.id === event.id; return <g key={event.id} opacity={isVisible ? 1 : .08}><circle cx={x(event.time)} cy={y(event.depth)} r={Math.max(3.2, (event.magnitude - 5.5) * 4)} fill={depthColour(event.depth)} fillOpacity={isSelected ? .95 : .58} stroke={isSelected ? "#fff7e9" : depthColour(event.depth)} strokeWidth={isSelected ? 2 : .7} onClick={() => { if (isVisible) setSelectedId(event.id); }} style={{ cursor: isVisible ? "pointer" : "default" }}><title>{`M ${event.magnitude.toFixed(1)} · ${event.place} · ${dateLabel(event.time)} · ${event.depth.toFixed(1)} km deep`}</title></circle></g>; })}
        <text x="60" y="20" className="seismic-axis">REPORTED DEPTH / KM ↓</text>
      </svg></div>
      <div className="seismic-legend"><span><i style={{ background: "#e4a882" }}/> &lt;70 km</span><span><i style={{ background: "#9bc9bb" }}/> 70–299 km</span><span><i style={{ background: "#9faad3" }}/> 300 km+</span><span>Circle size indicates magnitude</span></div>
      <div className="seismic-event"><div className="seismic-event-heading"><div><p className="research-eyebrow">EXPLORE AN EVENT</p><h3>{selected ? selected.place : "No events in this month"}</h3></div>{selected && <span className="seismic-magnitude">M {selected.magnitude.toFixed(1)}</span>}</div>{selected && <><div className="seismic-facts"><span><small>DATE · UTC</small>{dateLabel(selected.time)}</span><span><small>DEPTH</small>{selected.depth.toFixed(1)} km</span><span><small>MAGNITUDE TYPE</small>{selected.magnitudeType?.toUpperCase() || "—"}</span><a href={selected.url} target="_blank" rel="noreferrer">USGS event record ↗</a></div><label className="seismic-select" htmlFor="seismic-event">Choose an event<select id="seismic-event" value={selected.id} onChange={(event) => setSelectedId(event.target.value)}>{visible.map((event) => <option value={event.id} key={event.id}>{dateLabel(event.time)} · M {event.magnitude.toFixed(1)} · {event.place}</option>)}</select></label></>}</div>
      <p className="research-note">This is a timeline of reported depths, not a map or geographic cross-section. Catalog estimates may change. Aftershocks are included; circle size does not represent damage or energy released.</p>
    </>}
    <p className="research-source">Data: <a href="https://earthquake.usgs.gov/data/comcat/" target="_blank" rel="noreferrer">USGS ANSS Comprehensive Earthquake Catalog and contributing networks</a> · <a href="https://doi.org/10.3133/ofr20151120" target="_blank" rel="noreferrer">Guy et al. 2015</a>. Snapshot: 16 November 2026.</p>
  </div>;
}
