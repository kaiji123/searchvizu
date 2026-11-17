"use client";

import { useEffect, useState } from "react";

type Row = { group: string; values: number[] };
type Config = {
  title: string; subtitle: string; file: string; fields: string[]; units: string[];
  groups: string[]; colors: string[]; source: string; sourceLabel: string; paper: string; license: string;
};

const configs: Record<"iris" | "penguins", Config> = {
  iris: {
    title: "A closer look at irises", subtitle: "150 flowers · 3 species · 4 measurements", file: "/data/iris.csv",
    fields: ["Sepal length", "Sepal width", "Petal length", "Petal width"], units: ["cm", "cm", "cm", "cm"],
    groups: ["setosa", "versicolor", "virginica"], colors: ["#f6be75", "#f18494", "#8fcbb9"],
    source: "https://doi.org/10.24432/C56C76", sourceLabel: "Fisher / UCI Iris dataset", paper: "https://doi.org/10.1111/j.1469-1809.1936.tb02137.x", license: "CC BY 4.0",
  },
  penguins: {
    title: "A penguin’s proportions", subtitle: "Palmer Archipelago · 3 species · 2007–2009", file: "/data/penguins.csv",
    fields: ["Bill length", "Bill depth", "Flipper length", "Body mass"], units: ["mm", "mm", "mm", "g"],
    groups: ["Adelie", "Chinstrap", "Gentoo"], colors: ["#f6be75", "#f18494", "#8fcbb9"],
    source: "https://allisonhorst.github.io/palmerpenguins/", sourceLabel: "Palmer Station LTER / palmerpenguins", paper: "https://doi.org/10.1371/journal.pone.0090081", license: "CC0",
  },
};

export default function FieldNotes({ dataset }: { dataset: "iris" | "penguins" }) {
  const c = configs[dataset];
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState(false);
  const [x, setX] = useState(dataset === "iris" ? 2 : 0);
  const [y, setY] = useState(dataset === "iris" ? 3 : 2);
  const [selected, setSelected] = useState("All");
  useEffect(() => {
    const controller = new AbortController();
    fetch(c.file, { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error("Data unavailable");
      return response.text();
    }).then((text) => {
      const lines = text.trim().split(/\r?\n/);
      const parsed = (dataset === "penguins" ? lines.slice(1) : lines).map((line) => {
        const cells = line.split(",");
        return dataset === "iris"
          ? { group: cells[4]?.replace("Iris-", ""), values: cells.slice(0, 4).map(Number) }
          : { group: cells[0], values: cells.slice(2, 6).map((value) => value === "NA" || value === "" ? NaN : Number(value)) };
      });
      setRows(parsed);
    }).catch((reason) => { if (reason.name !== "AbortError") setError(true); });
    return () => controller.abort();
  }, [c.file, dataset]);
  const usable = rows.filter((r) => Number.isFinite(r.values[x]) && Number.isFinite(r.values[y]));
  const visible = usable.filter((r) => selected === "All" || r.group === selected);
  const bounds = (axis: number) => {
    const values = usable.map((r) => r.values[axis]);
    const min = Math.min(...values), max = Math.max(...values);
    const pad = (max - min || 1) * 0.08;
    return [min - pad, max + pad];
  };
  const [xmin, xmax] = bounds(x), [ymin, ymax] = bounds(y);
  const format = (n: number) => Math.abs(n) >= 100 ? n.toFixed(0) : n.toFixed(1);
  return (
    <div className="field-notes">
      <div className="field-heading"><div><span className="field-kicker">FIELD NOTES / {dataset === "iris" ? "01" : "02"}</span><h2>{c.title}</h2><p>{c.subtitle}</p></div><span className="field-badge">EXPLORE THE DATA ↗</span></div>
      <div className="field-body">
        <div className="field-chart">
          {error ? <p role="alert">The dataset could not be loaded. Please try again later.</p> : !rows.length ? <p role="status">Loading observations…</p> : <svg viewBox="0 0 680 420" role="img" aria-label={`${c.fields[y]} against ${c.fields[x]}; ${visible.length} observations shown. Use the controls to change the comparison or filter species.`}>
            {[0, 1, 2, 3, 4].map((i) => { const xx = 75 + i * 140, yy = 335 - i * 72; return <g key={i}><line x1={xx} y1="47" x2={xx} y2="335" stroke="#35404a"/><line x1="75" y1={yy} x2="635" y2={yy} stroke="#35404a"/><text x={xx} y="357" textAnchor="middle" fill="#aab5bd" fontSize="11">{format(xmin + (xmax-xmin)*i/4)}</text><text x="63" y={yy+4} textAnchor="end" fill="#aab5bd" fontSize="11">{format(ymin + (ymax-ymin)*i/4)}</text></g>; })}
            {visible.map((r, i) => <circle key={`${r.group}-${i}`} cx={75+(r.values[x]-xmin)/(xmax-xmin)*560} cy={335-(r.values[y]-ymin)/(ymax-ymin)*288} r="5" fill={c.colors[c.groups.indexOf(r.group)] || "#fff"} fillOpacity="0.75" stroke="#17232b" strokeWidth="1"><title>{r.group}: {c.fields[x]} {r.values[x]} {c.units[x]}, {c.fields[y]} {r.values[y]} {c.units[y]}</title></circle>)}
            <text x="355" y="397" textAnchor="middle" fill="#dbe3e3" fontSize="12">{c.fields[x]} ({c.units[x]})</text><text transform="translate(16 192) rotate(-90)" textAnchor="middle" fill="#dbe3e3" fontSize="12">{c.fields[y]} ({c.units[y]})</text>
          </svg>}
          <p className="field-count">{visible.length} observations shown {rows.length > 0 && `· ${rows.length - usable.length} missing a selected measurement`}</p>
        </div>
        <div className="field-controls"><p className="field-control-title">MAKE A COMPARISON</p><label>Horizontal axis<select value={x} onChange={(e) => setX(Number(e.target.value))}>{c.fields.map((f, i) => <option key={f} value={i}>{f}</option>)}</select></label><label>Vertical axis<select value={y} onChange={(e) => setY(Number(e.target.value))}>{c.fields.map((f, i) => <option key={f} value={i}>{f}</option>)}</select></label><div><p className="field-control-title">FILTER BY SPECIES</p><div className="field-filters">{["All", ...c.groups].map((group, i) => <button key={group} type="button" aria-pressed={selected === group} onClick={() => setSelected(group)}><span style={{ background: i ? c.colors[i-1] : "#e5ecea" }}/>{group}</button>)}</div></div><p className="field-hint">Each dot is one individual. Change the axes to find patterns and overlaps.</p></div>
      </div>
      <div className="field-source">Data: <a href={c.source} target="_blank" rel="noreferrer">{c.sourceLabel}</a> · {c.license} · <a href={c.paper} target="_blank" rel="noreferrer">Research paper ↗</a></div>
    </div>
  );
}
