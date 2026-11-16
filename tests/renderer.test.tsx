// @vitest-environment jsdom
import {act,createElement as h} from 'react';
import {createRoot} from 'react-dom/client';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {runInThisContext} from 'node:vm';
import {Context} from '@deepseek-ai/cordis';
import {it,expect} from 'vitest';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
it('real DSH renderer retains navigation children and restores native fallback',async()=>{
 const require=createRequire(import.meta.url);let renderer:any;
 (window as any).__ModuleLoader__={load(spec:any){renderer=spec.factory(require)}};
 runInThisContext(readFileSync('node_modules/@deepseek-ai/dsh-client-ui-renderer/lib/client.js','utf8'));
 const ctx=new Context();renderer.apply(ctx);
 ctx.slots.installScope('session',{current:{getSnapshot:()=>undefined,subscribe:()=>()=>{}}} as any);
 let childProps:any;
 ctx.slots.register({name:'root',children:{'sidebar.navigation':{kind:'single',scope:'root'}}} as any,({renderSlot}:any)=>renderSlot('sidebar.navigation',{contractVersion:1,entries:[],onPinnedChange:()=>{},children:h('nav',null,'native navigation')},{fallback:h('nav',null,'native fallback')}));
 const container=document.createElement('div');document.body.append(container);const root=createRoot(container);
 await act(async()=>root.render(ctx.slots.renderSlot('root',{})));
 expect(container.textContent).toContain('native fallback');
 let off:()=>void=()=>{};
 await act(async()=>{off=ctx.slots.register({name:'sidebar.navigation'} as any,(props:any)=>{childProps=props;return props.children});});
 expect(container.textContent).toContain('native navigation');expect(childProps.contractVersion).toBe(1);
 await act(async()=>off());expect(container.textContent).toContain('native fallback');
 await act(async()=>root.unmount());container.remove();/* root Context is scoped to this isolated worker */
});
