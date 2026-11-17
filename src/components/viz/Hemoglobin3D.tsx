"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import "./research-samples.css";

type ChainId = "A" | "B" | "C" | "D";
type Chain = { id: ChainId; segments: THREE.Vector3[][]; iron: THREE.Vector3 | null };
const chainIds: ChainId[] = ["A", "B", "C", "D"];
const chainColours: Record<ChainId, string> = { A: "#f3a296", B: "#e6c08f", C: "#90c6bd", D: "#aab5e6" };
const chainNames: Record<ChainId, string> = { A: "Alpha 1", B: "Beta 1", C: "Alpha 2", D: "Beta 2" };

function parseStructure(pdb: string): Chain[] {
  const atoms: Record<ChainId, THREE.Vector3[]> = { A: [], B: [], C: [], D: [] };
  const irons: Partial<Record<ChainId, THREE.Vector3>> = {};
  for (const line of pdb.split(/\r?\n/)) {
    const kind = line.slice(0, 6).trim(), name = line.slice(12, 16).trim(), alt = line.slice(16, 17), residue = line.slice(17, 20).trim(), id = line.slice(21, 22) as ChainId;
    if (!chainIds.includes(id) || (alt !== " " && alt !== "A")) continue;
    const xyz = [line.slice(30, 38), line.slice(38, 46), line.slice(46, 54)].map((part) => Number.parseFloat(part));
    if (!xyz.every(Number.isFinite)) continue;
    const point = new THREE.Vector3(...xyz as [number, number, number]);
    if (kind === "ATOM" && name === "CA") atoms[id].push(point);
    if (kind === "HETATM" && residue === "HEM" && name === "FE") irons[id] = point;
  }
  const all = chainIds.flatMap((id) => atoms[id]);
  if (!chainIds.every((id) => atoms[id].length > 10) || !all.length) throw new Error("Invalid structure");
  const centre = all.reduce((sum, point) => sum.add(point), new THREE.Vector3()).multiplyScalar(1 / all.length);
  return chainIds.map((id) => {
    const segments: THREE.Vector3[][] = [];
    for (const point of atoms[id]) {
      const lastSegment = segments.at(-1);
      if (!lastSegment || (lastSegment.at(-1)?.distanceTo(point) ?? 0) > 5) segments.push([point]);
      else lastSegment.push(point);
    }
    return { id, segments: segments.filter((segment) => segment.length > 1).map((segment) => segment.map((point) => point.clone().sub(centre))), iron: irons[id]?.clone().sub(centre) ?? null };
  });
}

function Protein({ chains, shown, rotation }: { chains: Chain[]; shown: Record<ChainId, boolean>; rotation: number }) {
  const tubes = useMemo(() => chains.flatMap((chain) => chain.segments.map((points) => ({ id: chain.id, geometry: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), Math.max(20, points.length * 3), 0.42, 8, false) }))), [chains]);
  useEffect(() => () => tubes.forEach((tube) => tube.geometry.dispose()), [tubes]);
  return <group rotation={[0.35, rotation, 0]}>{tubes.map((tube, index) => shown[tube.id] && <mesh key={`${tube.id}-${index}`} geometry={tube.geometry}><meshStandardMaterial color={chainColours[tube.id]} roughness={0.43} metalness={0.12} /></mesh>)}{chains.map((chain) => shown[chain.id] && chain.iron && <mesh key={chain.id} position={chain.iron}><sphereGeometry args={[1.35, 24, 16]}/><meshStandardMaterial color="#ffd274" emissive="#cc7628" emissiveIntensity={0.35} roughness={0.3}/></mesh>)}</group>;
}

export default function Hemoglobin3D() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [error, setError] = useState(false);
  const [shown, setShown] = useState<Record<ChainId, boolean>>({ A: true, B: true, C: true, D: true });
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  useEffect(() => {
    fetch("/data/1A3N.pdb").then((response) => { if (!response.ok) throw new Error("Structure unavailable"); return response.text(); }).then((pdb) => setChains(parseStructure(pdb))).catch(() => setError(true));
  }, []);
  return <div className="research-viz protein-viz">
    <div className="research-header"><span>FIELD NOTES / 05</span><span>PROTEIN DATA BANK / 1A3N ↗</span></div>
    <div className="research-intro"><div><p className="research-eyebrow">A MOLECULE IN FOUR PARTS</p><h2>Inside<br /><em>hemoglobin.</em></h2></div><p>Four folded chains, working together. Explore an experimentally derived structure of the protein that carries oxygen in blood.</p></div>
    {error ? <p role="alert">The protein structure could not be loaded. Please try refreshing.</p> : !chains.length ? <p role="status">Loading protein structure…</p> : <>
      <div className="protein-layout"><div className="protein-scene"><Canvas camera={{ position: [0, 0, 135], fov: 35, near: 0.1, far: 500 }} dpr={[1, 1.5]} fallback={<p>3D rendering is unavailable on this device. The chain controls and source links remain available below.</p>}><ambientLight intensity={1.2}/><directionalLight position={[35, 40, 70]} intensity={2.8}/><directionalLight position={[-45, -10, -40]} intensity={1.5} color="#b6d4ff"/><Protein chains={chains} shown={shown} rotation={rotation}/><OrbitControls makeDefault enablePan={false} minDistance={75} maxDistance={230} autoRotate={spinning} autoRotateSpeed={1.4}/></Canvas><div className="protein-scene-label"><span>DRAG TO ROTATE · SCROLL TO ZOOM</span><span>DEOXY FORM</span></div></div>
      <div className="protein-details"><p className="research-eyebrow">MAKE THE STRUCTURE YOURS</p><h3>Four chains.<br/>One protein.</h3><p>Choose the subunits to reveal how the structure fits together.</p><div className="protein-chains">{chainIds.map((id) => <button type="button" key={id} aria-pressed={shown[id]} onClick={() => setShown((current) => ({ ...current, [id]: !current[id] }))}><span style={{ background: chainColours[id] }}/><strong>{chainNames[id]}</strong><small>CHAIN {id}</small><b>{shown[id] ? "ON" : "OFF"}</b></button>)}</div><p className="protein-gold"><span/> Gold marks a heme iron atom; marker size is enlarged.</p></div></div>
      <div className="protein-controls"><button type="button" onClick={() => setRotation((angle) => angle - Math.PI / 6)}>↶ Rotate left</button><button type="button" onClick={() => setRotation((angle) => angle + Math.PI / 6)}>↷ Rotate right</button><button type="button" aria-pressed={spinning} onClick={() => setSpinning(!spinning)}>{spinning ? "❚❚ Stop spin" : "▶ Auto-rotate"}</button></div>
      <p className="research-note">Tubes are a smoothed trace through alpha-carbon coordinates, not chemical bonds or atomic surfaces. This is a static deoxygenated structure; colours and marker sizes are illustrative.</p>
    </>}
    <p className="research-source">Structure: <a href="https://doi.org/10.2210/pdb1A3N/pdb" target="_blank" rel="noreferrer">PDB 1A3N, Tame and Vallone</a> · <a href="https://doi.org/10.1107/S0907444900006387" target="_blank" rel="noreferrer">Tame and Vallone 2000</a> · Coordinate data <a href="https://www.rcsb.org/pages/usage-policy" target="_blank" rel="noreferrer">CC0 1.0</a>. Adapted for display.</p>
  </div>;
}
