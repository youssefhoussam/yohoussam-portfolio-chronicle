import type { ChapterId } from "@/data/chapters";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scroll to a chapter. (The app uses a HashRouter, so in-page `#anchors` must not be used.) */
export function scrollToChapter(id: ChapterId) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

export function scrollToY(y: number) {
  window.scrollTo({ top: y, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/** Deterministic short hash, used for fake-but-stable git commit ids. */
export function shortHash(input: string, length = 7) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  let out = (h >>> 0).toString(16);
  while (out.length < length) out += ((h = Math.imul(h ^ out.length, 0x01000193)) >>> 0).toString(16);
  return out.slice(0, length);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
