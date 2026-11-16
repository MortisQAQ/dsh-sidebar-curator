import type { ReactNode } from 'react';
export interface Entry { readonly id: string; readonly label: string; readonly pinned: boolean; readonly active?: boolean }
export interface NavigationProps { contractVersion: 1; entries: readonly Entry[]; onPinnedChange(id: string, pinned: boolean): void; children: ReactNode }
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap { 'sidebar.navigation': { kind: 'single'; scope: 'root'; owner: NavigationProps } }
}
