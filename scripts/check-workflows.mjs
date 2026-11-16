import {readdir,readFile} from 'node:fs/promises';
import {parseDocument} from 'yaml';
for(const file of await readdir('.github/workflows')){
 const text=await readFile('.github/workflows/'+file,'utf8');
 const doc=parseDocument(text,{uniqueKeys:true});
 if(doc.errors.length)throw Error(file+': '+doc.errors.map(e=>e.message).join('; '));
 const value=doc.toJS();if(!value.on||!value.jobs)throw Error('Missing triggers/jobs: '+file);
 if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text))throw Error('Control character: '+file);
 console.log('Workflow YAML valid: '+file);
}
