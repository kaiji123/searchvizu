export type Vector3 = [x: number, y: number, z: number];

export const LORENZ_STEP = 0.005;
export const LORENZ_SAMPLE = 0.05;

function velocity([x, y, z]: Vector3): Vector3 {
  return [10 * (y - x), x * (28 - z) - y, x * y - (8 / 3) * z];
}

function offset([x, y, z]: Vector3, [dx, dy, dz]: Vector3, time: number): Vector3 {
  return [x + dx * time, y + dy * time, z + dz * time];
}

export function lorenzTrajectory(initial: Vector3, duration: number): Vector3[] {
  const steps = Math.round(duration / LORENZ_STEP);
  const stride = Math.round(LORENZ_SAMPLE / LORENZ_STEP);
  const trajectory = [initial];
  let point = initial;
  for (let i = 1; i <= steps; i++) {
    const a = velocity(point);
    const b = velocity(offset(point, a, LORENZ_STEP / 2));
    const c = velocity(offset(point, b, LORENZ_STEP / 2));
    const d = velocity(offset(point, c, LORENZ_STEP));
    point = point.map((value, axis) =>
      value + LORENZ_STEP * (a[axis] + 2 * b[axis] + 2 * c[axis] + d[axis]) / 6,
    ) as Vector3;
    if (i % stride === 0) trajectory.push(point);
  }
  return trajectory;
}

export function separation(a: Vector3, b: Vector3) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
