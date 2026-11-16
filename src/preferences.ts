import { defaultPreferences, type Preferences } from './policy.ts';
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
function validKey(key: string): boolean { return key.length > 0 && key.length <= 256 && key.trim() === key && !/[\u0000-\u001f\u007f]/.test(key) && !forbidden.has(key); }
function object(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value); }
export function decodePreferences(raw: string | null): Preferences {
  if (raw === null) return defaultPreferences();
  if (raw.length > 262144) throw new TypeError('Preferences too large');
  const value: unknown = JSON.parse(raw);
  if (!object(value) || value.schemaVersion !== 1 || value.newEntryPolicy !== 'more' || !object(value.overrides) || Object.keys(value).some(key => !['schemaVersion', 'newEntryPolicy', 'overrides'].includes(key))) throw new TypeError('Invalid preferences schema');
  const overrides: Record<string, 'pinned' | 'more'> = Object.create(null);
  for (const [id, choice] of Object.entries(value.overrides)) {
    if (!validKey(id) || (choice !== 'pinned' && choice !== 'more')) throw new TypeError('Invalid preferences override');
    overrides[id] = choice;
  }
  return Object.freeze({ schemaVersion: 1, newEntryPolicy: 'more', overrides: Object.freeze(overrides) });
}
function equal(a: Preferences, b: Preferences): boolean { const keys = Object.keys(a.overrides); return keys.length === Object.keys(b.overrides).length && keys.every(key => a.overrides[key] === b.overrides[key]); }
export function createPreferencesStore(storage?: Pick<Storage, 'getItem' | 'setItem'>, key = 'dsh.sidebar-curator.preferences.v1', onError?: (error: unknown) => void) {
  if (!validKey(key)) throw new TypeError('Invalid storage key');
  let current = defaultPreferences(); let disposed = false;
  const listeners = new Set<() => void>();
  const report = (error: unknown) => { try { onError?.(error); } catch { /* isolate reporting */ } };
  const parse = (raw: string | null) => { try { return decodePreferences(raw); } catch (error) { report(error); return defaultPreferences(); } };
  try { if (storage) current = parse(storage.getItem(key)); } catch (error) { report(error); }
  function update(next: Preferences, persist: boolean): void {
    if (disposed) return;
    const changed = !equal(current, next); if (changed) current = next;
    if (persist && storage) try { storage.setItem(key, JSON.stringify(current)); } catch (error) { report(error); }
    if (changed) for (const listener of [...listeners]) { if (disposed) break; try { listener(); } catch (error) { report(error); } }
  }
  return {
    getSnapshot: () => current,
    subscribe(listener: () => void) { if (disposed) return () => {}; listeners.add(listener); return () => { listeners.delete(listener); }; },
    setPinned(id: string, pinned: boolean) {
      if (disposed || id === 'plugins') return;
      if (!validKey(id)) { report(new TypeError('Invalid panel id')); return; }
      const choice = pinned ? 'pinned' : 'more'; if (current.overrides[id] === choice) return;
      const overrides = Object.assign(Object.create(null), current.overrides, { [id]: choice });
      update(Object.freeze({ schemaVersion: 1, newEntryPolicy: 'more', overrides: Object.freeze(overrides) }), true);
    },
    reset() { update(defaultPreferences(), true); },
    handleStorage(event: { key: string | null; newValue: string | null }) { if (!disposed && (event.key === null || event.key === key)) update(parse(event.key === null ? null : event.newValue), false); },
    dispose() { disposed = true; listeners.clear(); },
  };
}
export type PreferencesStore = ReturnType<typeof createPreferencesStore>;
