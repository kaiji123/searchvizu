"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Box3, CatmullRomCurve3, Quaternion, Vector3 } from "three";
import "./research-samples.css";

type StructureId = "1BNA" | "1EMA";
type Structure = { traces: CatmullRomCurve3[]; detail: Vector3[]; pairLabels: string[]; size: number };
const strandColours = ["#80d8d7", "#a8a9ff"];

function parseCoordinates(pdb: string, id: StructureId): Structure {
  const traces: Vector3[][] = [[], []];
  const bases: string[][] = [[], []];
  const detail: Vector3[] = [];
  for (const line of pdb.split(/\r?\n/)) {
    const record = line.slice(0, 6).trim();
    const atom = line.slice(12, 16).trim();
    const alt = line[16];
    if (alt !== " " && alt !== "A") continue;
    const point = new Vector3(...([30, 38, 46].map((start) =>
      Number.parseFloat(line.slice(start, start + 8)),
    ) as [number, number, number]));
    if (!point.toArray().every(Number.isFinite)) continue;

    if (id === "1BNA" && record === "ATOM" && atom === "C1'") {
      const strand = ["A", "B"].indexOf(line[21]);
      if (strand !== -1) {
        traces[strand].push(point);
        bases[strand].push(line.slice(17, 20).trim().slice(1));
      }
    }
    if (id === "1EMA" && line[21] === "A") {
      if (record === "ATOM" && atom === "CA") traces[0].push(point);
      if (record === "HETATM" && line.slice(17, 20) === "CRO") {
        detail.push(point);
        if (atom === "CA1" || atom === "CA2" || atom === "CA3") traces[0].push(point);
      }
    }
  }

  if (id === "1BNA" ? traces.some((trace) => trace.length !== 12) : traces[0].length < 200 || !detail.length) {
    throw new Error("Unexpected crystal coordinates");
  }

  const points = [...traces.flat(), ...detail];
  const box = new Box3().setFromPoints(points);
  const center = box.getCenter(new Vector3());
  points.forEach((point) => point.sub(center));
  const segments = dnaOrProteinSegments(traces, id);
  return {
    traces: segments.filter((trace) => trace.length > 1).map((trace) => new CatmullRomCurve3(trace)),
    detail,
    pairLabels: bases[0].map((base, index) => `${base}–${bases[1].at(-1 - index)}`),
    size: box.getSize(new Vector3()).length(),
  };
}

function dnaOrProteinSegments(traces: Vector3[][], id: StructureId) {
  if (id === "1BNA") return traces;
  const segments: Vector3[][] = [[]];
  for (const point of traces[0]) {
    const segment = segments[segments.length - 1];
    const previous = segment.at(-1);
    if (previous && previous.distanceTo(point) > 5) segments.push([point]);
    else segment.push(point);
  }
  return segments;
}

function CrystalViewer({ id }: { id: StructureId }) {
  const dna = id === "1BNA";
  const [structure, setStructure] = useState<Structure>();
  const [failed, setFailed] = useState(false);
  const [showTrace, setShowTrace] = useState(true);
  const [pair, setPair] = useState(0);
  const [angle, setAngle] = useState(0.35);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/data/${id}.pdb`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Coordinates unavailable");
        return response.text();
      })
      .then((pdb) => {
        const parsed = parseCoordinates(pdb, id);
        if (!controller.signal.aborted) setStructure(parsed);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [id]);

  return (
    <div className="research-viz protein-viz">
      <div className="research-intro">
        <div><p className="research-eyebrow">PDB {id} · 1.9 Å X-RAY STRUCTURE</p>
          <h2>{dna ? "A turn of DNA" : "Inside the green glow"}</h2>
        </div>
        <p>{dna ? "Follow the two strands of a 12-base-pair duplex." : "Find the chromophore inside the fold of green fluorescent protein."}</p>
      </div>
      {failed && <p role="alert">The crystal coordinates could not be loaded. Refresh to try again.</p>}
      {!failed && !structure && <p role="status">Loading crystal coordinates…</p>}
      {structure && <>
        <div className="protein-layout">
          <div className="protein-scene">
            <Canvas camera={{ position: [0, 0, structure.size * 1.45], fov: 35 }}
              dpr={[1, 1.5]} frameloop="demand" fallback={<p>3D rendering is unavailable on this device.</p>}>
              <ambientLight intensity={1.2} />
              <directionalLight position={[20, 30, 40]} intensity={2.8} />
              <group rotation={[0.25, angle, 0]} scale={zoom}>
                {showTrace && structure.traces.map((trace, index) => (
                  <mesh key={index}>
                    <tubeGeometry args={[trace, trace.points.length * 4, dna ? 0.45 : 0.48, 8, false]} />
                    <meshStandardMaterial color={dna ? strandColours[index] : "#9ab8d8"} />
                  </mesh>
                ))}
                {dna ? structure.traces[0].points.map((start, index) => {
                  const end = structure.traces[1].points[11 - index];
                  return (
                    <mesh key={index} position={start.clone().lerp(end, 0.5)}
                      quaternion={new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), end.clone().sub(start).normalize())}>
                      <cylinderGeometry args={[index === pair ? 0.43 : 0.18, index === pair ? 0.43 : 0.18, start.distanceTo(end), 12]} />
                      <meshStandardMaterial color={index === pair ? "#ffe19b" : "#818497"} />
                    </mesh>
                  );
                }) : structure.detail.map((point, index) => (
                  <mesh key={index} position={point}>
                    <sphereGeometry args={[0.68, 16, 12]} />
                    <meshStandardMaterial color="#bcff73" emissive="#477f15" emissiveIntensity={0.55} />
                  </mesh>
                ))}
              </group>
              <OrbitControls enablePan={false} minDistance={structure.size * 0.55} maxDistance={structure.size * 2.8} />
            </Canvas>
            <div className="protein-scene-label">DRAG TO ROTATE · SCROLL OR PINCH TO ZOOM</div>
          </div>
          <div className="protein-details">
            <h3>{dna ? "Base pairs" : "The chromophore"}</h3>
            <p>{dna ? "Each rung connects the sugar positions of one paired set of bases. The selected pair is gold." : "Green spheres mark the deposited chromophore atoms. Hide the surrounding protein trace to see their arrangement."}</p>
            {dna && <label className="block">
              <span>Pair {pair + 1} of 12 · {structure.pairLabels[pair]}</span>
              <input className="block w-full" type="range" min={1} max={12} value={pair + 1}
                onChange={(event) => setPair(Number(event.currentTarget.value) - 1)} />
            </label>}
            <div className="protein-controls">
              <button type="button" aria-pressed={showTrace} onClick={() => setShowTrace(!showTrace)}>{dna ? "Strand traces" : "Protein trace"}</button>
              <button type="button" onClick={() => setAngle(angle - Math.PI / 6)}>Rotate left</button>
              <button type="button" onClick={() => setAngle(angle + Math.PI / 6)}>Rotate right</button>
              <button type="button" disabled={zoom <= 0.6} onClick={() => setZoom(Math.max(0.6, zoom - 0.2))}>Zoom out</button>
              <button type="button" disabled={zoom >= 1.6} onClick={() => setZoom(Math.min(1.6, zoom + 0.2))}>Zoom in</button>
            </div>
          </div>
        </div>
      </>}
    </div>
  );
}

export function DnaCrystal() {
  return <CrystalViewer id="1BNA" />;
}

export function GfpCrystal() {
  return <CrystalViewer id="1EMA" />;
}
