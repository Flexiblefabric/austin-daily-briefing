/** ADB-PUBLISHER-DEV-HANDOFF-0.1. Dependency-injected DEV preparation adapter.
 * No native storage, credentials, properties, triggers, publication or sends.
 * IO/policy/authentication are trusted host dependencies, never draft JSON.
 * Requires EditorialPublisher.gs and EditorialPublisherDevWorkflow.gs.
 */
function adbDevHandoffRequire_(ok,message) {
  if (!ok) throw Error('DEV handoff: '+message);
}

/** Deliberate allowlist projection; never export complete operational rows. */
function adbDevExportDraftSnapshotV1(input,sha256) {
  const R=adbDevHandoffRequire_,s=input.state,h=input.history;
  R(s.environment==='DEVELOPMENT' && s.externalDelivery==='FALSE','DEV environment required');
  R(/^[a-f0-9]{40}$/.test(s.sourceRevision),'source revision required');
  const date=input.clock.editionDate;
  R(/^\d{4}-\d\d-\d\d$/.test(date) && new Date(date+'T00:00:00Z').toISOString().slice(0,10)===date &&
    Number.isFinite(Date.parse(input.clock.iso)),'valid trusted clock required');
  R(h && h.recentComplete===true && h.extendedComplete===true,'complete DEV history attestation required');
  R(typeof h.cutoff==='string' && Number.isFinite(Date.parse(h.cutoff)) && h.cutoff.slice(0,10)===date &&
    /^\d{4}-\d\d-\d\d$/.test(h.windowStart) && new Date(h.windowStart+'T00:00:00Z').toISOString().slice(0,10)===h.windowStart && h.windowStart<date,'history bounds required');
  const ids=s.subscribers.filter(r=>r.Status==='Active' && r['Admin Status']==='OK').map(r=>r['Profile ID']).sort();
  R(ids.every(id=>typeof id==='string' && /^[A-Za-z0-9_-]{1,100}$/.test(id)) && new Set(ids).size===ids.length,'opaque unique profile IDs required');
  const profiles={};
  ids.forEach(id=>{
    const subs=s.subscribers.filter(r=>r['Profile ID']===id),rows=s.profiles.filter(r=>r['Profile ID']===id);
    const email=String(subs[0].Email||'').trim().toLowerCase();
    R(subs.length===1 && rows.length===1 && rows[0].Status==='Active' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      String(rows[0]['Primary Preference Email']||'').trim().toLowerCase()===email &&
      s.subscribers.filter(r=>String(r.Email||'').trim().toLowerCase()===email).length===1,'ambiguous snapshot audience');
    const p=s.personalization[id];R(p && p.preferences && typeof p.preferences==='object' && !Array.isArray(p.preferences),'saved personalization missing');
    R(['volume','summary_style','why_it_matters_length'].every(k=>typeof p[k]==='string'),'invalid personalization value');
    const preferences={};Object.keys(p.preferences).sort().forEach(k=>{
      R(typeof p.preferences[k]==='string','invalid preference');
      Object.defineProperty(preferences,k,{value:p.preferences[k],enumerable:true});
    });
    Object.defineProperty(profiles,id,{value:{volume:p.volume,summary_style:p.summary_style,
      why_it_matters_length:p.why_it_matters_length,preferences:preferences},enumerable:true});
  });
  R(s.publishedHistory.every(r=>['date','profile_id','key','topic','lane','facts'].every(k=>typeof r[k]==='string') &&
    r.delivered===true && /^\d{4}-\d\d-\d\d$/.test(r.date) && new Date(r.date+'T00:00:00Z').toISOString().slice(0,10)===r.date),'invalid normalized history');
  const published=s.publishedHistory.filter(r=>r.date<date).map(r=>({date:r.date,profile_id:r.profile_id,
    key:r.key,topic:r.topic,lane:r.lane,facts:r.facts,delivered:r.delivered}));
  const snapshot={schema:'ADB-DRAFT-SNAPSHOT-DEV-1',edition_date:date,source_revision:s.sourceRevision,
    expected_profile_count:ids.length,profiles:profiles,published_history:published,
    cutoff:h.cutoff,history_window_start:h.windowStart,recent_history_complete:true,extended_history_complete:true};
  // Invalid/undefined projection values and address-like content block export.
  const raw=adbPublisherCanonical_(snapshot);
  R(!raw.includes('undefined') && !raw.includes('@'),'unsupported or private snapshot content');
  return {snapshot:JSON.parse(raw),digest:sha256(raw)};
}

/** Factory for a trusted DEV host. There is intentionally no Apps Script entry
 * point: real file bindings, ACL evidence and authenticated operator wiring have
 * not been provisioned. Never expose this factory or dependencies to a draft.
 * IO: withLock(fn), readTrusted(databaseId), readDraft(draftId,packageId),
 * readSealed(sealedId,packageId)->records[], appendSealed(sealedId,record),
 * operatorIdentity()->authenticated string. appendSealed atomically persists
 * READY manifest/chunks plus review receipt in the SAME sealed file.
 */
function adbCreateDevReviewedHandoffV1(hostPolicy,io,sha256) {
  const R=adbDevHandoffRequire_,copy=v=>JSON.parse(JSON.stringify(v)),canon=adbPublisherCanonical_;
  const policy=copy(hostPolicy);
  adbPublisherKeys_(policy,['purpose','databaseId','draftId','sealedId','sourceRevision','operator']);
  R(policy.purpose==='ISOLATED_REVIEWED_HANDOFF_DEV','isolated purpose required');
  const ids=[policy.databaseId,policy.draftId,policy.sealedId];
  const historical=['1I9UAR6kabPt0P_lvDiJX_oskPeCVcVI64_vTbwEOF2I',
    '1XZCcNUCSkCU68HY9DMgjbyKgQRXDGkVjf0Q3uz1QXrY','1K5iBARfGpUGdM-fKWdZANXjpsyuPcAaa-oVPy8RDNd0'];
  R(ids.every(id=>typeof id==='string' && /^[A-Za-z0-9_-]{10,100}$/.test(id) &&
    !ADB_PUBLISHER.PRODUCTION_IDS.includes(id) && !historical.includes(id)) && new Set(ids).size===3,
    'three distinct fresh DEV targets required');
  R(/^[a-f0-9]{40}$/.test(policy.sourceRevision) && typeof policy.operator==='string' && policy.operator.trim(),'trusted revision/operator required');
  ['withLock','readTrusted','readDraft','readSealed','appendSealed','operatorIdentity'].forEach(k=>R(typeof io[k]==='function','missing trusted host dependency'));
  function identity() {R(io.operatorIdentity()===policy.operator,'authenticated operator required');}
  function packageId(id) {R(typeof id==='string' && /^[A-Za-z0-9_-]{1,100}$/.test(id),'invalid package ID');}
  function trusted() {
    const input=io.readTrusted(policy.databaseId);
    R(input.databaseId===policy.databaseId && input.state.sourceRevision===policy.sourceRevision,'trusted target/revision mismatch');
    return {input:input,exported:adbDevExportDraftSnapshotV1(input,sha256)};
  }
  function inspect(id) {
    packageId(id);const t=trusted(),draft=io.readDraft(policy.draftId,id);
    R(draft && draft.manifest['Package ID']===id,'draft identity mismatch');
    R(draft.manifest['Package SHA-256']==='','draft digest must be empty');
    const pkg=adbDevDecodeStage_(draft,'DRAFT');
    const plan=adbPlanEditorialPublication(pkg,t.input.state,t.input.clock,sha256);
    R(['READY','ALREADY_COMMITTED'].includes(plan.result),'positive-audience handoff required');
    R(pkg.selection_bundle.cutoff===t.exported.snapshot.cutoff &&
      pkg.selection_bundle.history_window_start===t.exported.snapshot.history_window_start,'snapshot bounds changed');
    // Only content previews are returned. Queue rows contain private recipients.
    const previews=pkg.editions.map(e=>({profileId:e.profile_id,rendered:adbRenderDailyNewsletter(e.editorial)}));
    const ticket={schema:'ADB-DEV-REVIEW-1',packageId:id,editionDate:pkg.edition_date,
      sourceRevision:pkg.source_revision,packageDigest:plan.digest,snapshotDigest:t.exported.digest,
      previewDigest:sha256(canon(previews))};
    return {draft:draft,pkg:pkg,plan:plan,previews:previews,ticket:ticket,trusted:t};
  }
  function same(a,b,message) {R(canon(a)===canon(b),message);}
  function records(id) {
    const rows=io.readSealed(policy.sealedId,id);R(Array.isArray(rows) && rows.length<=1,'duplicate sealed identity');
    R(rows.every(r=>r && r.stage && r.stage.manifest && r.stage.manifest['Package ID']===id &&
      r.review && r.review.ticket && r.review.ticket.packageId===id),'sealed lookup identity mismatch');
    return rows;
  }
  function verify(record,ticket) {
    adbPublisherKeys_(ticket,['schema','packageId','editionDate','sourceRevision','packageDigest','snapshotDigest','previewDigest']);
    R(ticket.schema==='ADB-DEV-REVIEW-1','invalid review schema');
    R(record && record.review && record.review.operator===policy.operator,'invalid sealed review');
    same(record.review.ticket,ticket,'sealed review changed');
    R(typeof record.review.at==='string' && new Date(record.review.at).toISOString()===record.review.at,'invalid review timestamp');
    R(record.stage.manifest['Package ID']===ticket.packageId,'sealed identity changed');
    const pkg=adbDevReadReadyV1(record.stage,sha256);
    R(sha256(canon(pkg))===ticket.packageDigest,'sealed bytes differ from review');
    return pkg;
  }
  return Object.freeze({
    exportSnapshot:function() {identity();return copy(trusted().exported);},
    prepareReview:function(id) {
      identity();return io.withLock(function(){const r=inspect(id);return copy({ticket:r.ticket,
        snapshot:r.trusted.exported.snapshot,previews:r.previews,selectionEvidence:r.pkg.selection_bundle,profiles:r.pkg.expected_profile_count,
        historyRows:r.plan.result==='READY'?r.plan.history.length:null});});
    },
    /** Manual operator action, after reviewing the exact ticket/preview. */
    sealReviewed:function(ticket) {
      identity();adbPublisherKeys_(ticket,['schema','packageId','editionDate','sourceRevision','packageDigest','snapshotDigest','previewDigest']);
      return io.withLock(function(){
        identity();const first=inspect(ticket.packageId);same(first.ticket,ticket,'review expired; prepare a new preview');
        const prior=records(ticket.packageId);
        if(prior.length) {verify(prior[0],ticket);return {result:'ALREADY_SEALED',digest:ticket.packageDigest};}
        R(first.plan.result==='READY','cannot newly seal an already committed edition');
        // Re-read draft and independent operational inputs; no execution-wide cache.
        const fresh=inspect(ticket.packageId);same(fresh.ticket,ticket,'review expired during sealing');
        same({state:fresh.trusted.input.state,history:fresh.trusted.input.history},
          {state:first.trusted.input.state,history:first.trusted.input.history},'trusted state changed during sealing');
        const record={stage:adbDevSealDraftV1(fresh.draft,sha256),review:{ticket:copy(ticket),operator:policy.operator,at:fresh.trusted.input.clock.iso}};
        identity();R(records(ticket.packageId).length===0,'sealed identity appeared during validation');
        io.appendSealed(policy.sealedId,copy(record));
        const persisted=records(ticket.packageId);R(persisted.length===1,'sealed write missing on readback');
        verify(persisted[0],ticket);same(persisted[0],record,'sealed write readback differs');
        return {result:'SEALED',digest:ticket.packageDigest};
      });
    },
    /** Read-only preparation for the future separate publication action.
     * It is not a commit permit: the writer must revalidate inside its own lock.
     */
    readReady:function(id) {
      identity();packageId(id);return io.withLock(function(){
        const rows=records(id);R(rows.length===1,'sealed package missing');
        const record=rows[0],pkg=verify(record,record.review.ticket),t=trusted();
        R(record.review.at<=t.input.clock.iso,'review timestamp is in the future');
        R(t.exported.digest===record.review.ticket.snapshotDigest,'trusted snapshot changed after review');
        const plan=adbPlanEditorialPublication(pkg,t.input.state,t.input.clock,sha256);
        R(['READY','ALREADY_COMMITTED'].includes(plan.result),'positive-audience handoff required');
        same(records(id),rows,'sealed input changed during validation');
        return copy({package:pkg,review:record.review,result:plan.result,digest:plan.digest});
      });
    }
  });
}
