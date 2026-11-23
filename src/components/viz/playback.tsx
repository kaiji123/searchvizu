"use client";

import { useEffect, useEffectEvent, useState } from "react";

type PlaybackOptions = {
  advance: () => boolean;
  restart: () => void;
  atEnd: boolean;
  atStart?: boolean;
  delay: number;
  ready?: boolean;
};

function usePlayback({ advance, restart, atEnd, atStart, delay, ready = true }: PlaybackOptions) {
  const [requested, setRequested] = useState(false);
  const playing = ready && requested && !atEnd;
  const tick = useEffectEvent(() => {
    if (playing && !document.hidden && advance()) setRequested(false);
  });

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(tick, delay);
    return () => window.clearInterval(timer);
  }, [delay, playing]);

  function stop() {
    setRequested(false);
  }

  function toggle() {
    if (playing) {
      stop();
      return;
    }
    if (atEnd || atStart) restart();
    setRequested(true);
  }

  return { playing, disabled: !ready, toggle, stop };
}

export function useRangePlayback(
  value: number,
  change: (value: number) => void,
  { min, max, step, delay = 100, ready = true }: { min: number; max: number; step: number; delay?: number; ready?: boolean },
) {
  const playback = usePlayback({
    advance: () => {
      const next = Math.min(max, Number((Math.max(min, value) + step).toFixed(8)));
      change(next);
      return next === max;
    },
    restart: () => change(min),
    atEnd: value >= max,
    atStart: value < min,
    delay,
    ready: ready && max > min,
  });
  return { ...playback, select(next: number) { playback.stop(); change(next); } };
}

export function useSequencePlayback<T>(values: readonly T[], value: T | null, change: (value: T) => void, delay = 1000) {
  const index = value === null ? -1 : values.indexOf(value);
  const playback = usePlayback({
    advance: () => {
      change(values[index + 1]);
      return index + 1 >= values.length - 1;
    },
    restart: () => change(values[0]),
    atEnd: index === values.length - 1,
    atStart: index < 0,
    delay,
    ready: values.length > 0,
  });
  return { ...playback, select(next: T) { playback.stop(); change(next); } };
}

export function PlaybackButton({
  playing, toggle, disabled, className = "btn-secondary", description,
}: {
  playing: boolean;
  toggle: () => void;
  disabled?: boolean;
  className?: string;
  description?: string;
}) {
  const action = playing ? "Pause" : "Play";
  return (
    <button type="button" onClick={toggle} disabled={disabled} className={`${className} disabled:opacity-50`}
      aria-label={description ? `${action} ${description}` : action}>
      {action}
    </button>
  );
}
