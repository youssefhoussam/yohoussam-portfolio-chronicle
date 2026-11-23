import { Component, lazy, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { CLUSTERS, clusterIndex, type ChapterId } from "@/data/chapters";
import { chunks } from "@/data/knowledge";
import { actions, app, useApp } from "@/lib/app";
import { bridge, OUTLIER_ID } from "@/scene/bridge";

const VectorSpace = lazy(() => import("@/scene/VectorSpace"));

/** How visible the vector space is behind each chapter. */
const SCENE_OPACITY: Record<ChapterId, number> = {
  gateway: 1,
  services: 0.6,
  pipeline: 0.45,
  commits: 0.55,
  deployments: 0.55,
  judge: 0.65,
  dependencies: 0.55,
  releases: 0.75,
  response: 0.7,
};

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const isBlocked = (target: EventTarget | null) =>
  target instanceof Element && !!target.closest("a, button, input, textarea, select, label, [role='dialog'], [data-solid]");

function nearestAt(x: number, y: number, radius: number) {
  let best = -1;
  let bestD = radius;
  const s = bridge.starScreen;
  for (let i = 0; i < chunks.length; i++) {
    if (!s[i * 3 + 2]) continue;
    const d = Math.hypot(s[i * 3] - x, s[i * 3 + 1] - y);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  const o = bridge.outlierScreen;
  if (o[2] && Math.hypot(o[0] - x, o[1] - y) < bestD) best = OUTLIER_ID;
  return best;
}

export function SceneLayer() {
  const active = useApp((s) => s.active);
  const webgl = useMemo(() => hasWebGL(), []);
  const titleRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const setHover = (index: number) => {
      if (bridge.hovered === index) return;
      bridge.hovered = index;
      const tip = bridge.tooltipEl;
      document.body.style.cursor = index === -1 ? "" : "pointer";
      if (!tip) return;
      if (index === -1) {
        tip.style.opacity = "0";
        return;
      }
      if (titleRef.current && metaRef.current) {
        if (index === OUTLIER_ID) {
          titleRef.current.textContent = "outlier";
          metaRef.current.textContent = "belongs to no cluster · click";
          metaRef.current.style.color = "#fb7185";
        } else {
          const chunk = chunks[index];
          const cluster = CLUSTERS[clusterIndex(chunk.cluster)];
          titleRef.current.textContent = chunk.title;
          metaRef.current.textContent = `${cluster.label} · click to retrieve`;
          metaRef.current.style.color = cluster.color;
        }
      }
      tip.style.opacity = "1";
    };

    const canHover = () => {
      const s = app.get();
      return s.phase === "ready" && s.active === "gateway" && !s.terminalOpen && !s.menuOpen;
    };

    const onMove = (e: PointerEvent) => {
      bridge.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      bridge.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      if (e.pointerType === "touch") return;
      if (!canHover() || isBlocked(e.target)) return setHover(-1);
      setHover(nearestAt(e.clientX, e.clientY, 18));
    };

    const onClick = (e: MouseEvent) => {
      if (!canHover() || isBlocked(e.target)) return;
      const hit = nearestAt(e.clientX, e.clientY, 26);
      if (hit === -1) return;
      if (hit === OUTLIER_ID) actions.foundOutlier();
      else actions.inspect(hit);
    };

    const onScroll = () => setHover(-1);

    // Cluster labels stay clear of the hero text column (and are hidden on narrow screens).
    const column = document.querySelector("[data-hero-column]");
    const measureColumn = () => {
      if (window.innerWidth < 1024) bridge.labelMinX = window.innerWidth + 1;
      else bridge.labelMinX = column ? column.getBoundingClientRect().right + 16 : 0;
    };
    const ro = new ResizeObserver(measureColumn);
    if (column) ro.observe(column);
    measureColumn();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measureColumn);
    return () => {
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measureColumn);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: SCENE_OPACITY[active] }}>
        {webgl ? (
          <SceneBoundary>
            <Suspense fallback={null}>
              <VectorSpace />
            </Suspense>
          </SceneBoundary>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_40%,rgba(167,139,250,0.14),transparent_70%),radial-gradient(50%_45%_at_25%_65%,rgba(163,230,53,0.1),transparent_70%)]" />
        )}
      </div>

      {/* Legibility: darken behind the text column on wide screens, and fade the edges. */}
      <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(6,7,10,0.82)_0%,rgba(6,7,10,0.45)_38%,transparent_62%)] lg:block" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_55%,rgba(6,7,10,0.85)_100%)]" />

      {CLUSTERS.map((cluster, i) => (
        <div
          key={cluster.id}
          ref={(el) => {
            bridge.labelEls[i] = el;
          }}
          className="absolute left-0 top-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] opacity-0 transition-opacity duration-500"
          style={{ color: cluster.color }}
        >
          {cluster.label}
        </div>
      ))}

      <div
        ref={(el) => {
          bridge.tooltipEl = el;
        }}
        className="absolute left-0 top-0 max-w-[260px] rounded-lg border border-white/10 bg-ink-2/95 px-3 py-2 opacity-0 shadow-2xl transition-opacity duration-150"
      >
        <span ref={titleRef} className="block text-[13px] font-medium leading-snug text-paper" />
        <span ref={metaRef} className="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em]" />
      </div>
    </div>
  );
}
