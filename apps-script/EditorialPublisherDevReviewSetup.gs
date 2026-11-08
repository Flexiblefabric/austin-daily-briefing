/** One-time setup in a NEW standalone project, using generated synthetic seed.
 * Creates three new files; never reads/copies/clears an existing workbook.
 * A started marker prevents automatic duplicate provisioning after a timeout.
 */
function setupDevEditorialReviewV1() {
  const R=adbDevHandoffRequire_,props=PropertiesService.getScriptProperties();
  R(!SpreadsheetApp.getActiveSpreadsheet(),'setup requires a new standalone project');
  R(ScriptApp.getProjectTriggers().length===0 && typeof dispatchQueuedDailyBriefingsViaResendV1==='undefined','setup cannot share dispatch/triggers');
  const operator=String(Session.getActiveUser().getEmail()||'').toLowerCase();
  R(operator && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(operator) && operator===String(Session.getEffectiveUser().getEmail()||'').toLowerCase(),'setup requires the authenticated owner');
  const lock=LockService.getScriptLock();lock.waitLock(30000);let released=false;
  try {
    R(Object.keys(props.getProperties()).length===0,'setup already started or project has existing properties; do not rerun');
    const pkg=JSON.parse(ADB_DEV_REVIEW_SEED_JSON),now=new Date();
    const edition=Utilities.formatDate(now,'America/Chicago','yyyy-MM-dd');
    R(pkg.edition_date===edition,'dated synthetic seed expired; rebuild before creating files');
    R(pkg.expected_profile_count===1 && pkg.editions.length===1 && pkg.editions[0].profile_id==='SYNTHETIC' &&
      pkg.selection_bundle.published_history.length===0 && Object.keys(pkg.selection_bundle.profiles).join(',')==='SYNTHETIC','synthetic fixture required');
    R(/^[a-f0-9]{40}$/.test(pkg.source_revision),'seed revision missing');
    const id='REVIEW-'+edition,stage=adbDevDraftPackageV1(id,pkg),P=ADB_DEV_REVIEW_HOST;
    const env=role=>[['Setting','Value'],['Environment','DEVELOPMENT'],['Allow External Delivery','FALSE'],['Production Writes','FORBIDDEN'],
      ['QA Purpose','ISOLATED_REVIEWED_HANDOFF_DEV'],['Handoff Role',role],['Manage URL','https://example.org/manage'],
      ['History Cutoff',pkg.selection_bundle.cutoff],['History Window Start',pkg.selection_bundle.history_window_start],['Recent History Complete','TRUE'],['Extended History Complete','TRUE']];
    function newFile(role,tables) {
      const body={properties:{title:'ADB REVIEW DEV '+edition+' '+role},sheets:Object.entries(tables).map(([title,rows],index)=>({
        properties:{sheetId:index+1,title:title,gridProperties:{rowCount:Math.max(rows.length+20,100),columnCount:Math.max(...rows.map(r=>r.length),10),frozenRowCount:1}},
        data:[{startRow:0,startColumn:0,rowData:rows.map(row=>({values:row.map(value=>({userEnteredValue:typeof value==='number'?{numberValue:value}:{stringValue:String(value)}}))}))}]
      }))};
      R(Utilities.newBlob(JSON.stringify(body)).getBytes().length<ADB_PUBLISHER.MAX_BYTES,'setup request too large');
      const result=Sheets.Spreadsheets.create(body,{fields:'spreadsheetId,spreadsheetUrl'});
      R(result && /^[A-Za-z0-9_-]{10,100}$/.test(result.spreadsheetId) && !ADB_PUBLISHER.PRODUCTION_IDS.includes(result.spreadsheetId),'invalid newly created file');
      // Record each returned ID immediately; preserve partial setup for inspection.
      props.setProperty('ADB_DEV_REVIEW_CREATED_'+role,result.spreadsheetId);
      return result;
    }
    // Persist BEFORE first create; a lost create response must not cause retries.
    props.setProperty('ADB_DEV_REVIEW_BOOTSTRAP_STARTED',now.toISOString());
    const p=pkg.selection_bundle.profiles.SYNTHETIC;
    const db=newFile('DATABASE',{'Environment':env('DATABASE'),
      'Subscribers':[['Profile ID','Email','Status','Admin Status'],['SYNTHETIC','synthetic@example.invalid','Active','OK']],
      'Profiles':[['Profile ID','Primary Preference Email','Status','More for You Volume','Summary Style','Why It Matters Length'],['SYNTHETIC','synthetic@example.invalid','Active',p.volume,p.summary_style,p.why_it_matters_length]],
      'Preferences':[['Profile ID','Interest ID','Preference'],...Object.entries(p.preferences).map(([key,value])=>['SYNTHETIC',key,value])],
      'Message Templates':[['Template ID','Status','Environment'],['DAILY_BRIEFING_V1','Active','DEVELOPMENT']],
      'Outbound Messages':[ADB_PUBLISHER.QUEUE],'Briefing History':[ADB_PUBLISHER.HISTORY],'Publisher Ledger':[ADB_PUBLISHER.LEDGER]});
    const draft=newFile('DRAFT_INBOX',{'Environment':env('DRAFT_INBOX'),'Packages':[P.PACKAGES,P.PACKAGES.map(k=>stage.manifest[k])],
      'Package Chunks':[P.CHUNKS,...stage.chunks.map(r=>P.CHUNKS.map(k=>r[k]))]});
    const sealed=newFile('SEALED_STAGING',{'Environment':env('SEALED_STAGING'),'Packages':[P.PACKAGES],'Package Chunks':[P.CHUNKS],'DEV Package Reviews':[P.REVIEWS]});
    const policy={purpose:'ISOLATED_REVIEWED_HANDOFF_DEV',databaseId:db.spreadsheetId,draftId:draft.spreadsheetId,sealedId:sealed.spreadsheetId,sourceRevision:pkg.source_revision,operator:operator};
    props.setProperties({ADB_DEV_REVIEW_POLICY_JSON:JSON.stringify(policy),ADB_PUBLISHER_SOURCE_REVISION:pkg.source_revision},false);
    lock.releaseLock();released=true;
    // Independent native API readback and full planner before declaring ready.
    const preview=adbDevReviewHost_().prepareReview(id);
    R(preview.profiles===1 && preview.historyRows===6,'setup planner readback mismatch');
    const report={result:'READY_FOR_REVIEW',build:'ADB-DEV-REVIEW-HOST-0.1',packageId:id,editionDate:edition,
      createdFiles:3,productionWrites:false,emails:false,alertsSent:0,sealed:false,published:false,
      database:db.spreadsheetUrl,draft:draft.spreadsheetUrl,sealedStore:sealed.spreadsheetUrl,realPermissionsVerified:false};
    Logger.log(JSON.stringify(report));return report;
  } finally {if(!released)lock.releaseLock();}
}
