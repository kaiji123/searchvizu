// Small, dependency-free causal-graph utilities: path enumeration,
// d-separation and the backdoor criterion. Kept separate from the UI so it
// can be unit-tested and reused for client DAGs.

export type Edge = readonly [from: string, to: string];

export type PathKind = "causal" | "backdoor" | "non-causal";

export type PathResult = {
  nodes: string[];
  kind: PathKind;
  open: boolean;
  // Why the path is blocked or opened, for the explanation text.
  blockedBy: string[];
  openedColliders: string[];
};

export class Dag {
  readonly children = new Map<string, string[]>();
  readonly parents = new Map<string, string[]>();

  readonly nodes: string[];
  readonly edges: readonly Edge[];

  constructor(nodes: string[], edges: readonly Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
    for (const n of nodes) {
      this.children.set(n, []);
      this.parents.set(n, []);
    }
    for (const [a, b] of edges) {
      this.children.get(a)!.push(b);
      this.parents.get(b)!.push(a);
    }
  }

  hasEdge(a: string, b: string) {
    return this.children.get(a)!.includes(b);
  }

  descendants(n: string): Set<string> {
    const out = new Set<string>();
    const stack = [...this.children.get(n)!];
    while (stack.length) {
      const c = stack.pop()!;
      if (out.has(c)) continue;
      out.add(c);
      stack.push(...this.children.get(c)!);
    }
    return out;
  }

  // Every simple path between x and y in the undirected skeleton.
  paths(x: string, y: string): string[][] {
    const result: string[][] = [];
    const walk = (node: string, path: string[]) => {
      if (node === y) {
        result.push(path);
        return;
      }
      const neighbours = [...this.children.get(node)!, ...this.parents.get(node)!];
      for (const nb of neighbours) if (!path.includes(nb)) walk(nb, [...path, nb]);
    };
    walk(x, [x]);
    return result.sort((a, b) => a.length - b.length);
  }

  analysePath(path: string[], adjusted: Set<string>): PathResult {
    const forward = path.every((n, i) => i === 0 || this.hasEdge(path[i - 1], n));
    const intoExposure = this.hasEdge(path[1], path[0]);
    const kind: PathKind = forward ? "causal" : intoExposure ? "backdoor" : "non-causal";

    const blockedBy: string[] = [];
    const openedColliders: string[] = [];
    for (let i = 1; i < path.length - 1; i++) {
      const m = path[i];
      const collider = this.hasEdge(path[i - 1], m) && this.hasEdge(path[i + 1], m);
      if (collider) {
        const desc = this.descendants(m);
        const conditioned = adjusted.has(m) || [...desc].some((d) => adjusted.has(d));
        if (conditioned) openedColliders.push(m);
        else blockedBy.push(m);
      } else if (adjusted.has(m)) {
        blockedBy.push(m);
      }
    }
    return { nodes: path, kind, open: blockedBy.length === 0, blockedBy, openedColliders };
  }

  // Backdoor criterion (Pearl 2009, Def. 3.3.1) for a total effect.
  satisfiesBackdoor(x: string, y: string, adjusted: Set<string>) {
    const descX = this.descendants(x);
    const badAdjusted = [...adjusted].filter((z) => descX.has(z));
    const results = this.paths(x, y).map((p) => this.analysePath(p, adjusted));
    const openBackdoor = results.filter((r) => r.kind === "backdoor" && r.open);
    return { valid: badAdjusted.length === 0 && openBackdoor.length === 0, badAdjusted, openBackdoor, results };
  }

  minimalAdjustmentSets(x: string, y: string): string[][] {
    const descX = this.descendants(x);
    const candidates = this.nodes.filter((n) => n !== x && n !== y && !descX.has(n));
    const valid: string[][] = [];
    for (let mask = 0; mask < 1 << candidates.length; mask++) {
      const set = candidates.filter((_, i) => mask & (1 << i));
      if (this.satisfiesBackdoor(x, y, new Set(set)).valid) valid.push(set);
    }
    return valid
      .filter((s) => !valid.some((t) => t !== s && t.length < s.length && t.every((n) => s.includes(n))))
      .sort((a, b) => a.length - b.length);
  }
}
