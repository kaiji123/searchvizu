export function henonStep(x: number, y: number): [number, number] {
  return [1 - 1.4 * x * x + y, 0.3 * x];
}

export function visitHenonOrbit(count: number, visit: (x: number, y: number) => void) {
  let x = 0;
  let y = 0;
  for (let i = 0; i < count + 100; i++) {
    [x, y] = henonStep(x, y);
    if (i >= 100) visit(x, y);
  }
}
