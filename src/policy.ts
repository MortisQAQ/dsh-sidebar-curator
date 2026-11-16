export type Preferences = Readonly<{ schemaVersion: 1; newEntryPolicy: 'more'; overrides: Readonly<Record<string, 'pinned' | 'more'>> }>;
export function defaultPreferences(): Preferences {
  return Object.freeze({ schemaVersion: 1, newEntryPolicy: 'more', overrides: Object.freeze(Object.create(null)) });
}
export function desiredPinned(id: string, prefs: Preferences, defaults: readonly string[]): boolean {
  if (id === 'plugins') return true;
  const choice = Object.hasOwn(prefs.overrides, id) ? prefs.overrides[id] : undefined;
  return choice === undefined ? defaults.includes(id) : choice === 'pinned';
}
export function pinChanges(entries: readonly { id: string; pinned: boolean }[], prefs: Preferences, defaults: readonly string[]): { id: string; pinned: boolean }[] {
  return entries.flatMap(entry => { const pinned = desiredPinned(entry.id, prefs, defaults); return pinned === entry.pinned ? [] : [{ id: entry.id, pinned }]; });
}
