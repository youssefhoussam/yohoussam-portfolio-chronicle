import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { crossLinks, skillNamespaces, type NamespaceId } from "@/data/portfolio";
import { actions } from "@/lib/app";
import { prefersReducedMotion } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface SimNode {
  id: string;
  label: string;
  kind: "root" | "hub" | "leaf";
  ns: NamespaceId | null;
  note?: string;
  color: string;
  r: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
  ax: number;
  ay: number;
  hub: number;
  /** Estimated label width, for label-aware collisions. */
  lw: number;
}

interface SimLink {
  a: number;
  b: number;
  len: number;
  k: number;
  kind: "spine" | "leaf" | "cross";
}

interface Packet {
  el: SVGCircleElement;
  hub: number;
  leaf: number;
  start: number;
  duration: number;
}

const ANCHORS: [number, number][] = [
  [0.26, 0.28],
  [0.74, 0.28],
  [0.26, 0.76],
  [0.74, 0.76],
];

/** Phones get a zig-zag column so labels never collide. */
const COMPACT_ANCHORS: [number, number][] = [
  [0.3, 0.13],
  [0.66, 0.38],
  [0.3, 0.63],
  [0.66, 0.88],
];

interface Forces {
  hub: number;
  leaf: number;
}

function buildGraph(W: number, H: number, compact: boolean) {
  const anchors = compact ? COMPACT_ANCHORS : ANCHORS;
  const nodes: SimNode[] = [];
  const links: SimLink[] = [];
  const cx = W / 2;
  const cy = H / 2;
  const charW = compact ? 7 : 6.6;
  nodes.push({ id: "root", label: "youssef", kind: "root", ns: null, color: "#ecebe7", r: compact ? 17 : 20, x: cx, y: cy, vx: 0, vy: 0, fx: null, fy: null, ax: cx, ay: cy, hub: 0, lw: 0 });
  skillNamespaces.forEach((ns, k) => {
    const ax = anchors[k][0] * W;
    const ay = anchors[k][1] * H;
    const hub = nodes.length;
    nodes.push({ id: `hub:${ns.id}`, label: ns.label, kind: "hub", ns: ns.id, color: ns.color, r: compact ? 10 : 12, x: ax, y: ay, vx: 0, vy: 0, fx: null, fy: null, ax, ay, hub, lw: 0 });
    links.push({ a: 0, b: hub, len: compact ? 150 : 175, k: compact ? 0.15 : 0.4, kind: "spine" });
    ns.skills.forEach((s, j) => {
      const angle = (j / ns.skills.length) * Math.PI * 2 + k;
      const radius = compact ? 58 : 84;
      nodes.push({
        id: s.name,
        label: s.name,
        kind: "leaf",
        ns: ns.id,
        note: s.note,
        color: ns.color,
        r: compact ? 4.5 : 5,
        x: ax + Math.cos(angle) * radius,
        y: ay + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
        ax,
        ay,
        hub,
        lw: s.name.length * charW + 10,
      });
      links.push({ a: hub, b: nodes.length - 1, len: compact ? 48 : 70, k: 0.6, kind: "leaf" });
    });
  });
  for (const [p, q] of crossLinks) {
    const a = nodes.findIndex((n) => n.id === p);
    const b = nodes.findIndex((n) => n.id === q);
    if (a > 0 && b > 0) links.push({ a, b, len: 110, k: 0.04, kind: "cross" });
  }
  return { nodes, links };
}

/** Leaf labels point away from their hub, like a radial layout. */
const labelOnLeft = (n: SimNode, nodes: SimNode[]) => n.kind === "leaf" && n.x < nodes[n.hub].x - 2;

/** Horizontal extent [x0, x1] and vertical centre of a node including its label or caption. */
function extent(n: SimNode, left: boolean): [number, number, number] {
  if (n.kind === "leaf") return left ? [n.x - n.r - 6 - n.lw, n.x + n.r, n.y] : [n.x - n.r, n.x + n.r + 6 + n.lw, n.y];
  return [n.x - 34, n.x + 34, n.y + 8];
}

function tick(nodes: SimNode[], links: SimLink[], alpha: number, W: number, H: number, forces: Forces) {
  const sides = nodes.map((n) => labelOnLeft(n, nodes));
  for (const l of links) {
    const a = nodes[l.a];
    const b = nodes[l.b];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.hypot(dx, dy) || 0.01;
    const f = ((d - l.len) / d) * l.k * alpha * 0.5;
    b.vx -= dx * f;
    b.vy -= dy * f;
    a.vx += dx * f;
    a.vy += dy * f;
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let d2 = dx * dx + dy * dy;
      if (d2 < 0.01) {
        dx = Math.random() - 0.5;
        dy = Math.random() - 0.5;
        d2 = dx * dx + dy * dy;
      }
      if (d2 > 200 * 200) continue;
      const d = Math.sqrt(d2);
      const both = a.kind === "leaf" && b.kind === "leaf";
      let f = ((both ? forces.leaf : forces.hub) * alpha) / d2;
      const minD = a.r + b.r + (both ? 16 : 28);
      if (d < minD) f += ((minD - d) / d) * 0.18;
      const ux = dx * f;
      const uy = dy * f;
      a.vx -= ux;
      a.vy -= uy;
      b.vx += ux;
      b.vy += uy;
      // Label-aware collision: if two labels (or a label and a hub caption) share a row
      // and overlap horizontally, push them apart vertically.
      const ea = extent(a, sides[i]);
      const eb = extent(b, sides[j]);
      const overlap = Math.min(ea[1], eb[1]) - Math.max(ea[0], eb[0]);
      const rowGap = eb[2] - ea[2];
      const minGap = both ? 16 : 26;
      if (overlap > 0 && Math.abs(rowGap) < minGap) {
        const push = (minGap - Math.abs(rowGap)) * 0.25 * (rowGap >= 0 ? 1 : -1);
        if (a.kind !== "root") a.vy -= push;
        if (b.kind !== "root") b.vy += push;
      }
    }
  }
  nodes.forEach((n, i) => {
    const pull = n.kind === "root" ? 0.12 : n.kind === "hub" ? 0.05 : 0.012;
    n.vx += (n.ax - n.x) * pull * alpha;
    n.vy += (n.ay - n.y) * pull * alpha;
    if (n.fx !== null && n.fy !== null) {
      n.x = n.fx;
      n.y = n.fy;
      n.vx = 0;
      n.vy = 0;
      return;
    }
    n.vx *= 0.62;
    n.vy *= 0.62;
    // Keep each label inside the canvas on whichever side it is drawn.
    const leftRoom = n.kind === "leaf" && sides[i] ? n.lw + 10 : 6;
    const rightRoom = n.kind === "leaf" && !sides[i] ? n.lw + 10 : 6;
    n.x = Math.min(W - n.r - rightRoom, Math.max(n.r + leftRoom, n.x + n.vx));
    n.y = Math.min(H - n.r - (n.kind === "leaf" ? 16 : 26), Math.max(n.r + 16, n.y + n.vy));
  });
}

export function ServiceMesh({ selected, onRequest }: { selected: NamespaceId | null; onRequest: (ns: NamespaceId) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const packetsRef = useRef<SVGGElement>(null);
  const [compact, setCompact] = useState(false);
  const W = compact ? 400 : 760;
  const H = compact ? 720 : 560;
  const forces = useMemo<Forces>(() => (compact ? { hub: 420, leaf: 200 } : { hub: 900, leaf: 360 }), [compact]);
  const graph = useMemo(() => buildGraph(W, H, compact), [W, H, compact]);
  const nodeEls = useRef<(SVGGElement | null)[]>([]);
  const linkEls = useRef<(SVGLineElement | null)[]>([]);
  const labelEls = useRef<(SVGTextElement | null)[]>([]);
  const labelSides = useRef<boolean[]>([]);
  const sim = useRef({ alpha: 1, running: false, visible: false, raf: 0, drag: -1, moved: 0, start: { x: 0, y: 0 } });
  const packets = useRef<Packet[]>([]);
  const [hover, setHover] = useState<number>(-1);
  const reduce = useMemo(() => prefersReducedMotion(), []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 600));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const render = useCallback(() => {
    const { nodes, links } = graph;
    nodes.forEach((n, i) => {
      nodeEls.current[i]?.setAttribute("transform", `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`);
      const label = labelEls.current[i];
      if (!label) return;
      const left = labelOnLeft(n, nodes);
      if (labelSides.current[i] === left) return;
      labelSides.current[i] = left;
      label.setAttribute("text-anchor", left ? "end" : "start");
      label.setAttribute("x", String(left ? -(n.r + 6) : n.r + 6));
    });
    links.forEach((l, i) => {
      const el = linkEls.current[i];
      if (!el) return;
      el.setAttribute("x1", nodes[l.a].x.toFixed(1));
      el.setAttribute("y1", nodes[l.a].y.toFixed(1));
      el.setAttribute("x2", nodes[l.b].x.toFixed(1));
      el.setAttribute("y2", nodes[l.b].y.toFixed(1));
    });
  }, [graph]);

  const loop = useCallback(() => {
    const s = sim.current;
    const { nodes, links } = graph;
    const now = performance.now();
    if (s.alpha > 0.004 || s.drag >= 0) {
      tick(nodes, links, Math.max(s.alpha, s.drag >= 0 ? 0.25 : 0), W, H, forces);
      s.alpha *= 0.985;
    }
    // Request packets travel gateway → namespace hub → service.
    packets.current = packets.current.filter((p) => {
      const t = (now - p.start) / p.duration;
      if (t < 0) return true;
      if (t >= 1) {
        p.el.remove();
        const leaf = nodeEls.current[p.leaf];
        leaf?.classList.add("ping");
        window.setTimeout(() => leaf?.classList.remove("ping"), 650);
        return false;
      }
      const from = t < 0.5 ? nodes[0] : nodes[p.hub];
      const to = t < 0.5 ? nodes[p.hub] : nodes[p.leaf];
      const k = t < 0.5 ? t * 2 : (t - 0.5) * 2;
      p.el.setAttribute("cx", (from.x + (to.x - from.x) * k).toFixed(1));
      p.el.setAttribute("cy", (from.y + (to.y - from.y) * k).toFixed(1));
      p.el.setAttribute("opacity", "1");
      return true;
    });
    render();
    if (s.visible && (s.alpha > 0.004 || s.drag >= 0 || packets.current.length)) {
      s.raf = requestAnimationFrame(loop);
    } else {
      s.running = false;
    }
  }, [graph, render, W, H, forces]);

  const wake = useCallback(
    (alpha = 0.3) => {
      const s = sim.current;
      s.alpha = Math.max(s.alpha, alpha);
      if (!s.running && s.visible) {
        s.running = true;
        s.raf = requestAnimationFrame(loop);
      }
    },
    [loop],
  );

  // Pre-settle the layout so it never starts as a tangle, then animate the rest.
  useEffect(() => {
    const { nodes, links } = graph;
    const s = sim.current;
    s.alpha = 1;
    labelSides.current = [];
    for (let i = 0; i < (reduce ? 450 : 260); i++) {
      tick(nodes, links, Math.max(s.alpha, 0.02), W, H, forces);
      s.alpha *= 0.985;
    }
    render();
    if (reduce) s.alpha = 0;
    wake(reduce ? 0 : s.alpha);
    return () => {
      cancelAnimationFrame(s.raf);
      s.running = false;
    };
  }, [graph, render, wake, reduce, W, H, forces]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      sim.current.visible = entry.isIntersecting;
      if (entry.isIntersecting) wake(0.05);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [wake]);

  // Fire request packets when a namespace is selected.
  useEffect(() => {
    if (!selected || !packetsRef.current || reduce) return;
    const { nodes } = graph;
    const hub = nodes.findIndex((n) => n.id === `hub:${selected}`);
    const color = nodes[hub]?.color ?? "#fff";
    const now = performance.now();
    nodes.forEach((n, i) => {
      if (n.kind !== "leaf" || n.ns !== selected) return;
      const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      el.setAttribute("r", "3");
      el.setAttribute("fill", color);
      el.setAttribute("opacity", "0");
      el.setAttribute("style", `filter: drop-shadow(0 0 4px ${color})`);
      packetsRef.current?.appendChild(el);
      packets.current.push({ el, hub, leaf: i, start: now + packets.current.length * 55, duration: 700 });
    });
    wake(0.02);
  }, [selected, graph, wake, reduce]);

  const toSvg = (e: ReactPointerEvent) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };

  const onNodeDown = (index: number) => (e: ReactPointerEvent<SVGGElement>) => {
    e.preventDefault();
    svgRef.current?.setPointerCapture(e.pointerId);
    const s = sim.current;
    const p = toSvg(e);
    s.drag = index;
    s.moved = 0;
    s.start = p;
    const n = graph.nodes[index];
    n.fx = n.x;
    n.fy = n.y;
    wake(0.3);
  };

  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const s = sim.current;
    if (s.drag < 0) return;
    const p = toSvg(e);
    const n = graph.nodes[s.drag];
    n.fx = p.x;
    n.fy = p.y;
    s.moved = Math.max(s.moved, Math.hypot(p.x - s.start.x, p.y - s.start.y));
    wake(0.3);
  };

  const onUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    const s = sim.current;
    if (s.drag < 0) return;
    const n = graph.nodes[s.drag];
    n.fx = null;
    n.fy = null;
    if (s.moved > 12) actions.unlock("mesh");
    else if (n.kind === "hub" && n.ns) onRequest(n.ns);
    s.drag = -1;
    svgRef.current?.releasePointerCapture(e.pointerId);
    wake(0.25);
  };

  const neighbours = useMemo(() => {
    if (hover < 0) return null;
    const set = new Set<number>([hover]);
    graph.links.forEach((l) => {
      if (l.a === hover) set.add(l.b);
      if (l.b === hover) set.add(l.a);
    });
    return set;
  }, [hover, graph]);

  const hovered = hover >= 0 ? graph.nodes[hover] : null;

  return (
    <div ref={wrapRef} className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full select-none"
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        role="img"
        aria-label={`Service mesh of skills: ${skillNamespaces.map((ns) => `${ns.title}: ${ns.skills.map((s) => s.name).join(", ")}`).join(". ")}`}
      >
        <g>
          {graph.links.map((l, i) => {
            const lit = neighbours ? neighbours.has(l.a) && neighbours.has(l.b) : selected ? graph.nodes[l.b].ns === selected : false;
            return (
              <line
                key={i}
                ref={(el) => {
                  linkEls.current[i] = el;
                }}
                stroke={lit ? graph.nodes[l.b].color : "#ffffff"}
                strokeOpacity={lit ? 0.6 : l.kind === "cross" ? 0.06 : 0.12}
                strokeWidth={l.kind === "spine" ? 1.4 : 1}
                strokeDasharray={l.kind === "cross" ? "2 4" : undefined}
              />
            );
          })}
        </g>
        <g ref={packetsRef} />
        <g>
          {graph.nodes.map((n, i) => {
            const dim = neighbours ? !neighbours.has(i) : selected ? n.kind === "leaf" && n.ns !== selected : false;
            return (
              <g
                key={n.id}
                ref={(el) => {
                  nodeEls.current[i] = el;
                }}
                onPointerDown={onNodeDown(i)}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(-1)}
                className="mesh-node cursor-grab touch-none active:cursor-grabbing"
                style={{ opacity: dim ? 0.28 : 1, transition: "opacity 200ms" }}
              >
                <circle r={n.r + 10} fill="transparent" />
                {n.kind === "root" && <circle r={n.r + 7} fill="none" stroke="#ecebe7" strokeOpacity={0.15} className="mesh-orbit" />}
                <circle
                  r={n.r}
                  fill={n.kind === "leaf" ? n.color : "#06070a"}
                  stroke={n.color}
                  strokeWidth={n.kind === "leaf" ? 0 : 1.5}
                  className="mesh-dot"
                  style={{ filter: n.kind === "leaf" ? `drop-shadow(0 0 5px ${n.color}66)` : undefined }}
                />
                {n.kind === "root" && (
                  <text textAnchor="middle" dy="0.35em" className="fill-paper font-mono" fontSize={compact ? 10 : 11}>
                    yh
                  </text>
                )}
                {n.kind === "leaf" ? (
                  <text
                    ref={(el) => {
                      labelEls.current[i] = el;
                    }}
                    x={n.r + 6}
                    dy="0.35em"
                    className="fill-paper/80"
                    fontSize={compact ? 12.5 : 12}
                  >
                    {n.label}
                  </text>
                ) : (
                  <text
                    y={n.r + (compact ? 15 : 17)}
                    textAnchor="middle"
                    className="font-mono uppercase"
                    fill={n.color}
                    fontSize={compact ? 10 : 10.5}
                    letterSpacing="0.14em"
                  >
                    {n.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      {hovered && hovered.kind === "leaf" && hovered.note && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-white/10 bg-ink-2/95 px-2.5 py-1.5 text-[12px] text-paper shadow-xl"
          style={{ left: `${(hovered.x / W) * 100}%`, top: `calc(${(hovered.y / H) * 100}% - 12px)` }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: hovered.color }}>
            {hovered.label}
          </span>
          <span className="ml-2 text-dim">{hovered.note}</span>
        </div>
      )}
    </div>
  );
}

export function NamespaceButtons({ selected, onRequest }: { selected: NamespaceId | null; onRequest: (ns: NamespaceId) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {skillNamespaces.map((ns) => (
        <button
          key={ns.id}
          onClick={() => onRequest(ns.id)}
          aria-pressed={selected === ns.id}
          className={cn(
            "rounded-full border px-3 py-1.5 font-mono text-[11px] transition",
            selected === ns.id ? "text-ink" : "border-white/10 text-dim hover:border-white/25 hover:text-paper",
          )}
          style={selected === ns.id ? { background: ns.color, borderColor: ns.color } : undefined}
        >
          GET /{ns.label}
        </button>
      ))}
    </div>
  );
}
