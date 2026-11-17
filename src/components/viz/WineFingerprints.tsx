"use client";

import { useEffect, useMemo, useState } from "react";
import "./research-samples.css";

type Sample = { id: number; group: number; values: number[] };
const features = ["Alcohol", "Malic acid", "Ash", "Ash alkalinity", "Magnesium", "Total phenols", "Flavanoids", "Nonflavanoid phenols", "Proanthocyanins", "Colour intensity", "Hue", "OD280/OD315", "Proline"];
const shortNames = ["Alcohol", "Malic acid", "Ash", "Ash alkalinity", "Magnesium", "Total phenols", "Flavanoids", "Nonflav. phenols", "Proanthocyanins", "Colour intensity", "Hue", "OD280/OD315", "Proline"];
const colours = ["#e59a8e", "#dfc58d", "#8fcac2"];
const angle = (index: number) => index * Math.PI * 2 / features.length - Math.PI / 2;
const point = (index: number, radius: number): [number, number] => [350 + Math.cos(angle(index)) * radius, 300 + Math.sin(angle(index)) * radius];

export default function WineFingerprints() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState([true, true, true]);
  const [sampleId, setSampleId] = useState("");
  useEffect(() => {
    fetch("/data/uci-wine.data").then((response) => { if (!response.ok) throw new Error("Dataset unavailable"); return response.text(); }).then((data) => {
      const rows = data.trim().split(/\r?\n/).map((line, id) => { const [group, ...values] = line.split(",").map(Number); return { id: id + 1, group, values }; });
      if (rows.length !== 178 || rows.some((row) => ![1, 2, 3].includes(row.group) || row.values.length !== 13 || row.values.some((value) => !Number.isFinite(value)))) throw new Error("Invalid dataset");
      setSamples(rows);
    }).catch(() => setError(true));
  }, []);
  const analysis = useMemo(() => {
    if (!samples.length) return null;
    const min = features.map((_, index) => Math.min(...samples.map((row) => row.values[index])));
    const max = features.map((_, index) => Math.max(...samples.map((row) => row.values[index])));
    const groups = [1, 2, 3].map((group) => { const rows = samples.filter((row) => row.group === group); return { count: rows.length, values: features.map((_, index) => rows.reduce((sum, row) => sum + row.values[index], 0) / rows.length) }; });
    return { min, max, groups };
  }, [samples]);
  const sample = samples.find((row) => row.id === Number(sampleId));
  const polygon = (values: number[]) => values.map((value, i) => point(i, 190 * ((value - analysis!.min[i]) / (analysis!.max[i] - analysis!.min[i]))).map((coordinate) => coordinate.toFixed(1)).join(",")).join(" ");
  return <div className="research-viz wine-viz">
    <div className="research-header"><span>FIELD NOTES / 06</span><span>UCI MACHINE LEARNING REPOSITORY ↗</span></div>
    <div className="research-intro"><div><p className="research-eyebrow">THIRTEEN CHEMICAL MEASUREMENTS</p><h2>A fingerprint<br /><em>in the data.</em></h2></div><p>Three cultivars, 178 samples and thirteen ways to discover how their chemical profiles differ.</p></div>
    {error ? <p role="alert">The wine dataset could not be loaded. Please try refreshing.</p> : !analysis ? <p role="status">Loading chemical measurements…</p> : <>
      <div className="wine-toolbar"><div className="wine-groups">{analysis.groups.map((group, i) => <button type="button" key={i} aria-pressed={visible[i]} onClick={() => setVisible((state) => state.map((v, j) => i === j ? !v : v))}><span style={{ background: colours[i] }}/><strong>Class {i + 1}</strong><small>n={group.count}</small></button>)}</div><label htmlFor="wine-sample">COMPARE AN INDIVIDUAL SAMPLE<select id="wine-sample" value={sampleId} onChange={(event) => setSampleId(event.target.value)}><option value="">Class averages only</option>{samples.map((row) => <option key={row.id} value={row.id}>Sample {row.id} · class {row.group}</option>)}</select></label></div>
      <div className="wine-chart"><svg viewBox="0 0 700 600" role="img" aria-label="Thirteen measurements shown on separate normalised radial axes. The table below contains the original values and class averages.">
        {[.25, .5, .75, 1].map((fraction) => <circle key={fraction} cx="350" cy="300" r={190 * fraction} fill="none" stroke="#ffffff" strokeOpacity=".14"/>)}
        {features.map((feature, i) => { const [x, y] = point(i, 190), [labelX, labelY] = point(i, 218); const anchor = labelX < 335 ? "end" : labelX > 365 ? "start" : "middle"; return <g key={feature}><line x1="350" y1="300" x2={x} y2={y} stroke="#ffffff" strokeOpacity=".16"/><text x={labelX} y={labelY} textAnchor={anchor} dominantBaseline="middle" className="wine-axis">{shortNames[i]}</text></g>; })}
        {analysis.groups.map((group, i) => visible[i] && <polygon key={i} points={polygon(group.values)} fill={colours[i]} fillOpacity=".09" stroke={colours[i]} strokeWidth="2" strokeLinejoin="round"/>)}
        {sample && <polygon points={polygon(sample.values)} fill="#ffffff" fillOpacity=".04" stroke="#fffdf4" strokeWidth="2.3" strokeDasharray="5 4" strokeLinejoin="round"/>}
        <circle cx="350" cy="300" r="3" fill="#f2e7d9"/><text x="350" y="573" textAnchor="middle" className="wine-axis">CENTRE = DATASET MINIMUM · OUTER RING = DATASET MAXIMUM</text>
      </svg></div>
      <div className="wine-explanation"><span><i/> Dashed white line: {sample ? `sample ${sample.id} (class ${sample.group})` : "choose a sample to compare"}</span><p>Each spoke has its own scale. A larger shape does not mean a better wine.</p></div>
      <details className="wine-table"><summary>View unscaled values and class means</summary><div><table><thead><tr><th>Measurement</th><th>Class 1 mean</th><th>Class 2 mean</th><th>Class 3 mean</th>{sample && <th>Sample {sample.id}</th>}</tr></thead><tbody>{features.map((feature, i) => <tr key={feature}><th scope="row">{feature}</th>{analysis.groups.map((group, j) => <td key={j}>{group.values[i].toFixed(2)}</td>)}{sample && <td>{sample.values[i]}</td>}</tr>)}</tbody></table></div></details>
      <p className="research-note">Every spoke is independently min–max scaled across all 178 samples. The shape depends on the order of measurements. Class means hide variation and are not measures of taste, quality or cause.</p>
    </>}
    <p className="research-source">Data: <a href="https://doi.org/10.24432/C5PC7J" target="_blank" rel="noreferrer">Aeberhard &amp; Forina, UCI Wine dataset</a> · adapted for display, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · <a href="https://doi.org/10.1016/0031-3203(94)90145-7" target="_blank" rel="noreferrer">Aeberhard et al. 1994</a>.</p>
  </div>;
}
