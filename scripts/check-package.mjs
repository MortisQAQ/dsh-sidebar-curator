import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const pkg=JSON.parse(await readFile('package.json','utf8'));
if(pkg.name!=='dsh-sidebar-curator')throw Error('Unexpected npm identity');
for(const file of ['lib/index.js','lib/client.js','README.md','LICENSE','cordis.patch.yml','scripts/adapter.mjs','scripts/create-adapter-package.mjs','adapters/compatibility.json'])await readFile(file);
let loaded;
runInNewContext(await readFile('lib/client.js','utf8'),{window:{__ModuleLoader__:{load(value){loaded=value;}}}});
if(loaded?.id!==pkg.name||typeof loaded.factory!=='function')throw Error('Invalid ModuleLoader bundle');
console.log('Package entrypoints and browser registration verified');
