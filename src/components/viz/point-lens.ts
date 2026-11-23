export function sourcePosition(x: number, y: number): [number, number] {
  const squaredRadius = x * x + y * y;
  if (squaredRadius === 0) return [Infinity, Infinity];
  const scale = 1 - 1 / squaredRadius;
  return [x * scale, y * scale];
}

// Average the point-source magnification over a uniformly bright circular source.
export function diskMagnification(offset: number, radius: number) {
  const enclosed = Math.max(0, radius - offset);
  // Integrate the complete annuli analytically. Also covers exact alignment.
  let imageArea = Math.PI * enclosed * Math.hypot(enclosed, 2);
  const lower = Math.abs(offset - radius);
  const upper = offset + radius;
  const samples = 1024;
  const step = (upper - lower) / samples;
  for (let i = 0; i < samples && step > 0; i++) {
    const r = lower + (i + 0.5) * step;
    const cosine = (r * r + offset * offset - radius * radius) / (2 * r * offset);
    const coveredAngle = 2 * Math.acos(Math.max(-1, Math.min(1, cosine)));
    // The area element cancels the 1/r factor in point-source magnification.
    imageArea += coveredAngle * (r * r + 2) / Math.hypot(r, 2) * step;
  }
  return imageArea / (Math.PI * radius * radius);
}
