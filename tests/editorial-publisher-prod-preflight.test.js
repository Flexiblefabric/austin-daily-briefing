'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('apps-script/EditorialPublisherProdPreflight.gs','utf8');
function runtime(){const c=vm.createContext({});vm.runInContext(source,c);return c;}
const ctx=runtime(),C=vm.runInContext('ADB_PUBLISHER_PROD_PREFLIGHT',ctx),clone=x=>JSON.parse(JSON.stringify(x));
function fixture(){
 const kv=o=>Object.entries(o).map(([Setting,Value])=>({Setting,Value}));
 return {editionDate:'2026-10-28',historyWindowStart:'2026-10-14',environment:kv({Environment:'PRODUCTION','Database ID':C.DATABASE_ID,'Google Intake Workbook ID':C.INTAKE_ID,'Schema Baseline':'GOOGLE-23-1','Production Writes':'ENABLED','Allow External Delivery':'TRUE','Intake Mode':'GOOGLE + NATIVE'}),
 integration:kv({Environment:'PRODUCTION','Operational Production Database ID':C.DATABASE_ID,'Processor Mode':'GOOGLE + NATIVE','Delivery Mode':'ENABLED'}),
 release:kv({'Release B Version':'ADB-PROD-RELEASE-B-1','Release B Controlled Test':'PASS','Success Notifications':'SILENT'}),
 operations:[{Component:'Morning Briefing',Status:'Healthy'}],
 queueHeaders:clone(C.QUEUE),historyHeaders:clone(C.HISTORY),ledgerHeaders:clone(C.LEDGER),
 templates:[{'Template ID':'DAILY_BRIEFING_V1',Active:'TRUE',Environment:'PRODUCTION'}],
 preferences:{headers:['Profile ID','Interest ID','Preference','Score','Updated','Source Submission ID','Profile ID'],raw:[['PRIVATE-ID','TEST','Normal','1','','','']]},
 subscribers:[{'Profile ID':'PRIVATE-ID',Email:'private-recipient@example.invalid',Status:'Active','Admin Status':'OK'}],
 profiles:[{'Profile ID':'PRIVATE-ID','Primary Preference Email':'private-recipient@example.invalid',Status:'Active'}],
 history:[{'Run Date':'2026-10-27','Normalized Key':'test','Profile ID':'PRIVATE-ID','Delivery Status':'Sent',Notes:'ADB-SELECTION-NOTE-1 '+JSON.stringify({schema:'ADB-SELECTION-NOTE-1',candidate:{key:'test',topic:'test',lane:'top',fact:'A synthetic archived fact.'}})+' Awaiting Resend dispatcher delivery. | Resend accepted synthetic.'}],
 dispatcherPresent:true,dispatcherUsesScriptLock:true,dailyDispatcherTriggers:1,publisherTriggers:0,layoutGuard:'ENFORCE',publisherMode:'DISABLED',stagingConfigured:true,stagingValid:true};
}
function evaluate(x){return clone(ctx.adbEvaluateProdPublisherPreflightV1(x));}
function status(report,id){return report.checks.find(c=>c.id===id).status;}
test('production preflight never claims activation readiness or reveals private input',()=>{
 const report=evaluate(fixture());assert.equal(report.result,'BLOCKED');assert.equal(report.productionPublishingEnabled,false);assert.equal(report.writes,false);assert.equal(report.emails,false);
 assert.equal(status(report,'generator_capability_separation'),'UNKNOWN');assert.equal(status(report,'production_commit_adapter'),'BLOCKED');
 assert(!JSON.stringify(report).includes('private-recipient'));assert(!JSON.stringify(report).includes('PRIVATE-ID'));
});
test('production Active=TRUE template is accepted; DEV Status=Active is rejected',()=>{
 const x=fixture();assert.equal(status(evaluate(x),'production_template'),'PASS');
 x.templates=[{'Template ID':'DAILY_BRIEFING_V1',Status:'Active',Environment:'PRODUCTION'}];assert.equal(status(evaluate(x),'production_template'),'BLOCKED');
});
test('canonical Profile ID survives a blank mirrored header column',()=>{
 const table=fixture().preferences;const rows=clone(ctx.adbProdPublisherNormalizeTable_(table,true));assert.equal(rows[0]['Profile ID'],'PRIVATE-ID');
 table.raw[0][6]='PRIVATE-ID';assert.equal(ctx.adbProdPublisherNormalizeTable_(table,true).length,1);
 table.raw[0][6]='CONFLICT';assert.throws(()=>ctx.adbProdPublisherNormalizeTable_(table,true),/Conflicting/);
});
test('unrelated duplicate headers fail closed',()=>{
 assert.throws(()=>ctx.adbProdPublisherNormalizeTable_({headers:['Status','Status'],raw:[['Active','Active']]},false),/duplicate/);
});
test('legacy and malformed Sent evidence block without inferring prior facts',()=>{
 const x=fixture();x.history.push({'Run Date':'2026-10-27','Delivery Status':'Sent',Headline:'A legacy headline',Notes:'Legacy free text'});x.history.push({'Run Date':'2026-10-27','Delivery Status':'Sent',Notes:'ADB-SELECTION-NOTE-1 {invalid}'});
 const r=evaluate(x);assert.equal(r.metrics.legacySentRows,1);assert.equal(r.metrics.malformedStructuredSentRows,1);assert.equal(status(r,'published_history_recent'),'BLOCKED');
});
const cases=[
 ['queue_schema',x=>x.queueHeaders[5]='Pending'],['history_schema',x=>x.historyHeaders.reverse()],
 ['publisher_ledger',x=>x.ledgerHeaders=[]],['dispatcher_colocation',x=>x.dispatcherPresent=false],
 ['dispatcher_colocation',x=>x.dispatcherUsesScriptLock=false],['dispatcher_colocation',x=>x.dailyDispatcherTriggers=2],
 ['layout_guard',x=>x.layoutGuard='STAGED'],['no_publisher_trigger',x=>x.publisherTriggers=1],
 ['publisher_mode_inert',x=>x.publisherMode='LIVE'],['private_staging',x=>x.stagingConfigured=false],
 ['private_staging',x=>x.stagingValid=false],['morning_monitoring_identity',x=>x.operations.push(clone(x.operations[0]))],
 ['release_monitoring_gates',x=>x.release.find(r=>r.Setting==='Release B Controlled Test').Value='FAIL'],
 ['audience_identity',x=>x.subscribers.push(clone(x.subscribers[0]))],
 ['preference_identity',x=>x.preferences.raw.push(clone(x.preferences.raw[0]))]
];
for(const [id,mutate] of cases)test('blocks '+id+' unsafe configuration',()=>{const x=fixture();mutate(x);assert.equal(status(evaluate(x),id),'BLOCKED');});
test('Apps Script entry point is read-only and does not open forbidden staging targets',()=>{
 const c=runtime(),x=fixture(),logs=[],opened=[];
 const table=rows=>{const headers=Object.keys(rows[0]);return [headers,...rows.map(r=>headers.map(h=>r[h]||''))];};
 const dbTables={Environment:table(x.environment),'Outbound Messages':[x.queueHeaders], 'Briefing History':table(x.history),'Message Templates':table(x.templates),Preferences:[x.preferences.headers,...x.preferences.raw],Subscribers:table(x.subscribers),Profiles:table(x.profiles)};
 const intakeTables={'Integration Config':table(x.integration),'Release Config':table(x.release),'Operations Status':table(x.operations)};
 const book=data=>({getSheetByName:name=>data[name]?{getDataRange:()=>({getDisplayValues:()=>clone(data[name])})}:null});
 c.SpreadsheetApp={openById:id=>{opened.push(id);if(id===C.DATABASE_ID)return book(dbTables);if(id===C.INTAKE_ID)return book(intakeTables);throw Error('Unexpected workbook');}};
 c.PropertiesService={getScriptProperties:()=>({getProperty:key=>key==='ADB_PUBLISHER_PROD_STAGING_ID'?C.DATABASE_ID:key==='ADB_DAILY_LAYOUT_GUARD_MODE'?'ENFORCE':null})};
 c.ScriptApp={getProjectTriggers:()=>[{getHandlerFunction:()=> 'dispatchQueuedDailyBriefingsViaResendV1'}]};
 c.Logger={log:value=>logs.push(value)};
 c.Utilities={formatDate:()=> '2026-10-28'};
 vm.runInContext('function dispatchQueuedDailyBriefingsViaResendV1(){ const lock=LockService.getScriptLock(); throw Error("Must not invoke dispatcher"); }',c);
 const report=clone(c.checkEditorialPublisherProductionReadinessV1());assert.equal(report.result,'BLOCKED');assert.equal(opened.length,2);assert.equal(logs.length,1);
 assert.equal(status(report,'private_staging'),'BLOCKED');assert.equal(status(report,'dispatcher_colocation'),'PASS');
});
test('old legacy rows preserve recent news lookup but block extended resource history',()=>{
 const x=fixture();x.history.push({'Run Date':'2026-09-01','Delivery Status':'Sent',Notes:'Old free text'});
 const original=JSON.stringify(x.history),r=clone(ctx.adbProdPublisherNormalizeHistoryV1(x.history,'2026-10-28','2026-10-14',false));
 assert.equal(r.recentComplete,true);assert.equal(r.extendedHistoryKnown,false);assert.equal(r.legacyOutsideWindow,1);assert.equal(r.publishedHistory.length,1);
 assert.throws(()=>ctx.adbProdPublisherNormalizeHistoryV1(x.history,'2026-10-28','2026-10-14',true),/Extended resource history/);
 assert.equal(JSON.stringify(x.history),original);
});
test('short windows and invalid/future dates cannot appear complete',()=>{
 assert.throws(()=>ctx.adbProdPublisherNormalizeHistoryV1([],'2026-10-28','2026-10-20',false),/at least 14 days/);
 const r=ctx.adbProdPublisherNormalizeHistoryV1([{'Run Date':'2026-10-29','Delivery Status':'Sent'}],'2026-10-28','2026-10-14',false);
 assert.equal(r.recentComplete,false);assert.equal(r.invalidDates,1);
});
test('current-date Sent records are not misclassified as prior history',()=>{
 const rows=fixture().history;rows[0]['Run Date']='2026-10-28';
 const r=ctx.adbProdPublisherNormalizeHistoryV1(rows,'2026-10-28','2026-10-14',false);
 assert.equal(r.publishedHistory.length,0);assert.equal(r.sentRows,1);
});
