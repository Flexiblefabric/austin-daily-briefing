/** ADB-PUBLISHER-DEV-0.2. DEV only. No send API or trigger installation.
 * Install alongside pinned daily_newsletter_renderer.js (as .gs),
 * DailyNewsletterContract.gs and SelectionEvidenceContract.gs.
 * Advanced Sheets service is required for one atomic target batch.
 */
const ADB_PUBLISHER = Object.freeze({
  SCHEMA:'ADB-EDITORIAL-HANDOFF-1', BUILD:'ADB-PUBLISHER-DEV-0.2',
  DEV_ID_PROPERTY:'ADB_PUBLISHER_DEV_DATABASE_ID',
  REVISION_PROPERTY:'ADB_PUBLISHER_SOURCE_REVISION',
  PRODUCTION_IDS:['1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0','1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho'],
  QUEUE:['Message ID','Created At','Profile ID','Email','Template ID','Status','Subject','Customize URL','Sent At / Gmail ID','Notes','Plain Text','HTML','Run ID'],
  HISTORY:['Run ID','Run Date','Profile ID','Section','Category','Normalized Key','Headline','Source URL','Material Update','Notes','Delivery Status','Provider Message ID'],
  LEDGER:['Edition Key','Package SHA-256','Run ID','Profile Count','History Count','Committed At'],
  CUSTOMIZE:'https://austindailybriefing.com/customize.html',
  SUFFIX:' Awaiting Resend dispatcher delivery.', MAX_BYTES:1800000
});

function adbPublisherRequire_(ok,code){if(!ok)throw Error('Publisher: '+code);}
function adbPublisherCanonical_(v){
  if(v===null||typeof v!=='object')return JSON.stringify(v);
  if(Array.isArray(v))return '['+v.map(adbPublisherCanonical_).join(',')+']';
  return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+adbPublisherCanonical_(v[k])).join(',')+'}';
}
function adbPublisherKeys_(v,keys){adbPublisherRequire_(v&&typeof v==='object'&&!Array.isArray(v)&&adbPublisherCanonical_(Object.keys(v).sort())===adbPublisherCanonical_(keys.slice().sort()),'unexpected or missing fields');}
function adbPublisherDigest_(s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s,Utilities.Charset.UTF_8).map(b=>(b+256).toString(16).slice(-2)).join('');}

function adbPublisherHistoryHeadline_(section,item) {
  if (section === 'Austin Ahead') {
    const action = String(item.action || '').trim().toUpperCase();
    const when = String(item.when || '').trim();
    const title = String(item.title || '').trim();
    adbPublisherRequire_(['GO','WATCH','PLAN'].includes(action) && when && title,
      'Austin Ahead history requires action, timing and title');
    return action + ' · ' + when + ' · ' + title;
  }
  return item.headline || item.title || item.text;
}

/** Pure planning boundary. No storage writes, transport calls or clock reads. */
function adbPlanEditorialPublication(pkg,state,clock,sha256){
  const R=adbPublisherRequire_,eq=(a,b)=>adbPublisherCanonical_(a)===adbPublisherCanonical_(b),C=ADB_PUBLISHER;
  adbPublisherKeys_(pkg,['schema','edition_date','source_revision','expected_profile_count','editions','selection_bundle']);
  R(pkg.schema===C.SCHEMA,'unsupported handoff version');R(pkg.source_revision===state.sourceRevision&&/^[a-f0-9]{40}$/.test(pkg.source_revision),'source revision mismatch');
  R(/^\d{4}-\d{2}-\d{2}$/.test(pkg.edition_date)&&new Date(pkg.edition_date+'T00:00:00Z').toISOString().slice(0,10)===pkg.edition_date,'invalid edition date');
  R(state.environment==='DEVELOPMENT'&&state.externalDelivery==='FALSE','DEV environment/delivery gate');
  R(clock.editionDate===pkg.edition_date&&Number.isFinite(Date.parse(clock.iso)),'edition is not current Chicago date');
  R(eq(state.queueHeaders,C.QUEUE)&&eq(state.historyHeaders,C.HISTORY)&&eq(state.ledgerHeaders,C.LEDGER),'target schema drift');
  R(Array.isArray(pkg.editions)&&Number.isInteger(pkg.expected_profile_count)&&pkg.expected_profile_count>=0&&pkg.expected_profile_count===pkg.editions.length,'expected profile count mismatch');
  const raw=adbPublisherCanonical_(pkg),digest=sha256(raw),editionKey='daily:'+pkg.edition_date,runId=pkg.edition_date+'-publisher-v1';
  const ledgers=state.ledger.filter(r=>r['Edition Key']===editionKey);
  R(ledgers.length<=1,'duplicate ledger');
  const eligible=[];const ids=new Set(),emails=new Set();
  state.subscribers.forEach(s=>{
    const id=String(s['Profile ID']||'').trim(),email=String(s.Email||'').trim().toLowerCase();
    if(s.Status!=='Active'||s['Admin Status']!=='OK')return;
    R(!ids.has(id)&&!emails.has(email)&&id&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'ambiguous subscriber identity');ids.add(id);emails.add(email);
    const profiles=state.profiles.filter(p=>p['Profile ID']===id);
    R(profiles.length===1&&profiles[0].Status==='Active'&&String(profiles[0]['Primary Preference Email']).trim().toLowerCase()===email,'profile identity not uniquely Active');
    R(state.subscribers.filter(r=>String(r.Email||'').trim().toLowerCase()===email||r['Profile ID']===id).length===1,'duplicate subscriber resolution');
    eligible.push({id:id,email:email,profile:profiles[0]});
  });
  R(eq(eligible.map(s=>s.id).sort(),pkg.editions.map(e=>e.profile_id).sort()),'eligible audience changed');
  R(new Set(pkg.editions.map(e=>e.profile_id)).size===pkg.editions.length,'duplicate profile edition');
  if(!eligible.length){
    R(pkg.selection_bundle&&eq(pkg.selection_bundle.profiles,{})&&eq(pkg.selection_bundle.rows,[]),'zero audience must have no proposed evidence');
    return {result:'NO_ELIGIBLE_PROFILES',digest:digest,editionKey:editionKey,runId:runId,queue:[],history:[]};
  }
  const templates=state.templates.filter(t=>t['Template ID']==='DAILY_BRIEFING_V1');
  R(templates.length===1&&templates[0].Status==='Active'&&templates[0].Environment==='DEVELOPMENT','daily template inactive or ambiguous');
  const b=pkg.selection_bundle;R(b.run_id===runId&&b.cutoff.slice(0,10)===pkg.edition_date,'evidence run/date mismatch');
  R(eq(b.published_history,state.publishedHistory.filter(h=>h.date<pkg.edition_date)),'published-history snapshot changed');
  R(eq(Object.keys(b.profiles).sort(),eligible.map(s=>s.id).sort()),'evidence audience mismatch');
  eligible.forEach(s=>{
    R(eq(b.profiles[s.id],state.personalization[s.id]),'saved personalization changed');
  });
  adbValidateSelectionEvidence(b);
  const queue=[],history=[];let shared;
  pkg.editions.forEach(e=>{
    adbPublisherKeys_(e,['profile_id','editorial','bindings']);const p=e.editorial;
    R(p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).every(k=>['date','preheader','pulse','weather','featured','topStories','underTheRadar','moreForYou','austinAhead','footer','fridayRecap','whatsNew','correction'].includes(k)),'unexpected editorial fields');
    R(p.date===pkg.edition_date&&p.footer&&p.footer.manageUrl===state.manageUrl,'editorial date/footer mismatch');
    // Profile identities belong outside the reader-facing editorial object.
    const body=JSON.stringify(p);R(!/@/.test(body.replace(/https:\/\/[^"\s]+/g,'')),'private address in editorial content');
    R(!p.fridayRecap||new Date(pkg.edition_date+'T12:00:00Z').getUTCDay()===5,'recap outside Friday');
    R(!p.whatsNew,'release notice requires separate approved policy gate');
    const core={date:p.date,pulse:p.pulse,weather:p.weather,featured:p.featured,topStories:p.topStories,underTheRadar:p.underTheRadar||null,austinAhead:p.austinAhead,fridayRecap:p.fridayRecap||null,correction:p.correction||null};
    if(shared===undefined)shared=core;R(eq(shared,core),'shared editorial content differs');
    const rendered=adbRenderDailyNewsletter(p),validation=adbValidateDailyNewsletterPayload_(rendered.html,rendered.text);
    R(validation.contract==='ADB-DAILY-HTML-1.0','layout validation failed');R(rendered.html.length<45000&&rendered.text.length<45000,'body size limit');
    const material=[];
    function add(section,items){(items||[]).forEach((item,index)=>material.push({section:section,index:index,item:item}));}
    add('Featured Top Story',[p.featured]);add('Top Story',p.topStories);if(p.underTheRadar)add('Under the Radar',[p.underTheRadar]);add('More for You',p.moreForYou);add('Austin Ahead',p.austinAhead);add('This Week in Austin',p.fridayRecap);
    const notes=b.rows.filter(r=>r.profile_id===e.profile_id);R(Array.isArray(e.bindings)&&e.bindings.length===material.length&&notes.length===material.length,'rendered/history item count differs');
    const bound=new Set();
    material.forEach(m=>{
      const links=e.bindings.filter(v=>v.section===m.section&&v.index===m.index);R(links.length===1,'missing/duplicate item binding');const binding=links[0];adbPublisherKeys_(binding,['section','index','key','category']);R(typeof binding.category==='string'&&binding.category.trim(),'category missing');
      const rows=notes.filter(r=>r.section===m.section&&r.key===binding.key);R(rows.length===1&&!bound.has(binding.key),'evidence binding missing/duplicate');bound.add(binding.key);const row=rows[0],note=JSON.parse(row.notes.slice('ADB-SELECTION-NOTE-1 '.length));
      const item=m.item,urls=item.sources?item.sources.map(s=>s.url):[item.url];
      R(urls.includes(row.source_url)&&urls.every(u=>note.candidate.sources.some(s=>s.url===u)),'rendered sources differ from selection');
      const headline=adbPublisherHistoryHeadline_(m.section,item);R(typeof headline==='string'&&headline.trim(),'history headline missing');
      const finalNote='ADB-SELECTION-NOTE-1 '+JSON.stringify(note)+C.SUFFIX;R(finalNote.length<45000,'history note size limit');
      history.push({'Run ID':runId,'Run Date':pkg.edition_date,'Profile ID':e.profile_id,'Section':m.section,'Category':binding.category,'Normalized Key':binding.key,'Headline':headline,'Source URL':row.source_url,'Material Update':row.material_update?'TRUE':'FALSE','Notes':finalNote,'Delivery Status':'Pending','Provider Message ID':''});
    });
    const subscriber=eligible.find(s=>s.id===e.profile_id);
    queue.push({'Message ID':'DAILY-LIVE:'+e.profile_id+':'+runId,'Created At':clock.iso,'Profile ID':e.profile_id,'Email':subscriber.email,'Template ID':'DAILY_BRIEFING_V1','Status':'Queued','Subject':'Austin Daily Briefing — '+pkg.edition_date,'Customize URL':C.CUSTOMIZE,'Sent At / Gmail ID':'','Notes':C.BUILD+' | package '+digest,'Plain Text':rendered.text,'HTML':rendered.html,'Run ID':runId});
  });
  // A completed target transaction is reconciled without appending or repairing.
  const existingQueue=state.queue.filter(r=>r['Run ID']===runId||String(r['Message ID']||'').endsWith(':'+runId));
  const existingHistory=state.history.filter(r=>r['Run ID']===runId);
  if(ledgers.length){
    R(ledgers[0]['Package SHA-256']===digest,'edition already committed with different package');
    R(existingQueue.length===queue.length&&existingHistory.length===history.length,'committed rows missing/duplicate');
    queue.forEach(q=>{const found=existingQueue.filter(r=>r['Message ID']===q['Message ID']);R(found.length===1,'committed queue identity mismatch');const r=found[0];R(C.QUEUE.filter(k=>!['Created At','Status','Sent At / Gmail ID','Notes'].includes(k)).every(k=>r[k]===q[k]),'committed queue payload changed');R(['Queued','Sending','Sent','Failed'].includes(r.Status),'unrecognized committed queue status');});
    history.forEach(h=>{const found=existingHistory.filter(r=>r['Profile ID']===h['Profile ID']&&r.Section===h.Section&&r['Normalized Key']===h['Normalized Key']);R(found.length===1,'committed history identity mismatch');const r=found[0];R(C.HISTORY.filter(k=>!['Notes','Delivery Status','Provider Message ID'].includes(k)).every(k=>r[k]===h[k]),'committed history payload changed');R(r.Notes===h.Notes||(r['Delivery Status']==='Sent'&&r.Notes.startsWith(h.Notes+' | ')),'committed editorial evidence changed');});
    return {result:'ALREADY_COMMITTED',digest:digest,editionKey:editionKey,runId:runId,queue:[],history:[]};
  }
  R(!existingQueue.length&&!existingHistory.length,'partial prior run requires manual reconciliation');
  R(!state.history.some(r=>r['Run Date']===pkg.edition_date&&eligible.some(s=>s.id===r['Profile ID']))&&!state.queue.some(r=>String(r['Run ID']||'').startsWith(pkg.edition_date)&&eligible.some(s=>s.id===r['Profile ID'])),'another run already owns edition');
  const ledger={'Edition Key':editionKey,'Package SHA-256':digest,'Run ID':runId,'Profile Count':queue.length,'History Count':history.length,'Committed At':clock.iso};
  return {result:'READY',digest:digest,editionKey:editionKey,runId:runId,queue:queue,history:history,ledger:ledger};
}

function adbPublisherTable_(book,name){
  const sheet=book.getSheetByName(name);adbPublisherRequire_(sheet,'missing target sheet');const values=sheet.getDataRange().getDisplayValues(),headers=values[0];
  return {sheetId:sheet.getSheetId(),headers:headers,rows:values.slice(1).filter(r=>r.some(v=>v!=='')).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]||''])))};
}
function adbPublisherState_(book){
  const tables={};['Environment','Subscribers','Profiles','Preferences','Message Templates','Outbound Messages','Briefing History','Publisher Ledger'].forEach(n=>tables[n]=adbPublisherTable_(book,n));
  const env=Object.fromEntries(tables.Environment.rows.map(r=>[r.Setting,r.Value]));
  const personalization={};tables.Profiles.rows.forEach(p=>{
    const prefs={};tables.Preferences.rows.filter(r=>r['Profile ID']===p['Profile ID']).forEach(r=>{adbPublisherRequire_(!Object.hasOwnProperty.call(prefs,r['Interest ID']),'duplicate saved preference');prefs[r['Interest ID']]=r.Preference;});
    personalization[p['Profile ID']]={volume:p['More for You Volume'],summary_style:p['Summary Style'],why_it_matters_length:p['Why It Matters Length'],preferences:prefs};
  });
  const published=[];
  tables['Briefing History'].rows.filter(r=>r['Delivery Status']==='Sent').forEach(r=>{
    adbPublisherRequire_(r.Notes.startsWith('ADB-SELECTION-NOTE-1 '),'legacy published history needs normalized evidence');
    const json=r.Notes.slice('ADB-SELECTION-NOTE-1 '.length).split(ADB_PUBLISHER.SUFFIX)[0],n=JSON.parse(json),c=n.candidate;
    published.push({date:r['Run Date'],profile_id:r['Profile ID'],key:r['Normalized Key'],topic:c.topic,lane:c.lane,facts:c.fact,delivered:true});
  });
  return {environment:env.Environment,externalDelivery:env['Allow External Delivery'],sourceRevision:PropertiesService.getScriptProperties().getProperty(ADB_PUBLISHER.REVISION_PROPERTY),queueHeaders:tables['Outbound Messages'].headers,historyHeaders:tables['Briefing History'].headers,ledgerHeaders:tables['Publisher Ledger'].headers,queue:tables['Outbound Messages'].rows,history:tables['Briefing History'].rows,ledger:tables['Publisher Ledger'].rows,subscribers:tables.Subscribers.rows,profiles:tables.Profiles.rows,templates:tables['Message Templates'].rows,personalization:personalization,publishedHistory:published,manageUrl:env['Manage URL'],tables:tables};
}

/** Reads immutable SHA-bound package chunks from this DEV workbook only.
 * A READY manifest is operator sealed; edits invalidate its digest.
 */
function publishReadyEditorialPackageDevV1(packageId){
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    const props=PropertiesService.getScriptProperties(),id=props.getProperty(ADB_PUBLISHER.DEV_ID_PROPERTY);
    adbPublisherRequire_(id&&!ADB_PUBLISHER.PRODUCTION_IDS.includes(id),'DEV database target required');
    const book=SpreadsheetApp.openById(id),state=adbPublisherState_(book);
    const manifests=adbPublisherTable_(book,'Packages').rows.filter(r=>r['Package ID']===packageId);adbPublisherRequire_(manifests.length===1,'package not unique');const manifest=manifests[0];
    adbPublisherRequire_(manifest.State==='READY','package not READY');
    const chunks=adbPublisherTable_(book,'Package Chunks').rows.filter(r=>r['Package ID']===packageId).sort((a,b)=>Number(a.Sequence)-Number(b.Sequence));
    adbPublisherRequire_(chunks.length===Number(manifest['Chunk Count'])&&chunks.every((r,i)=>Number(r.Sequence)===i+1),'missing or duplicate package chunks');
    const raw=chunks.map(r=>r.JSON).join(''),pkg=JSON.parse(raw);
    adbPublisherRequire_(adbPublisherDigest_(adbPublisherCanonical_(pkg))===manifest['Package SHA-256'],'sealed package changed');
    const now=new Date(),clock={iso:now.toISOString(),editionDate:Utilities.formatDate(now,'America/Chicago','yyyy-MM-dd')};
    let plan=adbPlanEditorialPublication(pkg,state,clock,adbPublisherDigest_);
    if(plan.result==='ALREADY_COMMITTED'||plan.result==='NO_ELIGIBLE_PROFILES')return {result:plan.result,runId:plan.runId};
    // Re-read eligibility, schemas, duplicate records and immutable package immediately
    // before one Sheets request. Script lock coordinates this publisher project only.
    const fresh=adbPublisherState_(book);adbPublisherRequire_(adbPublisherDigest_(adbPublisherCanonical_(fresh))===adbPublisherDigest_(adbPublisherCanonical_(state)),'database changed during validation');
    const freshManifest=adbPublisherTable_(book,'Packages').rows.filter(r=>r['Package ID']===packageId);
    const freshChunks=adbPublisherTable_(book,'Package Chunks').rows.filter(r=>r['Package ID']===packageId).sort((a,b)=>Number(a.Sequence)-Number(b.Sequence));
    adbPublisherRequire_(adbPublisherCanonical_(freshManifest)===adbPublisherCanonical_(manifests)&&adbPublisherCanonical_(freshChunks)===adbPublisherCanonical_(chunks),'staging changed during validation');
    function append(name,headers,rows){return {appendCells:{sheetId:fresh.tables[name].sheetId,rows:rows.map(r=>({values:headers.map(h=>({userEnteredValue:typeof r[h]==='number'?{numberValue:r[h]}:{stringValue:r[h]}}))})),fields:'userEnteredValue'}};}
    const request={requests:[append('Outbound Messages',ADB_PUBLISHER.QUEUE,plan.queue),append('Briefing History',ADB_PUBLISHER.HISTORY,plan.history),append('Publisher Ledger',ADB_PUBLISHER.LEDGER,[plan.ledger])]};
    adbPublisherRequire_(Utilities.newBlob(JSON.stringify(request)).getBytes().length<ADB_PUBLISHER.MAX_BYTES,'atomic request exceeds measured byte limit');
    Sheets.Spreadsheets.batchUpdate(request,id);
    // Timeout after commit is handled by rerunning: the ledger is in the same batch.
    const verified=adbPlanEditorialPublication(pkg,adbPublisherState_(book),clock,adbPublisherDigest_);
    adbPublisherRequire_(verified.result==='ALREADY_COMMITTED','atomic commit readback mismatch');
    return {result:'COMMITTED',runId:plan.runId,profiles:plan.queue.length,historyRows:plan.history.length};
  }finally{lock.releaseLock();}
}
