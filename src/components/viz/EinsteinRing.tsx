"use client";

import { useEffect, useRef, useState } from "react";
import { Slider, Stat } from "./controls";
import { PlaybackButton, useRangePlayback } from "./playback";
import { diskMagnification, sourcePosition } from "./point-lens";

const imageSize = 480;
const centre = imageSize / 2;
const unit = imageSize / 5;

function ReferenceMarks() {
  return (
    <>
      <path d={`M 0 ${centre} H ${imageSize} M ${centre} 0 V ${imageSize}`} fill="none" stroke="#667483" strokeOpacity=".45" />
      <circle cx={centre} cy={centre} r={unit} fill="none" stroke="#a6c8e2" strokeOpacity=".75" strokeDasharray="6 6" />
      <path d={`M ${centre - 5} ${centre} h 10 M ${centre} ${centre - 5} v 10`} stroke="#f1f5f9" strokeWidth="2" />
    </>
  );
}

export default function EinsteinRing() {
  const [offset, setOffset] = useState(0.32);
  const playback = useRangePlayback(offset, setOffset, { min: 0, max: 1.4, step: 0.02, delay: 80 });
  const [radius, setRadius] = useState(0.24);
  const canvas = useRef<HTMLCanvasElement>(null);
  const magnification = diskMagnification(offset, radius);

  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!context) return;
    const image = context.createImageData(imageSize, imageSize);
    const radiusSquared = radius * radius;
    for (let row = 0; row < imageSize; row++) {
      for (let col = 0; col < imageSize; col++) {
        const x = (col + 0.5 - centre) / unit;
        const y = (centre - row - 0.5) / unit;
        const [sx, sy] = sourcePosition(x, y);
        if ((sx - offset) ** 2 + sy * sy > radiusSquared) continue;
        const index = (row * imageSize + col) * 4;
        image.data[index] = 255;
        image.data[index + 1] = 211;
        image.data[index + 2] = 132;
        image.data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
  }, [offset, radius]);

  return (
    <section className="viz-panel grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <figure className="min-w-0">
          <figcaption className="mb-2 text-sm font-medium">Without lensing</figcaption>
          <svg viewBox={`0 0 ${imageSize} ${imageSize}`} className="block w-full rounded-xl bg-[#121a2b]" role="img" aria-label="Unlensed circular source with the projected lens centre and Einstein radius marked">
            <ReferenceMarks />
            <circle cx={centre + offset * unit} cy={centre} r={radius * unit} fill="#ffd384" />
          </svg>
        </figure>
        <figure className="min-w-0">
          <figcaption className="mb-2 text-sm font-medium">With lensing</figcaption>
          <div className="relative overflow-hidden rounded-xl bg-[#121a2b]">
            <svg viewBox={`0 0 ${imageSize} ${imageSize}`} className="absolute inset-0 size-full" aria-hidden="true"><ReferenceMarks /></svg>
            <canvas ref={canvas} width={imageSize} height={imageSize} className="relative block w-full" role="img" aria-label={offset < radius ? "Lensed source surrounds the foreground lens as a ring" : "Lensed source appears as two images on opposite sides of the foreground lens"}>
              A point-mass lens distorts this source into images on opposite sides of the lens, or a ring when closely aligned.
            </canvas>
          </div>
        </figure>
      </div>
      <p className="text-sm text-muted">Both views share the same angular scale. The cross marks the lens centre, and the dashed circle marks one Einstein radius (θE).</p>
      <div className="grid items-start gap-4 md:grid-cols-[auto_1fr_1fr_auto]">
        <PlaybackButton {...playback} description="source motion" className="btn-secondary justify-self-start" />
        <Slider label="Source offset" min={0} max={1.4} step={0.01} value={offset} onChange={playback.select} format={(value) => `${value.toFixed(2)} θE`} />
        <Slider label="Source angular radius" min={0.08} max={0.45} step={0.01} value={radius} onChange={setRadius} format={(value) => `${value.toFixed(2)} θE`} />
        <div aria-live="polite"><Stat label="Total flux magnification" value={`${magnification.toFixed(2)}×`} /></div>
      </div>
    </section>
  );
}
