export type Edge = [from: number, to: number];
export type Attachment = "preferential" | "uniform";

export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function adjacency(size: number, edges: Edge[]) {
  const neighbours = Array.from({ length: size }, () => new Set<number>());
  for (const [from, to] of edges) {
    neighbours[from].add(to);
    neighbours[to].add(from);
  }
  return neighbours;
}

export function smallWorld(size: number, probability: number, seed: number) {
  const ring: Edge[] = [];
  for (let offset = 1; offset <= 3; offset++) {
    for (let from = 0; from < size; from++) ring.push([from, (from + offset) % size]);
  }
  const neighbours = adjacency(size, ring);
  const decision = seededRandom(seed);
  const destination = seededRandom(seed ^ 0x9e3779b9);
  return ring.map(([from, to]): { edge: Edge; rewired: boolean } => {
    const rewire = decision() < probability;
    const pick = destination();
    if (!rewire) return { edge: [from, to], rewired: false };
    const candidates = neighbours.flatMap((_, node) =>
      node !== from && !neighbours[from].has(node) ? [node] : [],
    );
    if (!candidates.length) return { edge: [from, to], rewired: false };
    const target = candidates[Math.floor(pick * candidates.length)];
    neighbours[from].delete(to);
    neighbours[to].delete(from);
    neighbours[from].add(target);
    neighbours[target].add(from);
    return { edge: [from, target], rewired: true };
  });
}

export function growingNetwork(size: number, attachment: Attachment, seed: number) {
  const random = seededRandom(seed);
  const edges: Edge[] = [[0, 1], [1, 2], [0, 2]];
  const degrees = [2, 2, 2];
  for (let node = 3; node < size; node++) {
    const candidates = degrees.map((degree, target) => ({
      target,
      weight: attachment === "preferential" ? degree : 1,
    }));
    for (let link = 0; link < 2; link++) {
      let draw = random() * candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
      const index = candidates.findIndex(({ weight }) => (draw -= weight) < 0);
      const [{ target }] = candidates.splice(index, 1);
      edges.push([node, target]);
      degrees[target]++;
    }
    degrees.push(2);
  }
  return { edges, degrees };
}

function search(neighbours: Set<number>[], start: number) {
  const distance = Array<number>(neighbours.length).fill(-1);
  const previous = Array<number>(neighbours.length).fill(-1);
  const queue = [start];
  distance[start] = 0;
  for (let index = 0; index < queue.length; index++) {
    const from = queue[index];
    for (const to of neighbours[from]) {
      if (distance[to] !== -1) continue;
      distance[to] = distance[from] + 1;
      previous[to] = from;
      queue.push(to);
    }
  }
  return { distance, previous };
}

export function shortestRoute(neighbours: Set<number>[], start: number, end: number) {
  const { distance, previous } = search(neighbours, start);
  if (distance[end] < 0) return [];
  const route = [end];
  while (route.at(-1) !== start) route.push(previous[route[route.length - 1]]);
  return route.reverse();
}

export function networkStats(neighbours: Set<number>[]) {
  let clustering = 0;
  let hops = 0;
  let pairs = 0;
  for (const [node, adjacent] of neighbours.entries()) {
    const local = [...adjacent];
    let triangles = 0;
    for (const [index, from] of local.entries()) {
      for (const to of local.slice(index + 1)) {
        if (neighbours[from].has(to)) triangles++;
      }
    }
    if (local.length > 1) clustering += (2 * triangles) / (local.length * (local.length - 1));
    for (const distance of search(neighbours, node).distance.slice(node + 1)) {
      if (distance < 0) continue;
      hops += distance;
      pairs++;
    }
  }
  return {
    clustering: clustering / neighbours.length,
    meanHops: hops / pairs,
    connected: pairs === neighbours.length * (neighbours.length - 1) / 2,
  };
}
