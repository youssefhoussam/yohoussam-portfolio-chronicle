import type { Chunk } from "@/data/knowledge";

/**
 * A tiny hybrid retriever that runs entirely in the browser:
 *  - BM25 over canonicalised tokens (lexical side)
 *  - cosine similarity over character-trigram vectors (fuzzy, embedding-like side)
 *  - weighted Reciprocal Rank Fusion to merge both rankings
 *  - a grounding "judge" that abstains when the evidence is weak
 */

export type Verdict = "PASS" | "FAIL";

export interface Hit {
  index: number;
  chunk: Chunk;
  bm25: number;
  cosine: number;
  bm25Rank: number | null;
  cosineRank: number | null;
  rrf: number;
  relevance: number;
}

export interface Retrieval {
  query: string;
  terms: string[];
  hits: Hit[];
  /** Normalised relevance per chunk, aligned with the knowledge base order. */
  relevance: Float32Array;
  verdict: Verdict;
  coverage: number;
  answer: string;
  tookMs: number;
  inspected?: boolean;
}

export interface EngineStats {
  chunks: number;
  terms: number;
  dims: number;
  buildMs: number;
}

export const RRF_K = 60;
const COSINE_WEIGHT = 0.6;

export const FALLBACK_ANSWER =
  "I couldn't find grounded evidence for that in my knowledge base, so I won't make something up. Try asking about Spring Boot, the RAG platform, experience, projects or how to get in touch.";

const STOPWORDS = new Set(
  `a an the is are was were be been being am do does did doing done of in on at to for with about as by from into over
  and or but if so than too very can could would should will shall may might must have has had having any some it its
  this that these those there here what which whom whose when how please tell show give know me my mine i you your
  yours he his him she her they them their we us our just also like want get got much many more most let lets im ive
  id youre hes shes thats whats ever really`.split(/\s+/),
);

const CANON_GROUPS: Record<string, string[]> = {
  intro: ["who", "yourself", "himself", "youssef", "houssam", "whoami", "introduce", "introduction", "bio", "background"],
  contact: ["contact", "email", "mail", "gmail", "reach", "message", "touch", "write", "talk", "connect"],
  phone: ["phone", "call", "number", "telephone", "whatsapp"],
  location: ["location", "located", "based", "live", "lives", "living", "city", "country", "where"],
  relocation: ["relocate", "relocation", "relocating", "move", "moving", "abroad", "remote", "onsite"],
  hire: [
    "hire", "hiring", "hired", "recruit", "recruiter", "recruiting", "job", "jobs", "position", "positions", "role", "roles",
    "opportunity", "opportunities", "available", "availability", "open", "looking", "seeking", "fulltime", "employment", "vacancy",
  ],
  next: ["next", "future", "goal", "goals", "plan", "plans", "roadmap", "ambition", "ambitions", "vision", "career", "heading"],
  rag: ["rag", "retrieval", "retrieve", "retrieving", "augmented", "chunk", "chunks", "chunking"],
  ai: ["ai", "llm", "llms", "gpt", "genai", "artificial", "intelligence", "model", "models", "ml", "machine", "learning", "generative"],
  springboot: ["springboot", "spring", "boot"],
  microservice: ["microservice", "microservices", "service", "services"],
  vector: ["vector", "vectors", "embedding", "embeddings", "embed", "semantic", "dense", "similarity"],
  bm25: ["bm25", "keyword", "keywords", "lexical", "sparse"],
  judge: [
    "judge", "llmjudge", "evaluation", "evaluate", "evaluating", "eval", "evals", "score", "scoring", "hallucination",
    "hallucinations", "grounded", "grounding", "verdict",
  ],
  graph: ["graph", "graphrag", "networkx"],
  education: ["education", "degree", "diploma", "graduate", "graduated", "graduation", "study", "studied", "studies", "studying", "school", "university", "student", "college"],
  certification: ["certification", "certifications", "certificate", "certificates", "certified", "course", "courses", "mooc"],
  experience: ["experience", "experiences", "internship", "internships", "intern", "work", "worked", "working", "company", "companies", "employer", "employers"],
  build: ["build", "built", "building", "made", "create", "created", "developed", "develop", "ship", "shipped"],
  project: ["project", "projects"],
  github: ["github", "code", "source", "repo", "repository", "repositories", "opensource"],
  database: ["database", "databases", "db", "sql", "storage"],
  frontend: ["frontend", "ui", "interface", "web"],
  portfolio: ["portfolio", "site", "website", "page"],
  hello: ["hello", "hi", "hey", "bonjour", "salam", "salut", "greetings", "yo", "hola"],
  language: ["language", "languages"],
  global: ["global", "international", "worldwide"],
  team: ["team", "teams", "collaboration", "collaborate", "teamwork"],
  stack: ["stack", "tech", "technology", "technologies", "tool", "tools", "tooling", "skill", "skills", "framework", "frameworks", "expertise"],
  inventory: ["inventory", "stock", "stockmaster", "warehouse"],
  ecommerce: ["ecommerce", "shop", "store", "emsishop", "merchant", "merchants"],
  startup: ["startup", "startups", "incubation", "incubator", "investor", "investors", "pitch"],
  attendance: ["attendance", "presence"],
};

const CANON = new Map<string, string>();
for (const [canon, words] of Object.entries(CANON_GROUPS)) for (const word of words) CANON.set(word, canon);

const PHRASES: [RegExp, string][] = [
  [/\bocp maintenance solutions\b/g, "ocp ocpms"],
  [/\bocp solutions\b/g, "ocp ocpsolutions"],
  [/\buniversity of michigan\b/g, "umich"],
  [/\bspring[\s-]*boot\b/g, "springboot"],
  [/\bllm[\s-]*as[\s-]*a[\s-]*judge\b/g, "llmjudge"],
  [/\bgraph[\s-]*rag\b/g, "graphrag"],
  [/\bsmall[\s-]*to[\s-]*big\b/g, "smalltobig"],
  [/\bfull[\s-]*stack\b/g, "fullstack"],
  [/\bfull[\s-]*time\b/g, "fulltime"],
  [/\bfront[\s-]*end\b/g, "frontend"],
  [/\bback[\s-]*end\b/g, "backend"],
  [/\be[\s-]+mail\b/g, "email"],
  [/\be[\s-]*commerce\b/g, "ecommerce"],
  [/\bstart[\s-]*ups?\b/g, "startup"],
  [/\bopen[\s-]+source\b/g, "opensource"],
  [/\bmulti[\s-]*tenant\b/g, "multitenant"],
  [/c#/g, "csharp"],
  [/asp\.net/g, "aspnet"],
  [/\b(vue|next|node)\.js\b/g, "$1js"],
  [/pl\/sql/g, "plsql"],
  [/ci\/cd/g, "cicd"],
];

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

export function splitWords(text: string): string[] {
  let s = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const [re, rep] of PHRASES) s = s.replace(re, rep);
  return s.split(/[^a-z0-9]+/).filter(Boolean);
}

function stem(word: string): string {
  let w = word;
  if (w.length > 4 && w.endsWith("ies")) w = `${w.slice(0, -3)}y`;
  else if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
  if (w.length > 4 && w.endsWith("e")) w = w.slice(0, -1);
  return w;
}

function canon(word: string): string {
  const direct = CANON.get(word);
  if (direct) return direct;
  const stemmed = stem(word);
  return CANON.get(stemmed) ?? stemmed;
}

export function tokenize(text: string): string[] {
  return splitWords(text)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(canon);
}

/** Optimal-string-alignment (Damerau–Levenshtein) distance with an early exit above `max`. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    rows.push(new Array(b.length + 1).fill(0));
    rows[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d = Math.min(d, rows[i - 2][j - 2] + 1);
      rows[i][j] = d;
      rowMin = Math.min(rowMin, d);
    }
    if (rowMin > max) return max + 1;
  }
  return rows[a.length][b.length];
}

/** How many typos a word of this length may contain and still be corrected. */
const typoBudget = (length: number) => (length < 5 ? 0 : length < 9 ? 1 : length < 12 ? 2 : 3);

function gramVector(text: string): Map<string, number> {
  const vec = new Map<string, number>();
  for (const word of splitWords(text)) {
    if (STOPWORDS.has(word) || word.length < 2) continue;
    const padded = ` ${word} `;
    for (let i = 0; i < padded.length - 2; i++) {
      const g = padded.slice(i, i + 3);
      vec.set(g, (vec.get(g) ?? 0) + 1);
    }
  }
  return vec;
}

function norm(vec: Map<string, number>): number {
  let sum = 0;
  vec.forEach((v) => {
    sum += v * v;
  });
  return Math.sqrt(sum);
}

function dot(a: Map<string, number>, b: Map<string, number>): number {
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  let sum = 0;
  small.forEach((v, g) => {
    const w = large.get(g);
    if (w) sum += v * w;
  });
  return sum;
}

export function createEngine(chunks: Chunk[]) {
  const t0 = now();
  const N = chunks.length;
  const indexText = (c: Chunk) => (c.meta ? "" : c.index ?? c.text);
  const docs = chunks.map((c) => [
    ...tokenize(c.title),
    ...tokenize(c.title),
    ...tokenize(indexText(c)),
    ...tokenize(c.keywords ?? ""),
  ]);
  const docTokenSets = docs.map((d) => new Set(d));
  const tfs = docs.map((terms) => {
    const tf = new Map<string, number>();
    for (const t of terms) tf.set(t, (tf.get(t) ?? 0) + 1);
    return tf;
  });
  const df = new Map<string, number>();
  tfs.forEach((tf) => tf.forEach((_, t) => df.set(t, (df.get(t) ?? 0) + 1)));
  const avgdl = docs.reduce((sum, d) => sum + d.length, 0) / Math.max(1, N);
  const vocab = [...df.keys()];
  // Surface forms (raw words + synonym list) mapped to the indexed term, for typo correction.
  const surface = new Map<string, string>();
  for (const c of chunks) {
    for (const w of splitWords(`${c.title} ${indexText(c)} ${c.keywords ?? ""}`)) {
      if (w.length > 2 && !STOPWORDS.has(w)) surface.set(w, canon(w));
    }
  }
  CANON.forEach((term, w) => {
    if (w.length > 2) surface.set(w, term);
  });
  const surfaceWords = [...surface.keys()].filter((w) => df.has(surface.get(w) as string));
  // Character-trigram vectors weighted by TF-IDF, so common endings like "-ation" carry little signal.
  const rawTri = chunks.map((c) => gramVector(`${c.title} ${indexText(c)} ${c.keywords ?? ""}`));
  const gramDf = new Map<string, number>();
  rawTri.forEach((v) => v.forEach((_, g) => gramDf.set(g, (gramDf.get(g) ?? 0) + 1)));
  const gramIdf = (g: string) => Math.log(1 + N / (gramDf.get(g) ?? N));
  const weigh = (v: Map<string, number>) => {
    const out = new Map<string, number>();
    v.forEach((tf, g) => out.set(g, tf * gramIdf(g)));
    return out;
  };
  const tri = rawTri.map(weigh);
  const triNorm = tri.map(norm);
  const dims = gramDf;

  const stats: EngineStats = { chunks: N, terms: df.size, dims: dims.size, buildMs: now() - t0 };

  function bm25(terms: { term: string; weight: number }[]): Float64Array {
    const k1 = 1.2;
    const b = 0.75;
    const out = new Float64Array(N);
    for (const { term, weight } of terms) {
      const n = df.get(term);
      if (!n) continue;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      for (let i = 0; i < N; i++) {
        const f = tfs[i].get(term);
        if (!f) continue;
        out[i] += (weight * idf * (f * (k1 + 1))) / (f + k1 * (1 - b + (b * docs[i].length) / avgdl));
      }
    }
    return out;
  }

  function expand(words: string[], live: boolean) {
    const terms: { term: string; weight: number }[] = [];
    const content: { term: string; candidates: string[] }[] = [];
    words.forEach((word, i) => {
      if (word.length < 2 || STOPWORDS.has(word)) return;
      const term = canon(word);
      const candidates = [term];
      if (df.has(term)) {
        terms.push({ term, weight: 1 });
      } else {
        // Typo tolerance: snap unknown words to the closest known surface form
        // (same first letter, within an edit budget that grows with word length).
        const budget = typoBudget(word.length);
        let best: string | null = null;
        let bestDistance = budget + 1;
        if (budget > 0) {
          for (const candidate of surfaceWords) {
            if (candidate[0] !== word[0]) continue;
            const d = editDistance(word, candidate, Math.min(budget, bestDistance - 1));
            if (d < bestDistance) {
              bestDistance = d;
              best = candidate;
            }
          }
        }
        if (best) {
          const corrected = surface.get(best) as string;
          terms.push({ term: corrected, weight: 0.85 });
          candidates.push(corrected);
        }
      }
      // While typing, let the last (unfinished) word match vocabulary prefixes.
      if (live && i === words.length - 1 && word.length >= 3) {
        let added = 0;
        for (const v of vocab) {
          if (v !== term && v.startsWith(word)) {
            terms.push({ term: v, weight: 0.6 });
            candidates.push(v);
            if (++added >= 3) break;
          }
        }
      }
      content.push({ term, candidates });
    });
    return { terms, content };
  }

  function compose(hits: Hit[]): string {
    const [first, ...rest] = hits;
    const parts = [first.chunk.text];
    if (first.bm25 > 0) {
      const second = rest.find(
        (h) =>
          h.chunk.parent !== first.chunk.parent &&
          h.chunk.cluster === first.chunk.cluster &&
          h.bm25 > 0.8 &&
          h.bm25 >= 0.7 * first.bm25,
      );
      if (second) parts.push(second.chunk.text);
    }
    return parts.join(" ");
  }

  function search(query: string, opts: { live?: boolean } = {}): Retrieval {
    const start = now();
    const words = splitWords(query);
    const { terms, content } = expand(words, !!opts.live);
    const bm = bm25(terms);

    const qv = weigh(gramVector(query));
    const qn = norm(qv);
    const cos = new Float64Array(N);
    if (qn > 0) for (let i = 0; i < N; i++) cos[i] = dot(qv, tri[i]) / (qn * triNorm[i] || 1);

    const ids = [...Array(N).keys()];
    const bmOrder = ids.filter((i) => bm[i] > 0).sort((a, b) => bm[b] - bm[a]);
    const cosOrder = ids
      .filter((i) => cos[i] >= 0.1)
      .sort((a, b) => cos[b] - cos[a])
      .slice(0, 12);

    const rrf = new Float64Array(N);
    const bmRank = new Map<number, number>();
    const cosRank = new Map<number, number>();
    bmOrder.forEach((i, r) => {
      rrf[i] += 1 / (RRF_K + r + 1);
      bmRank.set(i, r + 1);
    });
    cosOrder.forEach((i, r) => {
      rrf[i] += COSINE_WEIGHT / (RRF_K + r + 1);
      cosRank.set(i, r + 1);
    });

    const fused = ids
      .filter((i) => rrf[i] > 0)
      .sort((a, b) => rrf[b] - rrf[a] || bm[b] - bm[a])
      .slice(0, 5);

    const relevance = new Float32Array(N);
    const topScore = fused.length ? rrf[fused[0]] : 1;
    const hits: Hit[] = fused.map((i) => {
      const rel = rrf[i] / topScore;
      relevance[i] = rel;
      return {
        index: i,
        chunk: chunks[i],
        bm25: bm[i],
        cosine: cos[i],
        bm25Rank: bmRank.get(i) ?? null,
        cosineRank: cosRank.get(i) ?? null,
        rrf: rrf[i],
        relevance: rel,
      };
    });

    // Grounding check: how much of the question is actually covered by the evidence?
    const pool = new Set<string>();
    fused.slice(0, 3).forEach((i) => docTokenSets[i].forEach((t) => pool.add(t)));
    const covered = content.filter((c) => c.candidates.some((t) => pool.has(t))).length;
    const coverage = content.length ? covered / content.length : 0;
    const top = hits[0];
    const strong = !!top && (top.bm25 >= 1.4 || top.cosine >= 0.32);
    const verdict: Verdict = strong && coverage >= 0.5 ? "PASS" : "FAIL";

    return {
      query,
      terms: [...new Set(terms.map((t) => t.term))],
      hits,
      relevance,
      verdict,
      coverage,
      answer: verdict === "PASS" ? compose(hits) : FALLBACK_ANSWER,
      tookMs: now() - start,
    };
  }

  function inspect(index: number): Retrieval {
    const relevance = new Float32Array(N);
    relevance[index] = 1;
    const chunk = chunks[index];
    return {
      query: chunk.title,
      terms: [],
      hits: [{ index, chunk, bm25: 0, cosine: 1, bm25Rank: null, cosineRank: null, rrf: 0, relevance: 1 }],
      relevance,
      verdict: "PASS",
      coverage: 1,
      answer: chunk.text,
      tookMs: 0,
      inspected: true,
    };
  }

  return { search, inspect, stats };
}

export type Engine = ReturnType<typeof createEngine>;
