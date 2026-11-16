import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
// @ts-expect-error shipped Node CLI
import {adapterSource} from '../scripts/create-adapter-package.mjs';
it('rebinds the native loader identity without changing vendor CSS identities',()=>{
 const source=readFileSync('node_modules/@deepseek-ai/dsh-client-ui-sidebar/lib/client.js','utf8');
 const adapted=adapterSource(source);
 expect(adapted).toContain('id: "dsh-sidebar-curator-host-adapter",');
 expect(adapted).toContain('sidebar.navigation');
 expect(adapted).toContain('tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-sidebar"');
 expect(()=>adapterSource('unverified input')).toThrow();
});
