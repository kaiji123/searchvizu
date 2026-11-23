"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Segmented, Stat } from "./controls";
import { PlaybackButton } from "./playback";
import { createReactionField, fieldSize } from "./reaction-diffusion-model";

const presets = {
  spots: { label: "Spots", feed: 0.0367, kill: 0.0649 },
  stripes: { label: "Stripes", feed: 0.029, kill: 0.057 },
  fade: { label: "Fade", feed: 0.015, kill: 0.06 },
};
type Preset = keyof typeof presets;
const palette = [[17, 23, 51], [72, 122, 179], [100, 209, 193], [255, 228, 165]];
const scaleMaximum = 0.45;
const initialPreview = 1800;
const stepLimit = 12000;

function drawField(context: CanvasRenderingContext2D, field: Float32Array, image: ImageData) {
  for (let i = 0; i < field.length; i++) {
    const scaled = Math.min(1, Math.max(0, field[i] / scaleMaximum)) * (palette.length - 1);
    const index = Math.min(Math.floor(scaled), palette.length - 2);
    const fraction = scaled - index;
    const start = palette[index];
    const end = palette[index + 1];
    for (let channel = 0; channel < 3; channel++) {
      image.data[4 * i + channel] = start[channel] + (end[channel] - start[channel]) * fraction;
    }
    image.data[4 * i + 3] = 255;
  }
  context.putImageData(image, 0, 0);
}

function Simulation({ preset }: { preset: Preset }) {
  const rates = presets[preset];
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<ReturnType<typeof createReactionField> | null>(null);
  const image = useRef<ImageData | null>(null);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  const advance = useCallback((count: number) => {
    const current = field.current;
    const context = canvas.current?.getContext("2d");
    if (!current || !context) return false;
    image.current ??= context.createImageData(fieldSize, fieldSize);
    current.advance(Math.min(count, stepLimit - current.step), rates);
    drawField(context, current.concentration, image.current);
    setStep(current.step);
    return current.step < stepLimit;
  }, [rates]);

  useEffect(() => {
    field.current = createReactionField();
    let frame = requestAnimationFrame(function prepare() {
      const remaining = initialPreview - (field.current?.step ?? 0);
      advance(Math.min(remaining, 100));
      if (remaining > 100) frame = requestAnimationFrame(prepare);
      else setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [advance]);

  useEffect(() => {
    if (!playing) return;
    let previousTime = 0;
    let frame = requestAnimationFrame(function tick(now) {
      if (now - previousTime >= 1000 / 30) {
        previousTime = now;
        if (!advance(24)) {
          setPlaying(false);
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [advance, playing]);

  function togglePlayback() {
    if (step >= stepLimit) {
      field.current = createReactionField();
      advance(0);
    }
    setPlaying((value) => !value);
  }

  function reset() {
    setPlaying(false);
    field.current = createReactionField();
    advance(0);
  }

  return (
    <>
      <div className="min-w-0">
        <canvas ref={canvas} width={fieldSize} height={fieldSize} className="mx-auto block aspect-square w-full max-w-lg rounded-xl bg-[#111733]" role="img" aria-label={`Gray–Scott ${rates.label.toLowerCase()} simulation showing the spatial concentration of chemical V`}>
          A square concentration map where lighter colours represent more of chemical V.
        </canvas>
        <div className="mx-auto mt-3 grid max-w-lg grid-cols-[auto_1fr_auto] items-center gap-3 text-xs text-muted">
          <span>V = 0</span>
          <span className="h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${palette.map((color) => `rgb(${color.join(" ")})`).join(", ")})` }} />
          <span>V ≥ {scaleMaximum}</span>
        </div>
      </div>
      <div className="grid content-start gap-5">
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Feed rate, F" value={rates.feed.toFixed(4)} />
          <Stat label="Removal rate, k" value={rates.kill.toFixed(4)} />
        </div>
        <Stat label="Step" value={step.toLocaleString("en-GB")} />
        <div className="flex flex-wrap gap-2">
          <PlaybackButton playing={playing} toggle={togglePlayback} disabled={!ready} className="btn-primary" description="reaction simulation" />
          <button type="button" className="btn-secondary disabled:opacity-50" disabled={!ready || playing || step >= stepLimit} onClick={() => advance(100)}>Advance 100 steps</button>
          <button type="button" className="btn-secondary disabled:opacity-50" disabled={!ready} onClick={reset}>Restart from seed</button>
        </div>
        <p className="text-sm text-muted" role="status">{!ready ? "Preparing the preview at step 1,800…" : step >= stepLimit ? "Reached the end of this run. Restart from the seed to explore again." : "All three presets begin with the same square of concentrated V. Opposite edges of the grid wrap around."}</p>
      </div>
    </>
  );
}

export default function ReactionDiffusion() {
  const [preset, setPreset] = useState<Preset>("spots");
  return (
    <section className="viz-panel grid gap-5">
      <Segmented<Preset> label="Rate preset" value={preset} onChange={setPreset} options={[
        { value: "spots", label: presets.spots.label },
        { value: "stripes", label: presets.stripes.label },
        { value: "fade", label: presets.fade.label },
      ]} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Simulation key={preset} preset={preset} />
      </div>
    </section>
  );
}
