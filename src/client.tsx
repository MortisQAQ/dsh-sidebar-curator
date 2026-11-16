import { Component, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import type { Context } from '@deepseek-ai/cordis';
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client';
import type { SidebarPanelActionsOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client';
import { MenuItemButton, Modal } from '@deepseek-ai/dsh-client-ui-primitives';
import { createPreferencesStore } from './preferences.ts';
import { desiredPinned, pinChanges } from './policy.ts';
import type { Entry, NavigationProps } from './contract.ts';

export const name = 'dsh-sidebar-curator';
export const inject = ['slots'];
export interface Config { defaultPinnedIds?: string[]; storageKey?: string }

/** Kept outside the menu: policy must run even when More has never opened. */
export function apply(ctx: Context, config: Config = {}): void {
  const defaults = config.defaultPinnedIds ?? ['personal-workbench', 'schedules', 'dsh-context', 'dsh-mneme'];
  let disk: Storage | undefined;
  let storageWarning = '';
  try { disk = window.localStorage; } catch { storageWarning = '本窗口使用临时偏好，刷新后恢复默认。'; }
  const key = config.storageKey ?? 'dsh.sidebar-curator.preferences.v1';
  const store = createPreferencesStore(disk, key, () => { storageWarning = '偏好存储异常，当前选择在本窗口继续有效。'; });
  let runtime: { owner?: symbol; entries: readonly Entry[]; onPinnedChange: (id: string, pinned: boolean) => void } | undefined;
  const uiListeners = new Set<() => void>();
  let managing = false;
  let revision = 0;
  function notify(): void { revision++; for (const listener of [...uiListeners]) listener(); }
  const subscribeUI = (listener: () => void) => { uiListeners.add(listener); return () => { uiListeners.delete(listener); }; };
  const getUI = () => revision;
  function change(id: string, pinned: boolean): void { store.setPinned(id, pinned); }

  function Manager() {
    useSyncExternalStore(subscribeUI, getUI, getUI);
    const prefs = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    const [query, setQuery] = useState('');
    return <Modal open={managing} onClose={() => { managing = false; notify(); }} title="管理侧栏入口" closeLabel="关闭" description="新入口默认收入更多；固定选择仅保存于此服务地址的浏览器存储。" footer={<button onClick={() => store.reset()}>恢复默认</button>}>
      {storageWarning && <p role="status">{storageWarning}</p>}
      <input data-modal-autofocus aria-label="搜索侧栏入口" placeholder="搜索名称或 ID" value={query} onChange={e => setQuery(e.target.value)} style={{width:'100%',boxSizing:'border-box',padding:10}} />
      <div style={{maxHeight:'55vh',overflowY:'auto',marginTop:12}}>
        {(runtime?.entries ?? []).filter(e => (e.label+' '+e.id).toLowerCase().includes(query.toLowerCase())).map(e => <label key={e.id} style={{display:'flex',gap:12,padding:'10px 2px',alignItems:'center'}}>
          <input type="checkbox" disabled={e.id === 'plugins'} checked={desiredPinned(e.id,prefs,defaults)} onChange={event => change(e.id,event.target.checked)} />
          <span style={{minWidth:0,overflowWrap:'anywhere'}}>{e.label}<small style={{display:'block',opacity:.6}}>{e.id}</small></span>
        </label>)}
      </div>
    </Modal>;
  }
  class NavigationBoundary extends Component<{children:ReactNode; fallback:ReactNode; onFailure:()=>void},{failed:boolean}> {
    state={failed:false};
    static getDerivedStateFromError() { return {failed:true}; }
    componentDidCatch() { try { this.props.onFailure(); } catch { /* preserve fallback even if host recovery throws */ } }
    render() { return this.state.failed ? this.props.fallback : this.props.children; }
  }
  function restoreEntries() {
    if (runtime) for (const entry of runtime.entries) runtime.onPinnedChange(entry.id,true);
  }
  function NavigationInner(props: NavigationProps) {
    const owner = useRef(Symbol());
    const latest = useRef(props);
    latest.current = props;
    const prefs = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    const valid = props.contractVersion === 1 && Array.isArray(props.entries) && typeof props.onPinnedChange === 'function';
    useLayoutEffect(() => {
      if (!valid) { if (runtime?.owner === owner.current) { restoreEntries(); runtime=undefined; } return; }
      runtime = {owner:owner.current,entries:props.entries,onPinnedChange:props.onPinnedChange};
      for (const item of pinChanges(props.entries,prefs,defaults)) props.onPinnedChange(item.id,item.pinned);
      notify();
    },[valid,props.entries,props.onPinnedChange,prefs]);
    useLayoutEffect(() => () => {
      const own = latest.current;
      if (runtime?.owner === owner.current) {
        for (const entry of own.entries) own.onPinnedChange(entry.id,true);
        runtime=undefined;
      }
    },[]);
    return <>{props.children}<Manager /></>;
  }
  function Navigation(props: NavigationProps) {
    return <NavigationBoundary fallback={props.children} onFailure={restoreEntries}><NavigationInner {...props} /></NavigationBoundary>;
  }
  function Actions({entries,onOpen,onDismiss}: SidebarPanelActionsOwnerProps) {
    const prefs = useSyncExternalStore(store.subscribe,store.getSnapshot,store.getSnapshot);
    const supported = ctx.slots.spec('sidebar.navigation') !== undefined;
    return <>
      {supported ? entries.filter(e => !desiredPinned(e.id,prefs,defaults)).map(e => <MenuItemButton key={e.id} current={e.active} onSelect={() => { onDismiss(); onOpen(e.id); }}>{e.label}</MenuItemButton>) : <MenuItemButton disabled onSelect={() => {}}>侧栏收纳需要匹配的宿主适配 v1</MenuItemButton>}
      <MenuItemButton separatorBefore disabled={!supported} onSelect={() => { onDismiss(); managing=true; notify(); }}>管理侧栏入口</MenuItemButton>
    </>;
  }
  ctx.effect(() => {
    const listener = (event: StorageEvent) => { if (!event.storageArea || event.storageArea === disk) store.handleStorage(event); };
    window.addEventListener('storage',listener);
    return () => { window.removeEventListener('storage',listener); store.dispose(); uiListeners.clear(); };
  },'curator: preferences lifetime');
  ctx.slots.inject('sidebar.navigation',() => ctx.slots.register({name:'sidebar.navigation'},Navigation));
  ctx.slots.inject('sidebar.panellist.actions',() => ctx.slots.register({name:'sidebar.panellist.actions',id:'dsh-sidebar-curator',order:-100},Actions));
}
