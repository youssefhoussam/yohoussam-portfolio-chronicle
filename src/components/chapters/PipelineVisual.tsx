import { motion } from "framer-motion";

const N = 48;
// Chunks are told apart by lightness, not hue; amber marks what the pipeline selects.
const CHUNK_COLORS = ["#f4f1ea", "#cfc8bb", "#a9a397", "#e2dccf", "#bab3a6", "#958f84"];
const PAPER = "#f4f1ea";
const LIME = "#f5a524";
const VIOLET = "#f4f1ea";

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Cell {
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  fill: string;
  opacity: number;
}

// ── Precomputed geometry for every step ─────────────────────────────────────
const rand = seeded(42);
const chunkOf = (i: number) => Math.floor(i / 8);

/** Step 0: a parsed document page. Rows 6–8 form a table, as Docling extracts it. */
const docCells: Cell[] = (() => {
  const cells: Cell[] = [];
  for (let r = 0; r < 12; r++) {
    const isTitle = r === 0;
    const isTable = r >= 6 && r <= 8;
    const paragraphEnd = r === 5 || r === 11;
    const raw = [0, 1, 2, 3].map(() => 26 + rand() * 30);
    const visible = isTitle ? 3 : paragraphEnd ? 2 : 4;
    const target = isTable ? 4 * 45 : paragraphEnd ? 120 : isTitle ? 150 : 200 - 18;
    const sum = raw.slice(0, visible).reduce((a, b) => a + b, 0);
    let x = 100;
    for (let c = 0; c < 4; c++) {
      const width = c < visible ? (isTable ? 45 : (raw[c] / sum) * target) : 0;
      cells.push({
        x,
        y: 62 + r * 24 - (isTitle ? 3 : isTable ? 4 : 0),
        width: Math.max(width, 0.01),
        height: isTitle ? 11 : isTable ? 14 : 6,
        rx: isTable ? 1.5 : 3,
        fill: PAPER,
        opacity: c < visible ? (isTable ? 0.32 : isTitle ? 0.95 : 0.7) : 0,
      });
      x += width + (isTable ? 5 : 6);
    }
  }
  return cells;
})();

const CHUNK_ORIGINS = [0, 1, 2, 3, 4, 5].map((c) => ({ x: 28 + (c % 3) * 118, y: 96 + Math.floor(c / 3) * 128 }));

/** Step 1: two document rows per chunk (Small-to-Big: small cells, big parent card). */
const chunkCells: Cell[] = Array.from({ length: N }, (_, i) => {
  const c = chunkOf(i);
  const k = i % 8;
  const o = CHUNK_ORIGINS[c];
  return {
    x: o.x + 10 + (k % 2) * 45,
    y: o.y + 16 + Math.floor(k / 2) * 21,
    width: 38,
    height: 7,
    rx: 3.5,
    fill: i === 9 ? LIME : CHUNK_COLORS[c],
    opacity: i === 9 ? 1 : 0.7,
  };
});

const CLUSTER_CENTRES = [
  { x: 108, y: 118 },
  { x: 292, y: 104 },
  { x: 84, y: 262 },
  { x: 204, y: 206 },
  { x: 318, y: 268 },
  { x: 196, y: 322 },
];

const gauss = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/** Step 2: embeddings, one point per chunk cell, grouped by meaning. */
const scatter = Array.from({ length: N }, (_, i) => {
  const c = CLUSTER_CENTRES[chunkOf(i)];
  return { x: c.x + gauss() * 22, y: c.y + gauss() * 20 };
});

const QUERY = { x: 226, y: 186 };
const byDistance = (from: { x: number; y: number }) =>
  scatter.map((p, i) => ({ i, d: Math.hypot(p.x - from.x, p.y - from.y) })).sort((a, b) => a.d - b.d);
const TOP = byDistance(QUERY)
  .slice(0, 5)
  .map((d) => d.i);
const GRAPH = (() => {
  const picked = new Set(TOP);
  const extra: number[] = [];
  for (const t of TOP.slice(0, 3)) {
    const next = byDistance(scatter[t]).find((d) => !picked.has(d.i) && chunkOf(d.i) !== chunkOf(t));
    if (next) {
      picked.add(next.i);
      extra.push(next.i);
    }
  }
  return extra;
})();
const SELECTED = [...TOP, ...GRAPH];
const GRAPH_EDGES: [number, number][] = [
  ...TOP.slice(1).map((t, k) => [TOP[k], t] as [number, number]),
  ...GRAPH.map((g, k) => [TOP[k], g] as [number, number]),
];

const TOKEN_WIDTHS = [36, 22, 44, 28, 38, 18, 32, 40];
const tokens = (() => {
  let x = 200 - (TOKEN_WIDTHS.reduce((a, b) => a + b, 0) + 6 * (TOKEN_WIDTHS.length - 1)) / 2;
  return TOKEN_WIDTHS.map((w) => {
    const t = { x, w };
    x += w + 6;
    return t;
  });
})();

function cellFor(step: number, i: number): Cell {
  const c = chunkOf(i);
  const p = scatter[i];
  const dot = (size: number, fill: string, opacity: number): Cell => ({
    x: p.x - size / 2,
    y: p.y - size / 2,
    width: size,
    height: size,
    rx: size / 2,
    fill,
    opacity,
  });
  const sel = SELECTED.indexOf(i);
  switch (step) {
    case 0:
      return docCells[i];
    case 1:
      return chunkCells[i];
    case 2:
      return dot(9, CHUNK_COLORS[c], 0.85);
    case 3:
      return {
        x: 66 + (i % 8) * 36,
        y: 108 + Math.floor(i / 8) * 36,
        width: 16,
        height: 16,
        rx: 3,
        fill: CHUNK_COLORS[c],
        opacity: 0.6,
      };
    case 4:
      return TOP.includes(i) ? dot(12, LIME, 1) : dot(8, CHUNK_COLORS[c], 0.22);
    case 5:
      return TOP.includes(i) ? dot(12, LIME, 1) : GRAPH.includes(i) ? dot(11, VIOLET, 1) : dot(8, CHUNK_COLORS[c], 0.16);
    case 6:
    case 7:
      if (sel >= 0) {
        const t = tokens[sel];
        return {
          x: t.x,
          y: 223,
          width: t.w,
          height: 14,
          rx: 7,
          fill: step === 7 ? LIME : sel < TOP.length ? LIME : VIOLET,
          opacity: 1,
        };
      }
      return dot(6, CHUNK_COLORS[c], step === 7 ? 0 : 0.07);
    default:
      return docCells[i];
  }
}

const LABELS = [
  "report.pdf → docling · layout + tables",
  "small-to-big · 6 chunks · parent kept for context",
  "embeddings · 48 vectors",
  "milvus · collection indexed · minio · object storage",
  "hybrid search · semantic ⊕ bm25 → rrf",
  "graph rag · +3 related entities via networkx",
  "vllm · answer grounded in 8 chunks",
  "llm-as-a-judge · verdict",
];

const spring = { type: "spring" as const, stiffness: 110, damping: 19, mass: 0.9 };

export function PipelineVisual({ step }: { step: number }) {
  const show = (on: boolean) => ({ opacity: on ? 1 : 0, transition: { duration: 0.45 } });
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label={`Pipeline step: ${LABELS[step]}`}>
      <defs>
        <radialGradient id="pv-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={LIME} stopOpacity="0.28" />
          <stop offset="100%" stopColor={LIME} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* step 0: the page */}
      <motion.rect x={80} y={40} width={240} height={320} rx={12} fill="#ffffff" fillOpacity={0.025} stroke="#ffffff" strokeOpacity={0.14} initial={false} animate={show(step === 0)} />

      {/* step 1: chunk cards (the "big" parents) */}
      {CHUNK_ORIGINS.map((o, c) => (
        <motion.rect
          key={c}
          x={o.x}
          y={o.y}
          width={104}
          height={112}
          rx={10}
          fill={CHUNK_COLORS[c]}
          fillOpacity={0.04}
          stroke={c === 1 ? LIME : CHUNK_COLORS[c]}
          strokeOpacity={c === 1 ? 0.9 : 0.3}
          strokeDasharray={c === 1 ? undefined : "3 4"}
          initial={false}
          animate={show(step === 1)}
        />
      ))}

      {/* step 3: index frame */}
      <motion.rect x={52} y={94} width={296} height={226} rx={12} fill="none" stroke="#ffffff" strokeOpacity={0.12} initial={false} animate={show(step === 3)} />

      {/* step 4-5: query probe */}
      <motion.g initial={false} animate={show(step === 4 || step === 5)}>
        <circle cx={QUERY.x} cy={QUERY.y} r={44} fill="url(#pv-glow)" />
        <circle cx={QUERY.x} cy={QUERY.y} r={30} fill="none" stroke={LIME} strokeOpacity={0.35} strokeDasharray="2 4" />
        <circle cx={QUERY.x} cy={QUERY.y} r={5} fill="#ffffff" />
        <text x={QUERY.x + 10} y={QUERY.y - 10} fontSize={10} className="font-mono" fill={LIME}>
          query
        </text>
      </motion.g>
      <motion.g initial={false} animate={show(step === 4 || step === 5)}>
        {TOP.map((t) => (
          <line key={t} x1={QUERY.x} y1={QUERY.y} x2={scatter[t].x} y2={scatter[t].y} stroke={LIME} strokeOpacity={0.35} />
        ))}
      </motion.g>

      {/* step 5: graph edges */}
      <motion.g initial={false} animate={show(step === 5)}>
        {GRAPH_EDGES.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={scatter[a].x} y1={scatter[a].y} x2={scatter[b].x} y2={scatter[b].y} stroke={VIOLET} strokeOpacity={0.55} strokeWidth={1.2} />
        ))}
      </motion.g>

      {/* the 48 cells that flow through every stage */}
      {Array.from({ length: N }, (_, i) => {
        const c = cellFor(step, i);
        return (
          <motion.rect
            key={i}
            x={0}
            y={0}
            initial={false}
            animate={{ x: c.x, y: c.y, width: c.width, height: c.height, rx: c.rx, fill: c.fill, opacity: c.opacity }}
            transition={{ ...spring, delay: (i % 16) * 0.008 }}
          />
        );
      })}

      {/* step 6: streaming cursor */}
      <motion.rect x={tokens[tokens.length - 1].x + tokens[tokens.length - 1].w + 6} y={222} width={2} height={16} fill={PAPER} initial={false} animate={step === 6 ? { opacity: [0, 1, 0] } : { opacity: 0 }} transition={step === 6 ? { repeat: Infinity, duration: 1 } : { duration: 0.2 }} />

      {/* step 7: the verdict */}
      <motion.g initial={false} animate={step === 7 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }} transition={{ duration: 0.45 }}>
        <rect x={138} y={128} width={124} height={46} rx={23} fill={LIME} fillOpacity={0.12} stroke={LIME} strokeOpacity={0.7} />
        <path d="M160 151 l7 7 l13 -14" fill="none" stroke={LIME} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        <text x={190} y={156} fontSize={15} className="font-mono" fill={LIME} fontWeight={600} letterSpacing="0.12em">
          PASS
        </text>
        <text x={200} y={276} fontSize={10} textAnchor="middle" className="font-mono" fill={PAPER} fillOpacity={0.5}>
          faithful · relevant · grounded
        </text>
      </motion.g>

      <text x={200} y={388} textAnchor="middle" fontSize={10.5} className="font-mono" fill={PAPER} fillOpacity={0.45}>
        {LABELS[step]}
      </text>
    </svg>
  );
}
