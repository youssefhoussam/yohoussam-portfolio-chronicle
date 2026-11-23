import { CLUSTERS, clusterIndex, type ChapterId } from "@/data/chapters";
import { chunks } from "@/data/knowledge";

type Vec3 = [number, number, number];

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const NEUTRAL = CLUSTERS.length;

/** sRGB hex → [r, g, b] in 0..1 (written straight to the framebuffer, no colour management). */
export function hexToRgb(hex: string): Vec3 {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export const PALETTE: Vec3[] = [...CLUSTERS.map((c) => hexToRgb(c.color)), hexToRgb("#d8d1c4")];

/** Knowledge chunks become stars, placed deterministically inside their cluster. */
export function buildStars() {
  const rand = mulberry32(2026);
  const positions = new Float32Array(chunks.length * 3);
  const cluster = new Float32Array(chunks.length);
  const seed = new Float32Array(chunks.length);
  chunks.forEach((chunk, i) => {
    const ci = clusterIndex(chunk.cluster);
    const [cx, cy, cz] = CLUSTERS[ci].position;
    positions[i * 3] = cx + gauss(rand) * 0.85;
    positions[i * 3 + 1] = cy + gauss(rand) * 0.7;
    positions[i * 3 + 2] = cz + gauss(rand) * 0.85;
    cluster[i] = ci;
    seed[i] = rand();
  });
  return { positions, cluster, seed };
}

/** Faint constellation edges: each star links to its nearest neighbours inside its own cluster. */
export function buildEdges(positions: Float32Array, cluster: Float32Array) {
  const n = cluster.length;
  const pairs = new Set<string>();
  for (let i = 0; i < n; i++) {
    const near: { j: number; d: number }[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j || cluster[i] !== cluster[j]) continue;
      const d = Math.hypot(
        positions[i * 3] - positions[j * 3],
        positions[i * 3 + 1] - positions[j * 3 + 1],
        positions[i * 3 + 2] - positions[j * 3 + 2],
      );
      near.push({ j, d });
    }
    near
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j }) => pairs.add(i < j ? `${i}-${j}` : `${j}-${i}`));
  }
  const list = [...pairs].map((p) => p.split("-").map(Number));
  const edgePositions = new Float32Array(list.length * 6);
  const edgeCluster = new Float32Array(list.length * 2);
  list.forEach(([a, b], k) => {
    edgePositions.set(positions.subarray(a * 3, a * 3 + 3), k * 6);
    edgePositions.set(positions.subarray(b * 3, b * 3 + 3), k * 6 + 3);
    edgeCluster[k * 2] = cluster[a];
    edgeCluster[k * 2 + 1] = cluster[b];
  });
  return { edgePositions, edgeCluster };
}

/** Ambient "embedding dust": dense around clusters, sparse in between. */
export function buildDust(count: number) {
  const rand = mulberry32(7);
  const positions = new Float32Array(count * 3);
  const cluster = new Float32Array(count);
  const seed = new Float32Array(count);
  const size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const clustered = rand() < 0.72;
    if (clustered) {
      const ci = Math.floor(rand() * CLUSTERS.length);
      const [cx, cy, cz] = CLUSTERS[ci].position;
      const spread = 0.6 + rand() * 1.1;
      positions[i * 3] = cx + gauss(rand) * spread;
      positions[i * 3 + 1] = cy + gauss(rand) * spread * 0.8;
      positions[i * 3 + 2] = cz + gauss(rand) * spread;
      cluster[i] = ci;
    } else {
      const r = 4 + rand() * 9;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.6;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 2;
      cluster[i] = NEUTRAL;
    }
    seed[i] = rand();
    size[i] = 0.042 + rand() * rand() * 0.1;
  }
  return { positions, cluster, seed, size };
}

/** One point that belongs to no cluster. An easter egg. */
export const OUTLIER: Vec3 = [4.4, 5.3, -2.2];

interface Shot {
  pos: Vec3;
  look: Vec3;
}

const offset = (c: Vec3, d: Vec3): Vec3 => [c[0] + d[0], c[1] + d[1], c[2] + d[2]];
const centre = (id: (typeof CLUSTERS)[number]["id"]) => CLUSTERS[clusterIndex(id)].position;

/** Camera framing per chapter: the request flies through the vector space as the story scrolls. */
export function shotFor(chapter: ChapterId, aspect: number): Shot {
  const portrait = aspect < 0.9;
  const pull = portrait ? 1.8 : 1;
  const near = (id: (typeof CLUSTERS)[number]["id"], d: Vec3): Shot => {
    const c = centre(id);
    return { pos: offset(c, [d[0], d[1], d[2] * pull]), look: c };
  };
  switch (chapter) {
    case "gateway":
      // On wide screens the cloud is framed to the right of the text column.
      return portrait ? { pos: [0, 0.8, 22], look: [0, 0.9, 0] } : { pos: [-3.7, 0.5, 15], look: [-3.5, 0.3, 0] };
    case "services":
      return { pos: [0, 1.8, 9 * pull], look: [0, 1.4, -1] };
    case "pipeline":
      return near("rag", [-1.2, 0.9, 6.2]);
    case "commits":
      return near("experience", [1.4, 0.6, 6]);
    case "deployments":
      return near("projects", [-1.2, 0.5, 6.2]);
    case "judge":
      return { pos: [0, 7.5, 12 * pull], look: [0, 0, -1] };
    case "dependencies":
      return near("education", [1, -0.6, 6]);
    case "releases":
      return { pos: [0, 0.5, 19 * pull], look: [0, 0, -1] };
    case "response":
    default:
      return near("profile", [0.4, 0.6, 7]);
  }
}
