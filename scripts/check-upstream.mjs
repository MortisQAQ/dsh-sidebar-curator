import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const upstream='deepseek-ai/deepseek-harness';
const reporting=process.argv.includes('--report');
async function api(path,options={}) {
 const response=await fetch('https://api.github.com'+path,{...options,headers:{Accept:'application/vnd.github+json',...(process.env.GH_TOKEN?{Authorization:'Bearer '+process.env.GH_TOKEN}:{}),'Content-Type':'application/json'},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('GitHub API '+response.status+' '+path);
 let text='';for await(const chunk of response.body){text+=Buffer.from(chunk).toString('utf8');if(text.length>2000000)throw Error('Response exceeds limit');}
 return JSON.parse(text);
}
const info=await api('/repos/'+upstream);
const commit=await api('/repos/'+upstream+'/commits/'+encodeURIComponent(info.default_branch));
const releases=await api('/repos/'+upstream+'/releases?per_page=10');
const paths=['packages/client/ui-sidebar/src/client/index.ts','packages/client/ui-sidebar/src/client/SidebarRoot.tsx','packages/client/ui-sidebar/src/client/contract/slots.ts'];
const sources=await Promise.all(paths.map(async path=>{const result=await api('/repos/'+upstream+'/contents/'+path+'?ref='+commit.sha);if(result.encoding!=='base64')throw Error('Unexpected source');return Buffer.from(result.content,'base64').toString('utf8');}));
const corpus=sources.join('\n');const missing=['sidebar.panellist','sidebar.panellist.actions','onPinnedChange','onOpen'].filter(marker=>!corpus.includes(marker));
const state={schemaVersion:1,release:releases.find(r=>!r.prerelease&&!r.draft)?.tag_name??null,sourceCommit:commit.sha,contractHash:createHash('sha256').update(corpus).digest('hex'),missing};
await mkdir('artifacts',{recursive:true});await writeFile('artifacts/upstream.json',JSON.stringify(state,null,2));
console.log(JSON.stringify(state,null,2));
console.log('Marker presence is a change detector, NOT behavioral compatibility certification. Local navigation-v1 adapter requires separate tests.');
if(reporting){
 const repo=process.env.GITHUB_REPOSITORY;if(!repo||!process.env.GH_TOKEN)throw Error('Reporting requires repository and GitHub token');
 const marker='<!-- dsh-curator-upstream:v1 -->';let tracked;
 for(let page=1;page<=10&&!tracked;page++){const issues=await api('/repos/'+repo+'/issues?state=all&per_page=100&page='+page);tracked=issues.find(issue=>!issue.pull_request&&issue.user?.type==='Bot'&&issue.body?.startsWith(marker));if(issues.length<100)break;}
 let previous;try{previous=JSON.parse(Buffer.from(tracked?.body?.match(/<!-- snapshot:([A-Za-z0-9+/=]+) -->/)?.[1]??'','base64').toString())}catch{}
 if(!previous||previous.release!==state.release||previous.contractHash!==state.contractHash){
 const body=[marker,'# DSH upstream compatibility review','Release: '+state.release,'Source commit: '+state.sourceCommit,'Contract SHA256: '+state.contractHash,'Missing markers: '+(missing.join(', ')||'none'),'Marker checks are not proof of runtime compatibility. Review upstream diff, regenerate bounded adapter, run tests and GUI acceptance. No automatic merge, deployment, or npm publication.','<!-- snapshot:'+Buffer.from(JSON.stringify(state)).toString('base64')+' -->'].join('\n\n');
 await api('/repos/'+repo+'/issues'+(tracked?'/'+tracked.number:''),{method:tracked?'PATCH':'POST',body:JSON.stringify({title:'[upstream] DSH compatibility review',body,...(tracked?{state:'open'}:{})})});
 }
}
if(missing.length)process.exitCode=1;
