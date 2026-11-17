import Link from "next/link";
import type { Visualisation } from "@/content/visualisations";

const ACCENT: Record<string, string> = {
  "sir-model": "var(--viz-2)",
  "causal-dag": "var(--viz-1)",
  "loss-surface": "var(--viz-3)",
};

export function VizCard({ viz }: { viz: Visualisation }) {
  return (
    <Link
      href={`/viz/${viz.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {viz.component === "wine-fingerprints" && <div className="research-cover wine-fingerprints" aria-hidden="true"><span>CHEMISTRY / 06</span><svg viewBox="0 0 300 140">{[20, 35, 50].map((r) => <circle key={r} cx="150" cy="70" r={r} fill="none" stroke="#d3bac0" opacity=".18"/>)}{["#e59a8e", "#dfc58d", "#8fcac2"].map((color, i) => <polygon key={color} points={Array.from({length: 13}, (_, n) => {const a=n*Math.PI*2/13-Math.PI/2;const r=18+((n*19+i*17)%32);return `${150+Math.cos(a)*r},${70+Math.sin(a)*r}`}).join(" ")} fill={color} fillOpacity=".09" stroke={color} strokeWidth="1.5"/>)}</svg><span>EXPLORE THE DATA ↗</span></div>}
      {(viz.component === "planetary-orbits" || viz.component === "carbon-spiral" || viz.component === "seismic-year" || viz.component === "life-lines" || viz.component === "hemoglobin-3d") && (
        <div className={`research-cover ${viz.component}`} aria-hidden="true">
          <span>{viz.component === "planetary-orbits" ? "ASTRONOMY / 01" : viz.component === "seismic-year" ? "EARTH SCIENCE / 03" : viz.component === "life-lines" ? "DEMOGRAPHY / 04" : viz.component === "hemoglobin-3d" ? "BIOLOGY / 05" : "CLIMATE / 02"}</span>
          {viz.component === "planetary-orbits" ? <svg viewBox="0 0 300 140">
            {[22, 36, 50, 64, 78, 92, 106].map((r, i) => <g key={r}><circle cx="150" cy="70" r={r} fill="none" stroke="#a8c5d4" opacity=".22"/><circle cx={150 + r * Math.cos(i * 1.4)} cy={70 + r * Math.sin(i * 1.4)} r="3.5" fill={["#f4b696", "#f0c6a0", "#dfb7ac", "#a7d8cd", "#aed3ed", "#c0b2e2", "#e5bfd6"][i]}/></g>)}<circle cx="150" cy="70" r="7" fill="#ffcfab"/>
          </svg> : viz.component === "seismic-year" ? <svg viewBox="0 0 300 140">{[45, 72, 99].map(y => <line key={y} x1="35" x2="265" y1={y} y2={y} stroke="#9ab5a6" opacity=".2"/>)}{Array.from({ length: 50 }, (_, i) => <circle key={i} cx={37 + (i * 83) % 225} cy={40 + (i * 47) % 65} r={i % 11 === 0 ? 4 : 2} fill={i % 3 === 0 ? "#9faad3" : i % 3 === 1 ? "#e4a882" : "#9bc9bb"} opacity=".85" />)}</svg> : viz.component === "life-lines" ? <svg viewBox="0 0 300 140">{Array.from({length: 15}, (_,i) => <path key={i} d={`M 20 ${125-i*4} C 90 ${105-i*3}, 130 ${92-i*3}, 280 ${44+i}`} fill="none" stroke={i === 5 ? "#f2c4a2" : i === 9 ? "#a7ded4" : "#a4c6b9"} strokeWidth={i === 5 || i === 9 ? 2 : 1} opacity={i === 5 || i === 9 ? .9 : .2}/>)}</svg> : viz.component === "hemoglobin-3d" ? <svg viewBox="0 0 300 140">{["#f3a296", "#e6c08f", "#90c6bd", "#aab5e6"].map((color, i) => <path key={color} d={`M ${100+i*20} 20 C ${155+i*8} 5, ${90+i*23} 55, ${150+i*7} 55 S ${180-i*10} 100, ${110+i*19} 123`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" opacity=".85"/>)}</svg> : <svg viewBox="0 0 300 140">{Array.from({ length: 32 }, (_, i) => <circle key={i} cx="150" cy="70" r={12 + i * 2.9} fill="none" stroke={i < 11 ? "#68b1aa" : i < 22 ? "#e8b878" : "#e87863"} strokeWidth="2" strokeDasharray="8 3" opacity=".8"/>)}</svg>}
          <span>EXPLORE THE DATA ↗</span>
        </div>
      )}
      {(viz.component === "iris-data" || viz.component === "penguin-data") && (
        <div className="sample-cover" aria-hidden="true">
          <span className="sample-cover-label">{viz.component === "iris-data" ? "BOTANY / 01" : "ECOLOGY / 02"}</span>
          <svg viewBox="0 0 300 110" preserveAspectRatio="xMidYMid meet">
            {Array.from({ length: 36 }, (_, i) => {
              const group = Math.floor(i / 12);
              const cx = 40 + group * 85 + ((i * 37) % 57);
              const cy = 76 - group * 15 + ((i * 23) % 35) - 17;
              return <circle key={i} cx={cx} cy={cy} r={3 + (i % 3)} fill={["#f6be75", "#f18494", "#8fcbb9"][group]} opacity="0.8" />;
            })}
          </svg>
          <span className="sample-cover-caption">A FIELD STUDY IN DATA ↗</span>
        </div>
      )}
      <div className="h-1.5" style={{ background: ACCENT[viz.component] ?? "var(--accent)" }} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="rounded-full border border-line px-2 py-0.5 font-medium uppercase tracking-wide">{viz.kind}</span>
          {viz.discipline}
        </div>
        <h3 className="text-lg font-semibold leading-snug group-hover:underline group-hover:underline-offset-4">{viz.title}</h3>
        <p className="text-sm text-muted">{viz.summary}</p>
        <span className="mt-auto pt-2 text-sm font-medium text-accent">Explore →</span>
      </div>
    </Link>
  );
}
