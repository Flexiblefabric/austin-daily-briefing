'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const clone=x=>JSON.parse(JSON.stringify(x)),fixture=JSON.parse(cp.execFileSync('python',['tests/publisher-fixture.py'],{encoding:'utf8'}));
function harness(options={}) {
 const c=vm.createContext({Intl});vm.runInContext(fs.readFileSync('apps-script/EditorialPublisherDevReviewBundle.gs','utf8'),c);
 const C=clone(vm.runInContext('ADB_PUBLISHER',c)),pkg=clone(options.pkg||fixture),packageId=options.packageId||'REVIEW';
 const policy={purpose:'ISOLATED_REVIEWED_HANDOFF_DEV',databaseId:'new_synthetic_database',draftId:'new_synthetic_draft',sealedId:'new_synthetic_sealed',sourceRevision:pkg.source_revision,operator:'owner@example.invalid',...options.policy};
 const props={ADB_DEV_REVIEW_POLICY_JSON:JSON.stringify(policy),ADB_PUBLISHER_SOURCE_REVISION:pkg.source_revision};
 const files=new Map();let seq=1,locked=false,writes=0,reads=0,active=policy.operator,effective=policy.operator;
 function file(id,role) {
  const tables=new Map();files.set(id,tables);
  function add(name,values){tables.set(name,{id:seq++,values:clone(values)});}
  add('Environment',[['Setting','Value'],['Environment','DEVELOPMENT'],['Allow External Delivery','FALSE'],['Production Writes','FORBIDDEN'],['QA Purpose','ISOLATED_REVIEWED_HANDOFF_DEV'],['Handoff Role',role],['Manage URL','https://example.org/manage'],['History Cutoff',pkg.selection_bundle.cutoff],['History Window Start',pkg.selection_bundle.history_window_start],['Recent History Complete','TRUE'],['Extended History Complete','TRUE']]);return {tables,add};
 }
 const db=file(policy.databaseId,'DATABASE'),p=pkg.selection_bundle.profiles.SYNTHETIC;
 db.add('Subscribers',[['Profile ID','Email','Status','Admin Status'],['SYNTHETIC','secret@example.invalid','Active','OK']]);
 db.add('Profiles',[['Profile ID','Primary Preference Email','Status','More for You Volume','Summary Style','Why It Matters Length'],['SYNTHETIC','secret@example.invalid','Active',p.volume,p.summary_style,p.why_it_matters_length]]);
 db.add('Preferences',[['Profile ID','Interest ID','Preference'],...Object.entries(p.preferences).map(([k,v])=>['SYNTHETIC',k,v])]);
 db.add('Message Templates',[['Template ID','Status','Environment'],['DAILY_BRIEFING_V1','Active','DEVELOPMENT']]);
 db.add('Outbound Messages',[C.QUEUE]);db.add('Briefing History',[C.HISTORY]);db.add('Publisher Ledger',[C.LEDGER]);
 const draft=file(policy.draftId,'DRAFT_INBOX'),stage=clone(c.adbDevDraftPackageV1(packageId,pkg));
 const ph=['Package ID','State','Chunk Count','Package SHA-256'],ch=['Package ID','Sequence','JSON'];
 draft.add('Packages',[ph,ph.map(k=>stage.manifest[k])]);draft.add('Package Chunks',[ch,...stage.chunks.map(r=>ch.map(k=>r[k]))]);
 const sealed=file(policy.sealedId,'SEALED_STAGING');sealed.add('Packages',[ph]);sealed.add('Package Chunks',[ch]);sealed.add('DEV Package Reviews',[['Package ID','Review JSON']]);
 c.PropertiesService={getScriptProperties:()=>({getProperty:k=>props[k]??null,getProperties:()=>clone(props),setProperty:(k,v)=>{props[k]=v;},setProperties:(values,remove)=>{assert.equal(remove,false);Object.assign(props,values);}})};c.SpreadsheetApp={getActiveSpreadsheet:()=>options.bound?{}:null};c.ScriptApp={getProjectTriggers:()=>options.triggers||[]};
 c.Session={getActiveUser:()=>({getEmail:()=>active}),getEffectiveUser:()=>({getEmail:()=>effective})};
 c.LockService={getScriptLock:()=>({waitLock:()=>{assert(!locked);locked=true;},releaseLock:()=>{assert(locked);locked=false;}})};
 c.Date=class extends Date{constructor(...args){super(...(args.length?args:[pkg.edition_date+'T16:00:01.000Z']));}};
 c.Utilities={DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(a,s)=>Array.from(crypto.createHash('sha256').update(s).digest()),formatDate:()=>pkg.edition_date,newBlob:s=>({getBytes:()=>Buffer.from(s)})};
 const hooks={};c.Sheets={Spreadsheets:{get:id=>{reads++;assert(files.has(id));return {sheets:[...files.get(id)].map(([title,s])=>({properties:{sheetId:s.id,title}}))};},
 Values:{batchGet:(id,{ranges,valueRenderOption})=>{reads++;assert.equal(valueRenderOption,'UNFORMATTED_VALUE');return {valueRanges:ranges.map(r=>({values:clone(files.get(id).get(r.slice(1,-1)).values)}))};}},
 batchUpdate:(request,id)=>{assert(locked);assert.equal(id,JSON.parse(props.ADB_DEV_REVIEW_POLICY_JSON).sealedId);assert.equal(request.requests.length,3);if(hooks.before)hooks.before();
 for(const r of request.requests){const op=r.appendCells;assert.equal(op.fields,'userEnteredValue');const s=[...files.get(id).values()].find(s=>s.id===op.sheetId);assert(s);s.values.push(...op.rows.map(row=>row.values.map(cell=>{const v=cell.userEnteredValue;assert(!v.formulaValue);return v.stringValue??v.numberValue;})));}writes++;if(hooks.after)hooks.after();}}};
 c.HtmlService={createHtmlOutputFromFile:name=>({setTitle:title=>({name,title})})};
 return {c,policy,props,files,db,draft,sealed,hooks,reads:()=>reads,writes:()=>writes,locked:()=>locked,identity:(a,e=a)=>{active=a;effective=e;},load:()=>clone(c.adbDevReviewLoadV1(packageId)),seal:t=>clone(c.adbDevReviewSealV1(t))};
}

module.exports={harness,fixture};
