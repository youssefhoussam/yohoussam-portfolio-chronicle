// Per-visitor conveniences only (persona, unlocked achievements). Storage can be
// unavailable (private mode, blocked cookies), so every access is guarded.

const PREFIX = "yh:";

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the experience still works, it just won't remember.
  }
}
