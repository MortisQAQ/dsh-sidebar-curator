import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {patchSidebar,sha256} from './adapter.mjs';
export function adapterSource(source){
 const patched=patchSidebar(source);
 const identity='id: "@deepseek-ai/dsh-client-ui-sidebar",';
 if(patched.split(identity).length!==2)throw Error('Unexpected ModuleLoader identity');
 return patched.replace(identity,'id: "dsh-sidebar-curator-host-adapter",');
}
export async function createAdapterPackage(input,output,licenseFile){
 const source=await readFile(resolve(input),'utf8');
 const client=adapterSource(source);
 const license=await readFile(resolve(licenseFile),'utf8');
 if(!license.trim())throw Error('Upstream license required');
 const destination=resolve(output);
 try{await access(destination);throw Error('Output directory already exists; use a fresh path to preserve deployed adapters');}catch(error){if(error.code!=='ENOENT')throw error;}
 await mkdir(join(destination,'lib'),{recursive:true});
 const pkg={name:'dsh-sidebar-curator-host-adapter',version:'0.1.0',private:true,type:'module',license:'MIT',main:'./lib/index.js',exports:{'.':'./lib/index.js','./client':'./lib/client.js','./package.json':'./package.json'},dsh:{client:{platform:'web'}}};
 await writeFile(join(destination,'package.json'),JSON.stringify(pkg,null,2)+'\n');
 await writeFile(join(destination,'lib/index.js'),'export function apply() {}\n');
 await writeFile(join(destination,'lib/client.js'),client);
 await writeFile(join(destination,'LICENSE.upstream'),license);
 await writeFile(join(destination,'provenance.json'),JSON.stringify({contractVersion:1,upstream:'@deepseek-ai/dsh-client-ui-sidebar',sourceHash:sha256(source),outputHash:sha256(client),runtimeGuiVerified:false},null,2)+'\n');
 return destination;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const [input,output,licenseFile]=process.argv.slice(2);
 if(!input||!output||!licenseFile)throw Error('Usage: create-adapter-package.mjs INPUT_CLIENT NEW_OUTPUT_DIRECTORY UPSTREAM_LICENSE');
 console.log(await createAdapterPackage(input,output,licenseFile));
}
