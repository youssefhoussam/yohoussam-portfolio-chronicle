import { chunks } from "@/data/knowledge";

/**
 * Mutable, render-free channel between the DOM layer and the WebGL scene.
 * The scene writes projected screen positions every frame; the DOM reads them
 * for hover and click hit-testing (the canvas itself ignores pointer events).
 */
export const bridge = {
  pointer: { x: 0, y: 0 },
  /** [x, y, visible] per knowledge chunk, in CSS pixels. */
  starScreen: new Float32Array(chunks.length * 3),
  outlierScreen: new Float32Array(3),
  /** Hovered star index, -2 for the outlier, -1 for none. */
  hovered: -1,
  labelEls: [] as (HTMLElement | null)[],
  tooltipEl: null as HTMLElement | null,
  /** Cluster labels left of this x (the hero text column) are hidden. */
  labelMinX: 0,
};

export const OUTLIER_ID = -2;
