/** ADB-DEV-REVIEW-HOST-0.1. Unconfigured standalone DEV review host.
 * Requires Advanced Sheets, the handoff adapter and its existing dependencies.
 * Only sealed staging is writable. No publication, sends or trigger creation.
 */
const ADB_DEV_REVIEW_HOST = Object.freeze({
  PROPERTY:'ADB_DEV_REVIEW_POLICY_JSON',
  PACKAGES:['Package ID','State','Chunk Count','Package SHA-256'],
  CHUNKS:['Package ID','Sequence','JSON'],
  REVIEWS:['Package ID','Review JSON'],
  DATABASE_TABLES:['Environment','Subscribers','Profiles','Preferences','Message Templates','Outbound Messages','Briefing History','Publisher Ledger'],
  MAX_ROWS:2000,MAX_CELL:40000
});

function adbDevReviewPolicy_() {
  const raw=PropertiesService.getScriptProperties().getProperty(ADB_DEV_REVIEW_HOST.PROPERTY);
  adbDevHandoffRequire_(raw,'DEV review host has not been configured');
  const p=JSON.parse(raw);
  adbDevHandoffRequire_(typeof p.operator==='string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.operator) &&
    p.operator===p.operator.toLowerCase(),'explicit lowercase operator identity required');
  adbDevHandoffRequire_(PropertiesService.getScriptProperties().getProperty(ADB_PUBLISHER.REVISION_PROPERTY)===p.sourceRevision,'host revision pin mismatch');
  adbDevHandoffRequire_(!SpreadsheetApp.getActiveSpreadsheet(),'use a fresh standalone review project');
  adbDevHandoffRequire_(ScriptApp.getProjectTriggers().length===0 &&
    typeof dispatchQueuedDailyBriefingsViaResendV1==='undefined','review project must not own dispatch or triggers');
  return p;
}

function adbDevReviewIdentity_(policy) {
  const active=String(Session.getActiveUser().getEmail()||'').toLowerCase();
  const effective=String(Session.getEffectiveUser().getEmail()||'').toLowerCase();
  adbDevHandoffRequire_(active && active===policy.operator && effective===policy.operator,'authenticated operator identity unavailable or mismatched');
  return active;
}

/** Fresh API snapshots, not SpreadsheetApp cached values. No caller ranges/IDs. */
function adbDevReviewTables_(id,names,role) {
  const R=adbDevHandoffRequire_,C=ADB_DEV_REVIEW_HOST;
  const meta=Sheets.Spreadsheets.get(id,{fields:'sheets(properties(sheetId,title))'});
  const sheets=meta.sheets||[],ranges=names.map(name=>"'"+name.replace(/'/g,"''")+"'");
  const response=Sheets.Spreadsheets.Values.batchGet(id,{ranges:ranges,valueRenderOption:'UNFORMATTED_VALUE'});
  R(response.valueRanges && response.valueRanges.length===names.length,'incomplete table response');
  const tables={};
  names.forEach((name,index)=>{
    const matches=sheets.filter(s=>s.properties.title===name);R(matches.length===1,'missing/ambiguous DEV table');
    const values=(response.valueRanges[index].values||[]).map(row=>row.map(v=>v===null?'':String(v)));
    R(values.length>0 && values.length<=C.MAX_ROWS,'empty or oversized DEV table');
    const headers=values[0];R(headers.every(h=>h && h!=='__proto__') && new Set(headers).size===headers.length,'invalid/duplicate DEV headers');
    R(values.every(row=>row.length<=headers.length && row.every(v=>v.length<C.MAX_CELL)),'oversized/extra DEV cell');
    const rows=values.slice(1).filter(row=>row.some(v=>v!=='')).map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]||''])));
    tables[name]={headers:headers,rows:rows,sheetId:matches[0].properties.sheetId,values:values};
  });
  const env={};tables.Environment.rows.forEach(row=>{
    R(row.Setting && !Object.prototype.hasOwnProperty.call(env,row.Setting),'duplicate environment setting');env[row.Setting]=row.Value;
  });
  R(env.Environment==='DEVELOPMENT' && env['Allow External Delivery']==='FALSE' &&
    env['Production Writes']==='FORBIDDEN' && env['QA Purpose']==='ISOLATED_REVIEWED_HANDOFF_DEV' &&
    env['Handoff Role']===role,'file is not the expected isolated DEV role');
  return {tables:tables,env:env};
}

function adbDevReviewStageTables_(id,role) {
  const names=['Environment','Packages','Package Chunks'];if(role==='SEALED_STAGING')names.push('DEV Package Reviews');
  const out=adbDevReviewTables_(id,names,role),t=out.tables,C=ADB_DEV_REVIEW_HOST;
  adbDevHandoffRequire_(adbPublisherCanonical_(t.Packages.headers)===adbPublisherCanonical_(C.PACKAGES) &&
    adbPublisherCanonical_(t['Package Chunks'].headers)===adbPublisherCanonical_(C.CHUNKS),'staging schema drift');
  if(role==='SEALED_STAGING')adbDevHandoffRequire_(adbPublisherCanonical_(t['DEV Package Reviews'].headers)===adbPublisherCanonical_(C.REVIEWS),'review schema drift');
  return out;
}

/** Validate whole small staging file so orphan/duplicate rows cannot be hidden. */
function adbDevReviewStages_(snapshot,sealed) {
  const R=adbDevHandoffRequire_,t=snapshot.tables,ids=new Set(),records=[];
  const chunks=t['Package Chunks'].rows,receipts=sealed?t['DEV Package Reviews'].rows:[];
  t.Packages.rows.forEach(row=>{
    const id=row['Package ID'];R(/^[A-Za-z0-9_-]{1,100}$/.test(id) && !ids.has(id),'duplicate/invalid staged package');ids.add(id);
    R(/^[1-9][0-9]*$/.test(row['Chunk Count']),'invalid chunk count');
    const stage={manifest:Object.assign({},row,{'Chunk Count':Number(row['Chunk Count'])}),chunks:chunks.filter(c=>c['Package ID']===id).map(c=>{
      R(/^[1-9][0-9]*$/.test(c.Sequence),'invalid chunk sequence');return Object.assign({},c,{Sequence:Number(c.Sequence)});
    })};
    let review=null;
    if(sealed) {
      adbDevReadReadyV1(stage,adbPublisherDigest_);
      const found=receipts.filter(r=>r['Package ID']===id);R(found.length===1,'missing/duplicate review receipt');review=JSON.parse(found[0]['Review JSON']);
      R(review && review.ticket && review.ticket.packageId===id && review.ticket.packageDigest===row['Package SHA-256'],'review receipt binding mismatch');
    } else {adbDevDecodeStage_(stage,'DRAFT');R(row['Package SHA-256']==='','draft digest must be empty');}
    records.push({stage:stage,review:review});
  });
  R(chunks.every(c=>ids.has(c['Package ID'])) && receipts.every(r=>ids.has(r['Package ID'])),'orphan staging rows');
  return records;
}

function adbDevReviewHost_() {
  const policy=adbDevReviewPolicy_(),R=adbDevHandoffRequire_,C=ADB_DEV_REVIEW_HOST;
  const io={
    operatorIdentity:function(){return adbDevReviewIdentity_(policy);},
    withLock:function(fn){const lock=LockService.getScriptLock();lock.waitLock(30000);try{return fn();}finally{lock.releaseLock();}},
    readTrusted:function(id){
      R(id===policy.databaseId,'unconfigured database target');
      const snapshot=adbDevReviewTables_(id,C.DATABASE_TABLES,'DATABASE');
      const facade={getSheetByName:function(name){const t=snapshot.tables[name];return t?{getSheetId:()=>t.sheetId,getDataRange:()=>({getDisplayValues:()=>t.values})}:null;}};
      const state=adbPublisherState_(facade);delete state.tables;
      const now=new Date(),env=snapshot.env;
      return {databaseId:id,state:state,clock:{iso:now.toISOString(),editionDate:Utilities.formatDate(now,'America/Chicago','yyyy-MM-dd')},
        history:{cutoff:env['History Cutoff'],windowStart:env['History Window Start'],recentComplete:env['Recent History Complete']==='TRUE',extendedComplete:env['Extended History Complete']==='TRUE'}};
    },
    readDraft:function(id,key){R(id===policy.draftId,'unconfigured draft target');const rows=adbDevReviewStages_(adbDevReviewStageTables_(id,'DRAFT_INBOX'),false).filter(r=>r.stage.manifest['Package ID']===key);R(rows.length===1,'draft not unique');return rows[0].stage;},
    readSealed:function(id,key){R(id===policy.sealedId,'unconfigured sealed target');return adbDevReviewStages_(adbDevReviewStageTables_(id,'SEALED_STAGING'),true).filter(r=>r.stage.manifest['Package ID']===key);},
    appendSealed:function(id,record){
      R(id===policy.sealedId,'unconfigured sealed target');adbDevReviewIdentity_(policy);
      const snapshot=adbDevReviewStageTables_(id,'SEALED_STAGING');
      const existing=adbDevReviewStages_(snapshot,true);
      R(!existing.some(r=>r.stage.manifest['Package ID']===record.stage.manifest['Package ID']),'sealed package already exists');
      const json=adbPublisherCanonical_(record.review);R(json.length<C.MAX_CELL,'review receipt too large');
      function append(name,headers,rows) {
        R(snapshot.tables[name].rows.length+rows.length<C.MAX_ROWS,'sealed table row limit');
        return {appendCells:{sheetId:snapshot.tables[name].sheetId,rows:rows.map(row=>({values:headers.map(h=>{
          const value=row[h];R(typeof value==='string'||typeof value==='number','unsupported persisted cell');
          R(String(value).length<C.MAX_CELL,'persisted cell too large');
          return {userEnteredValue:typeof value==='number'?{numberValue:value}:{stringValue:value}};
        })})),fields:'userEnteredValue'}};
      }
      const request={requests:[append('Packages',C.PACKAGES,[record.stage.manifest]),append('Package Chunks',C.CHUNKS,record.stage.chunks),
        append('DEV Package Reviews',C.REVIEWS,[{'Package ID':record.stage.manifest['Package ID'],'Review JSON':json}])]};
      R(Utilities.newBlob(JSON.stringify(request)).getBytes().length<ADB_PUBLISHER.MAX_BYTES,'sealed transaction too large');
      Sheets.Spreadsheets.batchUpdate(request,id);
    }
  };
  // Factory validates all fixed targets before any file access is possible.
  return adbCreateDevReviewedHandoffV1(policy,io,adbPublisherDigest_);
}

/** Owner-only web app, execute as user accessing. No parameter-triggered action. */
function doGet() {
  const host=adbDevReviewHost_();host.exportSnapshot();
  return HtmlService.createHtmlOutputFromFile('EditorialPublisherDevReview').setTitle('ADB DEV editorial review');
}
function adbDevReviewLoadV1(packageId) {
  return adbDevReviewHost_().prepareReview(packageId);
}
function adbDevReviewSealV1(ticket) {
  return adbDevReviewHost_().sealReviewed(ticket);
}
