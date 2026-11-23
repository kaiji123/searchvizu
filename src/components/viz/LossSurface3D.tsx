"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { Slider, Stat } from "./controls";
import { PlaybackButton } from "./playback";

// ---------------------------------------------------------------- maths ---

const EXTENT = 3; // domain is [-EXTENT, EXTENT]^2
const HEIGHT_SCALE = 0.9;
const STEPS = 320;

const g2 = (x: number, y: number, cx: number, cy: number, s: number) =>
  Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / s);

// Hand-built non-convex surface: a deep global basin, a shallower local
// minimum, a ridge between them and a gentle bowl so everything is bounded.
function loss(x: number, y: number) {
  return (
    2.4 -
    2.6 * g2(x, y, 1.2, -0.9, 1.3) -
    1.5 * g2(x, y, -1.5, 1.4, 0.55) +
    0.9 * g2(x, y, -0.1, 0.35, 0.45) +
    0.13 * (x * x + y * y)
  );
}

function grad(x: number, y: number): [number, number] {
  const h = 1e-4;
  return [(loss(x + h, y) - loss(x - h, y)) / (2 * h), (loss(x, y + h) - loss(x, y - h)) / (2 * h)];
}

type OptimiserId = "sgd" | "momentum" | "adam";

const OPTIMISERS: { id: OptimiserId; label: string; color: string }[] = [
  { id: "sgd", label: "Gradient descent", color: "#ff4d6d" },
  { id: "momentum", label: "Momentum", color: "#ffb703" },
  { id: "adam", label: "Adam", color: "#4cc9f0" },
];

const clamp = (v: number) => Math.max(-EXTENT, Math.min(EXTENT, v));

function trajectory(id: OptimiserId, start: [number, number], lr: number, beta: number): [number, number][] {
  let [x, y] = start;
  const out: [number, number][] = [[x, y]];
  let vx = 0, vy = 0; // momentum velocity
  let mx = 0, my = 0, sx = 0, sy = 0; // Adam moments
  const b1 = 0.9, b2 = 0.999, eps = 1e-8;
  for (let t = 1; t <= STEPS; t++) {
    const [gx, gy] = grad(x, y);
    if (id === "sgd") {
      x -= lr * gx;
      y -= lr * gy;
    } else if (id === "momentum") {
      vx = beta * vx - lr * gx;
      vy = beta * vy - lr * gy;
      x += vx;
      y += vy;
    } else {
      mx = b1 * mx + (1 - b1) * gx;
      my = b1 * my + (1 - b1) * gy;
      sx = b2 * sx + (1 - b2) * gx * gx;
      sy = b2 * sy + (1 - b2) * gy * gy;
      const mhx = mx / (1 - b1 ** t), mhy = my / (1 - b1 ** t);
      const shx = sx / (1 - b2 ** t), shy = sy / (1 - b2 ** t);
      x -= (lr * mhx) / (Math.sqrt(shx) + eps);
      y -= (lr * mhy) / (Math.sqrt(shy) + eps);
    }
    x = clamp(x);
    y = clamp(y);
    out.push([x, y]);
  }
  return out;
}

// Domain (u, v) → world. The surface lies in the XZ plane with height on Y.
const toWorld = (u: number, v: number, lift = 0) => new THREE.Vector3(u, loss(u, v) * HEIGHT_SCALE + lift, -v);

// ---------------------------------------------------------------- scene ---

const STOPS = ["#10203c", "#1f4e5f", "#3c7f7a", "#9bb8a5", "#e8e2cf"].map((c) => new THREE.Color(c));

function useSurfaceGeometry() {
  return useMemo(() => {
    const seg = 150;
    const geo = new THREE.PlaneGeometry(EXTENT * 2, EXTENT * 2, seg, seg);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    let min = Infinity, max = -Infinity;
    const heights: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const h = loss(pos.getX(i), pos.getY(i));
      heights.push(h);
      min = Math.min(min, h);
      max = Math.max(max, h);
    }
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      pos.setZ(i, heights[i] * HEIGHT_SCALE);
      const t = ((heights[i] - min) / (max - min)) * (STOPS.length - 1);
      const k = Math.min(STOPS.length - 2, Math.floor(t));
      c.copy(STOPS[k]).lerp(STOPS[k + 1], t - k);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, []);
}

function Surface() {
  const geo = useSurfaceGeometry();
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial vertexColors roughness={0.85} metalness={0.05} side={THREE.DoubleSide} />
    </mesh>
  );
}

type Line2Like = { geometry: THREE.InstancedBufferGeometry };

function Trail({ points, color, progressRef }: { points: THREE.Vector3[]; color: string; progressRef: RefObject<number> }) {
  const line = useRef<Line2Like>(null);
  const ball = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const n = Math.min(points.length - 1, Math.floor(progressRef.current));
    if (line.current) line.current.geometry.instanceCount = Math.max(0, n);
    if (ball.current) ball.current.position.copy(points[n]);
  });
  return (
    <>
      <Line ref={line as never} points={points} color={color} lineWidth={3} />
      <mesh ref={ball}>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
    </>
  );
}

function Clock({ progressRef, playing, finish }: { progressRef: RefObject<number>; playing: boolean; finish: () => void }) {
  useFrame((_, dt) => {
    if (!playing || progressRef.current >= STEPS) return;
    progressRef.current = Math.min(STEPS, progressRef.current + Math.min(dt, 0.1) * 75);
    if (progressRef.current === STEPS) finish();
  });
  return null;
}

// ------------------------------------------------------------------- ui ---

const DEFAULT_START: [number, number] = [-2.5, 2.3];

export default function LossSurface3D() {
  const [lr, setLr] = useState(0.06);
  const [beta, setBeta] = useState(0.9);
  const [start, setStart] = useState<[number, number]>(DEFAULT_START);
  const [shown, setShown] = useState<Record<OptimiserId, boolean>>({ sgd: true, momentum: true, adam: true });
  const progressRef = useRef(STEPS);
  const [playing, setPlaying] = useState(false);

  const paths = useMemo(
    () =>
      Object.fromEntries(OPTIMISERS.map((o) => [o.id, trajectory(o.id, start, lr, beta)])) as Record<OptimiserId, [number, number][]>,
    [start, lr, beta],
  );
  const worldPaths = useMemo(
    () =>
      Object.fromEntries(OPTIMISERS.map((o) => [o.id, paths[o.id].map(([u, v]) => toWorld(u, v, 0.03))])) as Record<
        OptimiserId,
        THREE.Vector3[]
      >,
    [paths],
  );

  function togglePlayback() {
    if (!playing && progressRef.current >= STEPS) progressRef.current = 0;
    setPlaying(!playing);
  }

  function showCompletePaths() {
    setPlaying(false);
    progressRef.current = STEPS;
  }

  const newStart = () => {
    const r = () => (Math.random() * 2 - 1) * (EXTENT - 0.3);
    showCompletePaths();
    setStart([r(), r()]);
  };

  return (
    <div className="viz-panel">
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#0b1220] sm:aspect-[16/10]">
          <Canvas camera={{ position: [5.2, 4.6, 5.6], fov: 42 }} dpr={[1, 2]} aria-label="3D loss surface with optimiser trajectories">
            <ambientLight intensity={0.55} />
            <directionalLight position={[4, 8, 3]} intensity={1.6} />
            <directionalLight position={[-6, 3, -4]} intensity={0.35} />
            <Surface />
            {OPTIMISERS.filter((o) => shown[o.id]).map((o) => (
              <Trail key={o.id} points={worldPaths[o.id]} color={o.color} progressRef={progressRef} />
            ))}
            <mesh position={toWorld(start[0], start[1], 0.03)}>
              <sphereGeometry args={[0.09, 24, 24]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <Clock progressRef={progressRef} playing={playing} finish={() => setPlaying(false)} />
            <OrbitControls enablePan={false} minDistance={4} maxDistance={14} maxPolarAngle={Math.PI / 2.05} target={[0, 0.6, 0]} />
          </Canvas>
          <div className="pointer-events-none absolute left-3 top-3 text-[11px] text-white/70">Drag to orbit · scroll to zoom</div>
        </div>

        <div className="flex flex-col gap-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Optimisers</legend>
            <div className="flex flex-col gap-1.5">
              {OPTIMISERS.map((o) => (
                <label key={o.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={shown[o.id]}
                    onChange={(e) => setShown((s) => ({ ...s, [o.id]: e.target.checked }))}
                    className="size-4"
                    style={{ accentColor: o.color }}
                  />
                  <span className="h-1 w-4 rounded" style={{ background: o.color }} />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>
          <Slider label="Learning rate" value={lr} min={0.005} max={0.4} step={0.005} format={(v) => v.toFixed(3)} onChange={(v) => { showCompletePaths(); setLr(v); }} />
          <Slider label="Momentum β" value={beta} min={0} max={0.98} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => { showCompletePaths(); setBeta(v); }} />
          <div className="flex gap-2">
            <PlaybackButton playing={playing} toggle={togglePlayback} description="optimiser trajectories" className="btn-secondary flex-1" />
            <button type="button" onClick={newStart} className="btn-secondary flex-1">
              New start
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 border-t border-line pt-4">
            <div className="text-xs text-muted">Loss after {STEPS} steps</div>
            {OPTIMISERS.map((o) => {
              const [u, v] = paths[o.id][paths[o.id].length - 1];
              return (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: o.color }} />
                    {o.label}
                  </span>
                  <span className="font-semibold tabular-nums">{loss(u, v).toFixed(3)}</span>
                </div>
              );
            })}
            <Stat label="Global minimum (approx.)" value={<span className="text-sm">{globalMin.toFixed(3)}</span>} />
          </div>
        </div>
      </div>
    </div>
  );
}

const globalMin = (() => {
  let m = Infinity;
  for (let i = 0; i <= 300; i++)
    for (let j = 0; j <= 300; j++) m = Math.min(m, loss(-EXTENT + (i / 150) * EXTENT, -EXTENT + (j / 150) * EXTENT));
  return m;
})();
