import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
export const CONTRACT_VERSION=1;
export function patchSidebar(source) {
  if(source.includes('dsh-sidebar-curator: navigation-v1')) return source;
  const supportedHashes = new Set(['0a0a32382391acee1a692cf7d2529a2669cc8cc23d4d83b446f6247c3c4562c4','1cc667401af9b64c5a90a5e10f8c085c2dad2852ebe4ed0e69dde5071f531653']);
  if(!supportedHashes.has(sha256(source))) throw Error('Unverified sidebar hash; review and test this DSH build before adding support');
  const start='panels.length > 0 && (0, react_jsx_runtime.jsxs)("nav", {';
  const end='\n\t\t\t\t\t(0, react_jsx_runtime.jsx)("div", {\n\t\t\t\t\t\tclassName: SidebarRoot_module_css_default.regionArea,';
  const a=source.indexOf(start), b=source.indexOf(end,a);
  if(a<0||b<0||source.indexOf(start,a+1)>=0)throw Error('Unsupported sidebar structure; no changes written');
  let navigation=source.slice(a,b);
  if(!navigation.endsWith('}),')) throw Error('Unexpected navigation boundary');
  navigation=navigation.slice(0,-1);
  navigation=navigation.replace('id === "plugins" || !unpinned.includes(id)','id === "plugins" || !hasEntryActions || !unpinned.includes(id)');
  const wrapper='/* dsh-sidebar-curator: navigation-v1 */ renderSlot("sidebar.navigation", {contractVersion:1,entries:panels.map(({id,label})=>({id,label,pinned:!unpinned.includes(id),active:id===activePanelId})),onPinnedChange:setPinned,children:'+navigation+'}, {fallback:'+navigation+'}),';
  let next=source.slice(0,a)+wrapper+source.slice(b);
  const declaration='"sidebar.panellist.actions": {\n\t\t\t\t\t\tkind: "list",';
  if(next.split(declaration).length!==2)throw Error('Unsupported slot declaration');
  next=next.replace(declaration,'"sidebar.navigation": {kind:"single",scope:"root"},\n\t\t\t\t\t'+declaration);
  return next;
}
export const sha256=text=>createHash('sha256').update(text).digest('hex');
async function main(){
  const [command='check',input,output]=process.argv.slice(2);
  const target=resolve(input??'node_modules/@deepseek-ai/dsh-client-ui-sidebar/lib/client.js');
  const source=await readFile(target,'utf8'); const patched=patchSidebar(source);
  console.log(JSON.stringify({command,target,sourceHash:sha256(source),patchedHash:sha256(patched),alreadyPatched:source===patched},null,2));
  if(command==='check')return;
  if(command!=='generate'||!output)throw Error('Usage: adapter.mjs check [file] | generate input output');
  const destination=resolve(output); if(destination===target)throw Error('Use a separate output; original must stay intact');
  await mkdir(dirname(destination),{recursive:true});
  await writeFile(destination,patched); await writeFile(destination+'.manifest.json',JSON.stringify({contractVersion:1,sourceHash:sha256(source),patchedHash:sha256(patched),source:target},null,2));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
