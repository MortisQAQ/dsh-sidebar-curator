// @vitest-environment jsdom
import {act,StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {createElement as h} from 'react';
import {describe,it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
// @ts-expect-error adapter is a separately shipped Node CLI
import {patchSidebar} from '../scripts/adapter.mjs';
vi.mock('@deepseek-ai/dsh-client-ui-primitives',()=>({MenuItemButton:({children,onSelect}:any)=>h('button',{onClick:onSelect},children),Modal:({open,children,title}:any)=>open?h('section',{'aria-label':title},children):null}));
import {apply} from '../src/client.tsx';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
describe('native slot integration',()=>{
 it('initializes without opening More, handles future entries and restores on unmount',async()=>{
   localStorage.clear();const registered=new Map<string,any>();const cleanups:(()=>void)[]=[];
   const ctx={effect:(fn:()=>unknown)=>{const off=fn();if(typeof off==='function')cleanups.push(off as ()=>void)},slots:{inject:(_key:string,fn:()=>unknown)=>fn(),register:(options:any,component:any)=>{registered.set(options.name,component);return ()=>registered.delete(options.name)},spec:()=>({kind:'single'})}};
   apply(ctx as any,{defaultPinnedIds:['workbench']});
   const Navigation=registered.get('sidebar.navigation');
   const changes=vi.fn();const container=document.createElement('div');document.body.append(container);const root=createRoot(container);
   let entries=[{id:'plugins',label:'插件',pinned:true},{id:'workbench',label:'工作台',pinned:true},{id:'todo',label:'待办',pinned:true}];
   const render=()=>h(Navigation,{contractVersion:1,entries,onPinnedChange:changes,children:h('nav',null,'original')});
   await act(async()=>root.render(render()));expect(changes).toHaveBeenCalledWith('todo',false);expect(container.textContent).toContain('original');
   changes.mockClear();entries=[...entries.map(e=>e.id==='todo'?{...e,pinned:false}:e),{id:'future',label:'Future',pinned:true}];
   await act(async()=>root.render(render()));expect(changes).toHaveBeenCalledTimes(1);expect(changes).toHaveBeenCalledWith('future',false);
   await act(async()=>root.unmount());expect(changes).toHaveBeenCalledWith('todo',true);for(const cleanup of cleanups)cleanup();container.remove();
 });
 it('keeps the replacement instance authoritative under StrictMode',async()=>{
   localStorage.clear();const registered=new Map<string,any>();const cleanups:(()=>void)[]=[];
   const ctx={effect:(fn:()=>unknown)=>{const off=fn();if(typeof off==='function')cleanups.push(off as ()=>void)},slots:{inject:(_key:string,fn:()=>unknown)=>fn(),register:(options:any,component:any)=>{registered.set(options.name,component);return ()=>{}},spec:()=>({kind:'single'})}};
   apply(ctx as any);const Navigation=registered.get('sidebar.navigation');const changes=vi.fn();const container=document.createElement('div');const root=createRoot(container);
   const render=(key:string)=>h(StrictMode,null,h(Navigation,{key,contractVersion:1,entries:[{id:'x',label:'X',pinned:true}],onPinnedChange:changes,children:h('nav',null,'native')}));
   await act(async()=>root.render(render('a')));changes.mockClear();await act(async()=>root.render(render('b')));
   expect(changes.mock.calls.at(-1)).toEqual(['x',false]);changes.mockClear();await act(async()=>root.unmount());expect(changes.mock.calls.at(-1)).toEqual(['x',true]);for(const cleanup of cleanups)cleanup();
 });
 it('keeps native children visible if policy initialization throws',async()=>{
   localStorage.clear();const registered=new Map<string,any>();const cleanups:(()=>void)[]=[];
   const ctx={effect:(fn:()=>unknown)=>{const off=fn();if(typeof off==='function')cleanups.push(off as ()=>void)},slots:{inject:(_key:string,fn:()=>unknown)=>fn(),register:(options:any,component:any)=>{registered.set(options.name,component);return ()=>{}},spec:()=>({kind:'single'})}};
   apply(ctx as any);const Navigation=registered.get('sidebar.navigation');const container=document.createElement('div');const root=createRoot(container);const error=vi.spyOn(console,'error').mockImplementation(()=>{});
   try { await act(async()=>root.render(h(Navigation,{contractVersion:1,entries:[{id:'x',label:'X',pinned:true}],onPinnedChange:()=>{throw Error('host failure')},children:h('nav',null,'native recovery')})));expect(container.textContent).toContain('native recovery');await act(async()=>root.unmount()); } finally {error.mockRestore();for(const cleanup of cleanups)cleanup();}
 });
 it('generates a bounded single-slot adapter, is idempotent, and rejects unknown layouts',()=>{
  const source=readFileSync('node_modules/@deepseek-ai/dsh-client-ui-sidebar/lib/client.js','utf8');const patched=patchSidebar(source);
  expect(patched).toContain('sidebar.navigation');expect(patched).toContain('!hasEntryActions || !unpinned.includes(id)');expect(patchSidebar(patched)).toBe(patched);expect(()=>patchSidebar('unknown')).toThrow();
 });
});
