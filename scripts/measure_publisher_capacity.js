'use strict';
/** Read-only LOCAL capacity measurement. No Google API, network, publication or
 * transport dependency. Private capture files are never included in the report.
 * Usage: node scripts/measure_publisher_capacity.js /private/capture/directory
 */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {performance}=require('node:perf_hooks');
const root=path.resolve(__dirname,'..'),clone=v=>JSON.parse(JSON.stringify(v));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),bytes=v=>Buffer.byteLength(JSON.stringify(v),'utf8');
function requireValue(ok,message){if(!ok)throw Error('Capacity: '+message);}
function runtime(){
 const c=vm.createContext({Intl});
 for(const file of ['scripts/daily_newsletter_renderer.js','apps-script/DailyNewsletterContract.gs','apps-script/SelectionEvidenceContract.gs','apps-script/EditorialPublisher.gs','apps-script/EditorialPublisherBatchQa.gs','apps-script/EditorialPublisherProdPreflight.gs'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
 c.adbPublisherDigest_=sha;c.Utilities={newBlob:s=>({getBytes:()=>Buffer.from(s,'utf8')})};return c;
}
function loadCapture(dir){
 const read=file=>JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
 const manifest=read('manifest.json'),tables=read('input-tables.json'),history=[];let next=2;
 requireValue(Array.isArray(manifest.historyChunks)&&manifest.historyChunks.length>0,'history chunk manifest required');
 for(const chunk of manifest.historyChunks){
  requireValue(/^history-\d\d\.json$/.test(chunk.file)&&chunk.start===next&&chunk.end>=chunk.start,'gapped/invalid history ranges');
  const data=read(chunk.file);requireValue(Array.isArray(data)&&data.length===chunk.end-chunk.start+1,'short history chunk');
  history.push(...data);next=chunk.end+1;
 }
 requireValue(next===manifest.historyGridRows+1,'incomplete history grid');
 requireValue(manifest.queueFile==='current-queue.json','unexpected queue input');
 return {manifest,tables,history,queue:read(manifest.queueFile)};
}
function table(v){return {headers:v[0],raw:v.slice(1).filter(r=>r.some(x=>x!==''&&x!=null))};}
function wireRequest(C,queue,history,ledger){
 function append(sheetId,headers,rows){return {appendCells:{sheetId,rows:rows.map(row=>({values:headers.map(h=>{
  const value=row[h]??'';requireValue(typeof value==='string'||typeof value==='number','non-literal cell');
  return {userEnteredValue:typeof value==='number'?{numberValue:value}:{stringValue:value}};
 })})),fields:'userEnteredValue'}};}
 return {requests:[append(2147483645,C.QUEUE,queue),append(2147483646,C.HISTORY,history),append(2147483647,C.LEDGER,[ledger])]};
}
function projectArchiveContent(C,queue,history,count,date){
 const result={queue:[],history:[]},runId=date+'-publisher-v1',digest='0'.repeat(64);
 const groups=queue.map(q=>history.filter(h=>h['Profile ID']===q['Profile ID']));
 requireValue(groups.every(h=>h.length>0),'current queue/history pairing missing');
 for(let i=0;i<count;i++){
  const index=i%queue.length,original=queue[index],id=i<queue.length?original['Profile ID']:'CAPACITY-'+String(i+1).padStart(3,'0');
  const q={...original,'Message ID':'DAILY-LIVE:'+id+':'+runId,'Created At':date+'T16:00:00.000Z','Profile ID':id,
   Status:'Queued','Sent At / Gmail ID':'','Run ID':runId,Notes:C.BUILD+' | package '+digest};
  if(i>=queue.length)q.Email='capacity-reader-'+(i+1)+'@example.invalid';result.queue.push(q);
  for(const old of groups[index]){
   requireValue(old.Notes.startsWith('ADB-SELECTION-NOTE-1 '),'current unstructured evidence cannot be projected');
   const note=JSON.parse(old.Notes.slice(old.Notes.indexOf('{'),old.Notes.lastIndexOf('}')+1));
   result.history.push({...old,'Run ID':runId,'Profile ID':id,'Delivery Status':'Pending','Provider Message ID':'',
    Notes:'ADB-SELECTION-NOTE-1 '+JSON.stringify(note)+C.SUFFIX});
  }
 }
 result.ledger={'Edition Key':'daily:'+date,'Package SHA-256':digest,'Run ID':runId,'Profile Count':count,
  'History Count':result.history.length,'Committed At':date+'T16:00:00.000Z'};
 const request=wireRequest(C,result.queue,result.history,result.ledger),requestBytes=bytes(request);
 return {profiles:count,historyRows:result.history.length,requestBytes,applicationByteLimit:C.MAX_BYTES,
  withinApplicationLimit:requestBytes<C.MAX_BYTES,limitUsedPercent:Math.round(requestBytes/C.MAX_BYTES*1000)/10,
  headroomBytes:C.MAX_BYTES-requestBytes,maxHtmlChars:Math.max(...result.queue.map(r=>r.HTML.length)),
  maxHistoryNoteChars:Math.max(...result.history.map(r=>r.Notes.length)),
  withinDevCellGuard:[...result.queue.map(r=>r.HTML),...result.queue.map(r=>r['Plain Text']),...result.history.map(r=>r.Notes)].every(s=>s.length<40000)};
}
function measureCapture(input){
 const c=runtime(),C=clone(vm.runInContext('ADB_PUBLISHER',c)),m=input.manifest;
 requireValue(/^\d{4}-\d\d-\d\d$/.test(m.editionDate),'explicit edition required');
 requireValue(JSON.stringify(m.queueHeaders)===JSON.stringify(C.QUEUE)&&JSON.stringify(input.tables.historyHeaders)===JSON.stringify(C.HISTORY),'schema mismatch');
 const normalize=(v,mirror=false)=>clone(c.adbProdPublisherNormalizeTable_(table(v),mirror));
 const subscribers=normalize(input.tables.subscribers),profiles=normalize(input.tables.profiles),preferences=normalize(input.tables.preferences,true),templates=normalize(input.tables.templates);
 const eligible=subscribers.filter(s=>s.Status==='Active'&&s['Admin Status']==='OK');
 const prefKeys=new Set();preferences.forEach(r=>{const key=JSON.stringify([r['Profile ID'],r['Interest ID']]);requireValue(!prefKeys.has(key)&&['Off','Normal','High'].includes(r.Preference),'invalid preference identity/value');prefKeys.add(key);});
 requireValue(templates.filter(t=>t['Template ID']==='DAILY_BRIEFING_V1'&&String(t.Active).toUpperCase()==='TRUE'&&t.Environment==='PRODUCTION').length===1,'daily template not unique Active=TRUE');
 for(const s of eligible){
  const email=String(s.Email||'').trim().toLowerCase(),ps=profiles.filter(p=>p['Profile ID']===s['Profile ID']);
  requireValue(email&&ps.length===1&&ps[0].Status==='Active'&&String(ps[0]['Primary Preference Email']).trim().toLowerCase()===email&&
   subscribers.filter(r=>r['Profile ID']===s['Profile ID']||String(r.Email||'').trim().toLowerCase()===email).length===1,'audience not uniquely resolved');
 }
 const history=input.history.map(row=>Object.fromEntries(input.tables.historyHeaders.map((h,i)=>[h,row[i]??''])));
 const timings=[];let normalized;
 for(let i=0;i<3;i++){const start=performance.now();normalized=clone(c.adbProdPublisherNormalizeHistoryV1(history,m.editionDate,m.windowStart,false));timings.push(performance.now()-start);}
 const known=normalized.publishedHistory,recent=known.filter(r=>r.date>=m.windowStart);
 const queue=input.queue.map(row=>Object.fromEntries(m.queueHeaders.map((h,i)=>[h,row[i]??''])));
 requireValue(queue.length===eligible.length&&new Set(queue.map(q=>q['Profile ID'])).size===eligible.length,'current audience capture incomplete');
 requireValue(queue.every(q=>q['Template ID']==='DAILY_BRIEFING_V1'&&q.Status==='Sent'&&q['Run ID'].startsWith(m.editionDate)&&eligible.some(s=>s['Profile ID']===q['Profile ID']&&s.Email.toLowerCase()===q.Email.toLowerCase())),'queue not current eligible Sent audience');
 const runIds=new Set(queue.map(q=>q['Run ID'])),ids=new Set(queue.map(q=>q['Profile ID']));
 requireValue(runIds.size===1,'current run is ambiguous');
 const current=history.filter(h=>runIds.has(h['Run ID'])&&ids.has(h['Profile ID']));
 requireValue(current.every(h=>h['Delivery Status']==='Sent'),'current history not fully Sent');
 for(const q of queue){const provider=q['Sent At / Gmail ID'].match(/Resend ID ([0-9a-f-]{36})/i);requireValue(provider&&current.filter(h=>h['Profile ID']===q['Profile ID']).every(h=>h['Provider Message ID']===provider[1]),'provider evidence mismatch');}
 const validateStart=performance.now();for(const q of queue)c.adbValidateDailyNewsletterPayload_(q.HTML,q['Plain Text']);
 const payloadValidationMs=performance.now()-validateStart;
 const synthetic=[];
 // Rendering CPU check with established synthetic editorial content. Attach the
 // actual known prior records for workload only; do not attest unknown extended
 // production history or a fresh production editorial handoff as complete.
 const seedLine=fs.readFileSync(path.join(root,'apps-script/EditorialPublisherDevReviewBundle.gs'),'utf8').split('\n').find(line=>line.startsWith('const ADB_DEV_REVIEW_SEED_JSON = '));
 requireValue(!!seedLine,'generated review seed missing');
 const seed=JSON.parse(JSON.parse(seedLine.slice('const ADB_DEV_REVIEW_SEED_JSON = '.length,-1)));
 requireValue(seed.edition_date===m.editionDate,'review seed must match captured edition');
 const base={environment:'DEVELOPMENT',externalDelivery:'FALSE',sourceRevision:seed.source_revision,queueHeaders:C.QUEUE,historyHeaders:C.HISTORY,ledgerHeaders:C.LEDGER,queue:[],history:[],ledger:[],
  subscribers:[{'Profile ID':'SYNTHETIC',Email:'qa@example.invalid',Status:'Active','Admin Status':'OK'}],profiles:[{'Profile ID':'SYNTHETIC',Status:'Active','Primary Preference Email':'qa@example.invalid'}],
  templates:[{'Template ID':'DAILY_BRIEFING_V1',Status:'Active',Environment:'DEVELOPMENT'}],personalization:clone(seed.selection_bundle.profiles),publishedHistory:[],manageUrl:'https://example.org/manage'};
 for(const count of [eligible.length,eligible.length*2]){
  const sample=clone(c.adbPublisherSyntheticQaInput_(seed,base,count));sample.state.publishedHistory=known;sample.pkg.selection_bundle.published_history=known;
  const start=performance.now(),plan=c.adbPlanEditorialPublication(sample.pkg,sample.state,{iso:seed.edition_date+'T16:00:00.000Z',editionDate:seed.edition_date},sha);
  synthetic.push({profiles:count,priorRecords:known.length,result:plan.result,queueRows:plan.queue.length,historyRows:plan.history.length,planRenderValidateMs:Math.round((performance.now()-start)*100)/100});
 }
 const result={scope:'read-only local measurement; no Google API calls or publication',editionDate:m.editionDate,sourceRef:m.sourceRef,
  audience:{eligibleProfiles:eligible.length,subscriberRows:subscribers.length,profileRows:profiles.length,preferenceRows:preferences.length,currentQueueRows:queue.length,currentHistoryRows:current.length},
  history:{rows:history.length,sentRows:normalized.sentRows,legacyOutsideWindow:normalized.legacyOutsideWindow,recentLegacy:normalized.recentLegacy,
   recentMalformed:normalized.recentMalformed,malformedOutsideWindow:normalized.malformedOutsideWindow,invalidDates:normalized.invalidDates,
   recentComplete:normalized.recentComplete,extendedHistoryKnown:normalized.extendedHistoryKnown,knownPriorRecords:known.length,recentKnownPriorRecords:recent.length,
   compactCapturedUtf8Bytes:bytes(input.history),normalizedKnownPriorUtf8Bytes:bytes(known),recentKnownPriorUtf8Bytes:bytes(recent),
   maxArchivedNoteChars:Math.max(...history.map(r=>r.Notes.length)),historyReadChunks:m.historyChunks.length,
   localNormalizeMs:timings.map(t=>Math.round(t*100)/100)},
  archivedPayloadValidation:{passedProfiles:queue.length,localMs:Math.round(payloadValidationMs*100)/100},
  projectedAtomicPayload:[eligible.length,eligible.length*2].map(n=>projectArchiveContent(C,queue,current,n,m.editionDate)),
  syntheticRenderWithKnownHistory:synthetic,
  limitations:['Local Node timings exclude Apps Script/Google network latency and memory limits.','Archived-content byte projections are not a validated new production handoff.','24-profile case cycles archived content and uses synthetic additional recipients; it is a headroom probe.','Unknown extended history remains UNKNOWN; no selection-rule waiver.','Read capture spans multiple requests; no transactional snapshot isolation is claimed.'],productionWrites:false,emails:false};
 return result;
}
module.exports={loadCapture,measureCapture,projectArchiveContent,wireRequest};
if(require.main===module){try{requireValue(process.argv.length===3,'supply a private capture directory');console.log(JSON.stringify(measureCapture(loadCapture(process.argv[2])),null,2));}catch(error){console.error('Capacity check failed; inspect the private capture locally. No production writes occurred.');process.exitCode=1;}}
