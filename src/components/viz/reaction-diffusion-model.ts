import { seededRandom } from "./network-models";

export const fieldSize = 96;

export type Rates = { feed: number; kill: number };

export function createReactionField(seed = 37) {
  const cells = fieldSize * fieldSize;
  let u = new Float32Array(cells).fill(1);
  let v = new Float32Array(cells);
  let nextU = new Float32Array(cells);
  let nextV = new Float32Array(cells);
  let step = 0;
  const random = seededRandom(seed);
  const previous = Int32Array.from({ length: fieldSize }, (_, i) => (i + fieldSize - 1) % fieldSize);
  const next = Int32Array.from({ length: fieldSize }, (_, i) => (i + 1) % fieldSize);

  for (let y = 0; y < fieldSize; y++) {
    for (let x = 0; x < fieldSize; x++) {
      if (Math.abs(x - fieldSize / 2) >= 8 || Math.abs(y - fieldSize / 2) >= 8) continue;
      const index = y * fieldSize + x;
      u[index] = 0.5 + (random() - 0.5) * 0.01;
      v[index] = 0.25 + (random() - 0.5) * 0.005;
    }
  }

  function advance(count: number, { feed, kill }: Rates) {
    for (let i = 0; i < count; i++) {
      for (let y = 0; y < fieldSize; y++) {
        const row = y * fieldSize;
        const above = previous[y] * fieldSize;
        const below = next[y] * fieldSize;
        for (let x = 0; x < fieldSize; x++) {
          const index = row + x;
          const left = row + previous[x];
          const right = row + next[x];
          const a = u[index];
          const b = v[index];
          const laplaceU = u[left] + u[right] + u[above + x] + u[below + x] - 4 * a;
          const laplaceV = v[left] + v[right] + v[above + x] + v[below + x] - 4 * b;
          const reaction = a * b * b;
          nextU[index] = a + 0.16 * laplaceU - reaction + feed * (1 - a);
          nextV[index] = b + 0.08 * laplaceV + reaction - (feed + kill) * b;
        }
      }
      [u, nextU] = [nextU, u];
      [v, nextV] = [nextV, v];
      step++;
    }
  }

  return { advance, get step() { return step; }, get concentration() { return v; } };
}
