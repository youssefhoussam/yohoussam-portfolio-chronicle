import { ACHIEVEMENT_MAP, type AchievementId } from "@/data/achievements";
import { CHAPTERS, type ChapterId, type ClusterId } from "@/data/chapters";
import { PERSONAS, type Persona } from "@/data/personas";
import { engine } from "./engine";
import { load, save } from "./persist";
import type { Retrieval } from "./retrieval";
import { createStore, useStore } from "./store";

export interface Toast {
  id: number;
  kind: "achievement" | "info";
  title: string;
  body?: string;
  achievement?: AchievementId;
}

export interface AppState {
  phase: "boot" | "ready";
  /** Incremented each time the intro is replayed, so the boot sequence remounts fresh. */
  bootCount: number;
  persona: Persona | null;
  active: ChapterId;
  progress: Record<ChapterId, number>;
  /** Retrieval for whatever is in the search box right now (drives the 3D scene). */
  live: Retrieval | null;
  /** The last submitted question and its answer. */
  answer: Retrieval | null;
  focusCluster: ClusterId | null;
  /** Bumped on every keystroke so the vector space can ripple. */
  pulse: number;
  terminalOpen: boolean;
  menuOpen: boolean;
  guideOpen: boolean;
  debug: boolean;
  unlocked: AchievementId[];
  toasts: Toast[];
  composerPrefill: string | null;
}

const initialProgress = Object.fromEntries(CHAPTERS.map((c) => [c.id, 0])) as Record<ChapterId, number>;

export const app = createStore<AppState>({
  phase: "boot",
  bootCount: 0,
  persona: load<Persona | null>("persona", null),
  active: "gateway",
  progress: initialProgress,
  live: null,
  answer: null,
  focusCluster: null,
  pulse: 0,
  terminalOpen: false,
  menuOpen: false,
  guideOpen: false,
  debug: false,
  unlocked: load<AchievementId[]>("achievements", []).filter((id) => id in ACHIEVEMENT_MAP),
  toasts: [],
  composerPrefill: null,
});

export const useApp = <S>(selector: (state: AppState) => S) => useStore(app, selector);

let toastId = 0;

function pushToast(toast: Omit<Toast, "id">, ttl = 4200) {
  const id = ++toastId;
  app.set((s) => ({ toasts: [...s.toasts.slice(-2), { ...toast, id }] }));
  window.setTimeout(() => app.set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), ttl);
}

export const actions = {
  finishBoot(persona?: Persona | null) {
    if (persona) actions.setPersona(persona, { silent: true });
    app.set({ phase: "ready" });
    save("visited", true);
    if (persona) actions.unlock("handshake");
  },

  replayBoot() {
    app.set((s) => ({ phase: "boot", bootCount: s.bootCount + 1, terminalOpen: false, menuOpen: false, guideOpen: false }));
    window.scrollTo({ top: 0 });
  },

  setPersona(persona: Persona, opts: { silent?: boolean } = {}) {
    app.set({ persona });
    save("persona", persona);
    if (!opts.silent) actions.toast(`Viewing as ${PERSONAS[persona].label}`, PERSONAS[persona].blurb);
  },

  typeQuery(query: string) {
    const live = query.trim() ? engine.search(query, { live: true }) : null;
    app.set((s) => ({ live, pulse: s.pulse + 1 }));
  },

  ask(query: string): Retrieval | null {
    if (!query.trim()) return null;
    const result = engine.search(query);
    app.set((s) => ({ answer: result, live: result, pulse: s.pulse + 1 }));
    actions.unlock("first-query");
    if (result.verdict === "FAIL") actions.unlock("abstained");
    return result;
  },

  inspect(index: number) {
    const result = engine.inspect(index);
    app.set({ answer: result, live: result });
    actions.unlock("stargazer");
  },

  clearAnswer() {
    app.set({ answer: null, live: null });
  },

  foundOutlier() {
    actions.unlock("outlier");
    actions.toast("You found the outlier", "7.3σ from every cluster. Every dataset has one.");
  },

  focusCluster(cluster: ClusterId | null) {
    app.set({ focusCluster: cluster });
  },

  toggleTerminal(open?: boolean) {
    const next = open ?? !app.get().terminalOpen;
    app.set({ terminalOpen: next, menuOpen: false, guideOpen: false });
    if (next) actions.unlock("terminal");
  },

  toggleGuide(open?: boolean) {
    const next = open ?? !app.get().guideOpen;
    app.set({ guideOpen: next, menuOpen: false, terminalOpen: false });
    if (next) {
      save("guide-seen", true);
      actions.unlock("rtfm");
    }
  },

  setMenu(open: boolean) {
    app.set({ menuOpen: open });
  },

  toggleDebug() {
    const debug = !app.get().debug;
    app.set({ debug });
    if (debug) actions.unlock("konami");
  },

  prefillComposer(message: string) {
    app.set({ composerPrefill: message });
  },

  unlock(id: AchievementId) {
    const { unlocked } = app.get();
    if (unlocked.includes(id)) return;
    const next = [...unlocked, id];
    app.set({ unlocked: next });
    save("achievements", next);
    const a = ACHIEVEMENT_MAP[id];
    pushToast({ kind: "achievement", title: a.title, body: a.description, achievement: id }, 4600);
  },

  toast(title: string, body?: string) {
    pushToast({ kind: "info", title, body });
  },
};
