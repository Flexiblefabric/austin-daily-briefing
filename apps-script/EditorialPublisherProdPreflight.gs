/** ADB-PUBLISHER-PROD-PREFLIGHT-0.1. Read-only, standalone inspection.
 * Install in the EXISTING project that owns ResendTransport.gs and its daily
 * dispatcher trigger. This file does not implement production publication.
 * No write, delivery, alert, trigger creation, or configuration mutation API.
 */
const ADB_PUBLISHER_PROD_PREFLIGHT = Object.freeze({
  BUILD:'ADB-PUBLISHER-PROD-PREFLIGHT-0.1',
  DATABASE_ID:'1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0',
  INTAKE_ID:'1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho',
  FORBIDDEN_STAGING_IDS:['1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0',
    '1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho',
    '1rl5GTOvuBSHyFK1r9CqI_6Z5gAwtgsTQnQQf9VCMeyM',
    '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw',
    '1I9UAR6kabPt0P_lvDiJX_oskPeCVcVI64_vTbwEOF2I'],
  QUEUE:['Message ID','Created At','Profile ID','Email','Template ID','Status',
    'Subject','Customize URL','Sent At / Gmail ID','Notes','Plain Text','HTML','Run ID'],
  HISTORY:['Run ID','Run Date','Profile ID','Section','Category','Normalized Key',
    'Headline','Source URL','Material Update','Notes','Delivery Status','Provider Message ID'],
  LEDGER:['Edition Key','Package SHA-256','Run ID','Profile Count','History Count','Committed At']
});

function adbProdPublisherReadTable_(book,name,optional) {
  const sheet=book.getSheetByName(name);
  if (!sheet) {
    if (optional) return null;
    throw new Error('Required preflight table missing: '+name);
  }
  const data=sheet.getDataRange().getDisplayValues();
  return {headers:data[0].map(String),raw:data.slice(1).filter(r=>r.some(v=>v!==''))};
}

/** First-column identity is canonical. Identical mirrored duplicate headers are
 * tolerated only for Preferences Profile ID; conflicting mirrors fail closed.
 */
function adbProdPublisherNormalizeTable_(table,allowProfileMirror) {
  const first=new Map(),duplicates=[];
  table.headers.forEach((name,i)=>{
    if (!name) return;
    if (first.has(name)) {
      if (!(allowProfileMirror && name==='Profile ID')) {
        throw new Error('Unexpected duplicate production header');
      }
      duplicates.push([first.get(name),i]);
    } else first.set(name,i);
  });
  return table.raw.map(row=>{
    duplicates.forEach(([a,b])=>{
      if (row[b] && row[b]!==row[a]) throw new Error('Conflicting Preferences profile-ID mirror');
    });
    return Object.fromEntries(Array.from(first.entries()).map(([name,i])=>[name,row[i]||'']));
  });
}

/** Non-destructive history adapter. Older unstructured records are never turned
 * into invented facts. They block extended/evergreen history, not an otherwise
 * complete 14-day news lookup. Read the full archive before calling this helper.
 */
function adbProdPublisherNormalizeHistoryV1(rows,editionDate,windowStart,requiresExtendedHistory) {
  const validDate=value=>typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value+'T00:00:00Z')) &&
    new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
  if(!validDate(editionDate)||!validDate(windowStart)||
    Date.parse(windowStart)>Date.parse(editionDate)-14*86400000) {
    throw new Error('Production history window must cover at least 14 days');
  }
  const out={publishedHistory:[],legacyOutsideWindow:0,recentLegacy:0,
    malformedOutsideWindow:0,recentMalformed:0,invalidDates:0,sentRows:0};
  rows.forEach(r=>{
    if(r['Delivery Status']!=='Sent')return;out.sentRows++;
    const date=r['Run Date'];if(!validDate(date)||date>editionDate){out.invalidDates++;return;}
    if(date===editionDate)return; // current edition is duplicate/ledger state, not prior history
    const recent=date>=windowStart,notes=String(r.Notes||'');
    if(!notes.startsWith('ADB-SELECTION-NOTE-1 ')){
      out[recent?'recentLegacy':'legacyOutsideWindow']++;return;
    }
    try{
      const n=JSON.parse(notes.slice(notes.indexOf('{'),notes.lastIndexOf('}')+1)),c=n.candidate;
      if(n.schema!=='ADB-SELECTION-NOTE-1'||!c||!c.key||!c.topic||!c.lane||!c.fact||c.key!==r['Normalized Key'])throw Error('invalid envelope');
      out.publishedHistory.push({date:date,profile_id:r['Profile ID'],key:r['Normalized Key'],
        topic:c.topic,lane:c.lane,facts:c.fact,delivered:true});
    }catch(ignored){out[recent?'recentMalformed':'malformedOutsideWindow']++;}
  });
  out.recentComplete=out.recentLegacy===0 && out.recentMalformed===0 && out.invalidDates===0;
  out.extendedHistoryKnown=out.recentComplete && out.legacyOutsideWindow===0 && out.malformedOutsideWindow===0;
  if(requiresExtendedHistory && !out.extendedHistoryKnown)throw new Error('Extended resource history is unresolved; no invented legacy facts permitted');
  return out;
}

/** Pure, privacy-safe evaluation. No raw subscriber data enters the report. */
function adbEvaluateProdPublisherPreflightV1(input) {
  const C=ADB_PUBLISHER_PROD_PREFLIGHT,checks=[];
  const check=(id,ok,detail)=>checks.push({id:id,status:ok?'PASS':'BLOCKED',detail:detail});
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const env=Object.fromEntries(input.environment.map(r=>[r.Setting,r.Value]));
  const integration=Object.fromEntries(input.integration.map(r=>[r.Setting,r.Value]));
  const release=Object.fromEntries(input.release.map(r=>[r.Setting,r.Value]));
  check('production_identity',env.Environment==='PRODUCTION' &&
    env['Database ID']===C.DATABASE_ID && env['Google Intake Workbook ID']===C.INTAKE_ID,
    'Exact production workbook identities and environment.');
  check('production_safety_gates',env['Schema Baseline']==='GOOGLE-23-1' &&
    env['Production Writes']==='ENABLED' && env['Allow External Delivery']==='TRUE' &&
    ['GOOGLE ONLY','GOOGLE + NATIVE CONTROLLED','GOOGLE + NATIVE'].includes(env['Intake Mode']) &&
    integration.Environment==='PRODUCTION' &&
    integration['Operational Production Database ID']===C.DATABASE_ID &&
    integration['Processor Mode']===env['Intake Mode'] && integration['Delivery Mode']==='ENABLED',
    'Existing delivery/intake controls; this does not enable the new publisher.');
  check('queue_schema',same(input.queueHeaders,C.QUEUE),'Exact ordered 13-column queue.');
  check('history_schema',same(input.historyHeaders,C.HISTORY),'Exact ordered 12-column history.');
  const daily=input.templates.filter(r=>r['Template ID']==='DAILY_BRIEFING_V1' &&
    r.Active==='TRUE' && r.Environment==='PRODUCTION');
  check('production_template',daily.length===1,'Exactly one active PRODUCTION daily template using Active=TRUE.');
  let preferences=[],prefOk=true;
  try { preferences=adbProdPublisherNormalizeTable_(input.preferences,true); }
  catch(ignored) { prefOk=false; }
  const prefKeys=new Set();
  preferences.forEach(r=>{
    const k=JSON.stringify([r['Profile ID'],r['Interest ID']]);
    if (!r['Profile ID'] || !r['Interest ID'] || !['Off','Normal','High'].includes(r.Preference) || prefKeys.has(k)) prefOk=false;
    prefKeys.add(k);
  });
  check('preference_identity',prefOk,'Canonical first Profile ID; mirrored values must agree; unique profile/interest pairs.');
  let eligible=0,identityOk=true;const ids=new Set(),emails=new Set();
  input.subscribers.filter(r=>r.Status==='Active' && r['Admin Status']==='OK').forEach(r=>{
    const id=r['Profile ID'],email=String(r.Email||'').trim().toLowerCase();
    const matches=input.profiles.filter(p=>p['Profile ID']===id);
    const duplicates=input.subscribers.filter(s=>s['Profile ID']===id || String(s.Email||'').trim().toLowerCase()===email);
    if (!id || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || ids.has(id) || emails.has(email) ||
      duplicates.length!==1 || matches.length!==1 || matches[0].Status!=='Active' ||
      String(matches[0]['Primary Preference Email']||'').trim().toLowerCase()!==email) identityOk=false;
    ids.add(id);emails.add(email);eligible++;
  });
  check('audience_identity',identityOk,'Active + Admin Status OK; unique subscriber/profile resolution.');
  const history=adbProdPublisherNormalizeHistoryV1(input.history,input.editionDate,input.historyWindowStart,false);
  check('published_history_recent',history.recentComplete,
    '14-day prior-history lookup: legacy='+history.recentLegacy+', malformed='+history.recentMalformed+', invalid dates='+history.invalidDates+'.');
  checks.push({id:'published_history_extended',status:history.extendedHistoryKnown?'PASS':'UNKNOWN',
    detail:'Older legacy Sent rows='+history.legacyOutsideWindow+'. Extended/evergreen candidates must remain blocked until their full applicable history is established; no archive backfill.'});
  check('publisher_ledger',same(input.ledgerHeaders,C.LEDGER),
    'A dedicated production ledger is required for one atomic target transaction.');
  check('dispatcher_colocation',input.dispatcherPresent && input.dispatcherUsesScriptLock && input.dailyDispatcherTriggers===1,
    'Publisher must share the existing dispatcher project and ScriptLock; one daily dispatcher trigger.');
  check('layout_guard',input.layoutGuard==='ENFORCE','Existing independent dispatcher layout guard must be ENFORCE.');
  check('no_publisher_trigger',input.publisherTriggers===0,'No publisher trigger may be activated by preflight.');
  check('publisher_mode_inert',['DISABLED','SHADOW'].includes(input.publisherMode),
    'New publisher stays DISABLED/SHADOW; this build provides no production commit entry point.');
  check('release_monitoring_gates',release['Release B Version']==='ADB-PROD-RELEASE-B-1' &&
    release['Release B Controlled Test']==='PASS' && String(release['Success Notifications']||'').toUpperCase()==='SILENT',
    'Existing Release B control test and silent-success policy.');
  const morning=input.operations.filter(r=>r.Component==='Morning Briefing');
  check('morning_monitoring_identity',morning.length===1 && morning[0].Status==='Healthy',
    'One existing Healthy Morning Briefing row; no status write or recovery claim.');
  check('private_staging',input.stagingConfigured && input.stagingValid,
    'Separate production staging workbook, delivery disabled, exact package/chunk schemas.');
  checks.push({id:'generator_capability_separation',status:'UNKNOWN',
    detail:'Manual access evidence required: generator can write staging but cannot write production queue/history/ledger. Same-owner prompts alone do not enforce this.'});
  checks.push({id:'immutable_ready_permissions',status:'UNKNOWN',
    detail:'Manual evidence required: READY payload/digest and operational targets are protected from the drafting principal.'});
  checks.push({id:'publisher_monitoring_integration',status:'BLOCKED',
    detail:'Prepare idempotent publisher-stage monitoring and failure-only alert ownership before cutover; this check writes nothing.'});
  checks.push({id:'production_commit_adapter',status:'BLOCKED',
    detail:'Production write path is not installed or implemented in this read-only preflight build.'});
  return {build:C.BUILD,result:'BLOCKED',scope:'new publisher readiness; not current production delivery health',
    productionPublishingEnabled:false,writes:false,emails:false,
    metrics:{eligibleProfiles:eligible,preferenceRows:preferences.length,sentHistoryRows:history.sentRows,
      legacySentRows:history.legacyOutsideWindow+history.recentLegacy,
      malformedStructuredSentRows:history.malformedOutsideWindow+history.recentMalformed,
      recentHistoryComplete:history.recentComplete,extendedHistoryKnown:history.extendedHistoryKnown},checks:checks};
}

/** Inspect only this project and the executing user's triggers. Never invokes delivery. */
function inspectEditorialPublisherProjectReadinessV1() {
  const guard=PropertiesService.getScriptProperties().getProperty('ADB_DAILY_LAYOUT_GUARD_MODE');
  const normalizedGuard=String(guard||'STAGED').toUpperCase();
  const present=typeof dispatchQueuedDailyBriefingsViaResendV1==='function';
  const handlers=ScriptApp.getProjectTriggers().map(t=>t.getHandlerFunction());
  const report={build:ADB_PUBLISHER_PROD_PREFLIGHT.BUILD,scope:'current project and executing user',
    writes:false,emails:false,dispatcherPresent:present,
    dispatcherScriptLockReference:present && /LockService\.getScriptLock/.test(String(dispatchQueuedDailyBriefingsViaResendV1)),
    visibleDailyDispatcherTriggers:handlers.filter(n=>n==='dispatchQueuedDailyBriefingsViaResendV1').length,
    triggerVisibility:'executing user only; other owners are not visible',
    layoutGuardPropertyPresent:guard!==null,
    preflightEffectiveLayoutGuard:['ENFORCE','STAGED','DISABLED'].includes(normalizedGuard)?normalizedGuard:'OTHER',
    layoutGuardPass:normalizedGuard==='ENFORCE'};
  Logger.log(JSON.stringify(report));
  return report;
}

function checkEditorialPublisherProductionReadinessV1() {
  const C=ADB_PUBLISHER_PROD_PREFLIGHT,props=PropertiesService.getScriptProperties();
  const database=SpreadsheetApp.openById(C.DATABASE_ID),intake=SpreadsheetApp.openById(C.INTAKE_ID);
  const read=(book,name)=>adbProdPublisherReadTable_(book,name,false);
  const rows=(book,name)=>adbProdPublisherNormalizeTable_(read(book,name),false);
  const ledger=adbProdPublisherReadTable_(database,'Publisher Ledger',true);
  const triggers=ScriptApp.getProjectTriggers().map(t=>t.getHandlerFunction());
  const stageId=String(props.getProperty('ADB_PUBLISHER_PROD_STAGING_ID')||'').trim();
  let stageValid=false;
  if(stageId && !C.FORBIDDEN_STAGING_IDS.includes(stageId)){
    try{
      const staging=SpreadsheetApp.openById(stageId),env=Object.fromEntries(rows(staging,'Environment').map(r=>[r.Setting,r.Value]));
      stageValid=env.Environment==='PUBLISHER_STAGING' && env['Allow External Delivery']==='FALSE' &&
        env['Production Publishing']==='DISABLED' &&
        JSON.stringify(read(staging,'Packages').headers)===JSON.stringify(['Package ID','State','Chunk Count','Package SHA-256']) &&
        JSON.stringify(read(staging,'Package Chunks').headers)===JSON.stringify(['Package ID','Sequence','JSON']);
    }catch(ignored){stageValid=false;}
  }
  const dispatcherPresent=typeof dispatchQueuedDailyBriefingsViaResendV1==='function';
  const editionDate=Utilities.formatDate(new Date(),'America/Chicago','yyyy-MM-dd');
  const windowStart=new Date(Date.parse(editionDate+'T00:00:00Z')-14*86400000).toISOString().slice(0,10);
  const input={editionDate:editionDate,historyWindowStart:windowStart,
    environment:rows(database,'Environment'),integration:rows(intake,'Integration Config'),
    release:rows(intake,'Release Config'),operations:rows(intake,'Operations Status'),
    queueHeaders:read(database,'Outbound Messages').headers,historyHeaders:read(database,'Briefing History').headers,
    templates:rows(database,'Message Templates'),preferences:read(database,'Preferences'),
    subscribers:rows(database,'Subscribers'),profiles:rows(database,'Profiles'),history:rows(database,'Briefing History'),
    ledgerHeaders:ledger?ledger.headers:[],dispatcherPresent:dispatcherPresent,
    dispatcherUsesScriptLock:dispatcherPresent && /LockService\.getScriptLock/.test(String(dispatchQueuedDailyBriefingsViaResendV1)),
    dailyDispatcherTriggers:triggers.filter(n=>n==='dispatchQueuedDailyBriefingsViaResendV1').length,
    publisherTriggers:triggers.filter(n=>/publishReadyEditorial|PublisherProd/.test(n)).length,
    layoutGuard:String(props.getProperty('ADB_DAILY_LAYOUT_GUARD_MODE')||'STAGED').toUpperCase(),
    publisherMode:String(props.getProperty('ADB_PUBLISHER_PROD_MODE')||'DISABLED').toUpperCase(),
    stagingConfigured:!!stageId,stagingValid:stageValid};
  const report=adbEvaluateProdPublisherPreflightV1(input);
  Logger.log(JSON.stringify({build:report.build,result:report.result,
    productionPublishingEnabled:false,writes:false,emails:false,metrics:report.metrics,
    blocked:report.checks.filter(c=>c.status==='BLOCKED').map(c=>c.id),
    unknown:report.checks.filter(c=>c.status==='UNKNOWN').map(c=>c.id)}));
  return report;
}
