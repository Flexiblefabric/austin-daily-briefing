'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const clone=x=>JSON.parse(JSON.stringify(x)),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const fixture=JSON.parse(cp.execFileSync('python',['tests/publisher-fixture.py'],{encoding:'utf8'}));
function setup() {
 const c=vm.createContext({Intl});
 for(const path of ['scripts/daily_newsletter_renderer.js','apps-script/DailyNewsletterContract.gs','apps-script/SelectionEvidenceContract.gs','apps-script/EditorialPublisher.gs','apps-script/EditorialPublisherDevWorkflow.gs','apps-script/EditorialPublisherDevHandoff.gs'])vm.runInContext(fs.readFileSync(path,'utf8'),c);
 const C=clone(vm.runInContext('ADB_PUBLISHER',c)),pkg=clone(fixture);
 const state={environment:'DEVELOPMENT',externalDelivery:'FALSE',sourceRevision:pkg.source_revision,queueHeaders:C.QUEUE,historyHeaders:C.HISTORY,ledgerHeaders:C.LEDGER,queue:[],history:[],ledger:[],
 subscribers:[{'Profile ID':'SYNTHETIC',Email:'secret@example.invalid',Status:'Active','Admin Status':'OK',token:'DO-NOT-EXPORT'}],profiles:[{'Profile ID':'SYNTHETIC',Status:'Active','Primary Preference Email':'secret@example.invalid'}],
 templates:[{'Template ID':'DAILY_BRIEFING_V1',Status:'Active',Environment:'DEVELOPMENT'}],personalization:clone(pkg.selection_bundle.profiles),publishedHistory:[],manageUrl:'https://example.org/manage',providerSecret:'DO-NOT-EXPORT'};
 const policy={purpose:'ISOLATED_REVIEWED_HANDOFF_DEV',databaseId:'synthetic_database_01',draftId:'synthetic_draft_inbox_01',sealedId:'synthetic_sealed_store_01',sourceRevision:pkg.source_revision,operator:'owner-authenticated'};
 const input={databaseId:policy.databaseId,state,clock:{iso:'2026-10-07T13:00:01.000Z',editionDate:pkg.edition_date},history:{cutoff:pkg.selection_bundle.cutoff,windowStart:pkg.selection_bundle.history_window_start,recentComplete:true,extendedComplete:true}};
 let draft=clone(c.adbDevDraftPackageV1('REVIEW',pkg)),sealed=[],writes=0,locked=false,identity=policy.operator,trustedReads=0,sealedReads=0;
 const hooks={};
 const io={operatorIdentity:()=>identity,withLock:fn=>{assert(!locked);locked=true;try{return fn();}finally{locked=false;}},
 readTrusted:id=>{assert.equal(id,policy.databaseId);trustedReads++;if(hooks.trusted)hooks.trusted(trustedReads);return clone(input);},
 readDraft:(id,key)=>{assert(locked);assert.equal(id,policy.draftId);assert.equal(key,'REVIEW');return clone(draft);},
 readSealed:(id,key)=>{assert(locked);assert.equal(id,policy.sealedId);assert.equal(key,'REVIEW');sealedReads++;if(hooks.sealed)hooks.sealed(sealedReads);return clone(sealed);},
 appendSealed:(id,record)=>{assert(locked);assert.equal(id,policy.sealedId);if(hooks.beforeWrite)hooks.beforeWrite();sealed.push(clone(record));writes++;if(hooks.afterWrite)hooks.afterWrite();}};
 const adapter=c.adbCreateDevReviewedHandoffV1(policy,io,sha);
 return {c,pkg,state,input,policy,io,adapter,hooks,get draft(){return draft;},set draft(x){draft=x;},get sealed(){return sealed;},set sealed(x){sealed=x;},writes:()=>writes,locked:()=>locked,setIdentity:x=>identity=x,preview:()=>clone(adapter.prepareReview('REVIEW')),seal:t=>clone(adapter.sealReviewed(t))};
}

test('export projects editorial inputs, excludes recipients/tokens/provider keys and copies its result',()=>{
 const h=setup(),result=clone(h.adapter.exportSnapshot()),raw=JSON.stringify(result);
 assert(!raw.includes('secret@example'));assert(!raw.includes('DO-NOT-EXPORT'));assert(!raw.includes('providerSecret'));
 assert.equal(result.snapshot.expected_profile_count,1);assert.deepEqual(result.snapshot.profiles,h.pkg.selection_bundle.profiles);
 assert.equal(result.digest,sha(h.c.adbPublisherCanonical_(result.snapshot)));
 result.snapshot.profiles.SYNTHETIC.volume='changed';assert.notEqual(h.adapter.exportSnapshot().digest,sha(h.c.adbPublisherCanonical_(result.snapshot)));
});

test('review, independent copy, read-only ready validation and exact seal replay have one sealed record',()=>{
 const h=setup(),review=h.preview(),before=JSON.stringify(h.state);
 assert.equal(review.previews.length,1);assert.equal(review.historyRows,6);assert(!JSON.stringify(review).includes('secret@example'));
 assert.equal(h.seal(review.ticket).result,'SEALED');assert.equal(h.writes(),1);assert.equal(h.seal(review.ticket).result,'ALREADY_SEALED');assert.equal(h.writes(),1);assert.equal(JSON.stringify(h.state),before);assert.equal(h.locked(),false);
 h.draft=null;const ready=clone(h.adapter.readReady('REVIEW'));assert.deepEqual(ready.package,h.pkg);assert.equal(ready.result,'READY');assert.equal(h.writes(),1);
});

test('post-seal draft edits leave sealed copy intact and cannot reuse its identity for changed bytes',()=>{
 const h=setup(),review=h.preview();h.seal(review.ticket);const sealed=JSON.stringify(h.sealed);
 const pkg=clone(h.pkg);pkg.editions[0].editorial.preheader='Changed after review';h.draft=clone(h.c.adbDevDraftPackageV1('REVIEW',pkg));
 assert.throws(()=>h.seal(review.ticket),/review expired/);assert.equal(JSON.stringify(h.sealed),sealed);assert.deepEqual(clone(h.adapter.readReady('REVIEW')).package,h.pkg);
 assert.throws(()=>h.seal(h.preview().ticket),/sealed review changed/);assert.equal(h.writes(),1);
});

for(const phase of ['before','after'])test('ambiguous '+phase+'-write response retries safely without a duplicate sealed record',()=>{
 const h=setup(),review=h.preview();let injected=false;
 h.hooks[phase==='before'?'beforeWrite':'afterWrite']=()=>{if(!injected){injected=true;throw Error('lost response');}};
 assert.throws(()=>h.seal(review.ticket),/lost response/);assert.equal(h.locked(),false);assert.equal(h.seal(review.ticket).result,phase==='before'?'SEALED':'ALREADY_SEALED');assert.equal(h.writes(),1);
});

for(const [name,mutate] of [
 ['draft',h=>{const p=clone(h.pkg);p.editions[0].editorial.preheader='new';h.draft=clone(h.c.adbDevDraftPackageV1('REVIEW',p));}],
 ['preferences',h=>h.state.personalization.SYNTHETIC.volume='Less'],['subscriber',h=>h.state.subscribers[0].Status='Paused'],['history completeness',h=>h.input.history.extendedComplete=false],
 ['source revision',h=>h.state.sourceRevision='f'.repeat(40)],['edition clock',h=>h.input.clock.editionDate='2026-10-08'],['cutoff',h=>h.input.history.cutoff='2026-10-07T09:00:00-05:00']
])test('changed '+name+' after review blocks before sealing',()=>{
 const h=setup(),t=h.preview().ticket;mutate(h);assert.throws(()=>h.seal(t));assert.equal(h.writes(),0);
});

test('trusted state changes during sealing block; a progressing clock alone is permitted',()=>{
 const h=setup(),t=h.preview().ticket;let n=0;h.hooks.trusted=()=>{if(++n===2)h.state.queue.push({'Run ID':'other'});};
 assert.throws(()=>h.seal(t),/trusted state changed/);assert.equal(h.writes(),0);
 const good=setup(),ticket=good.preview().ticket;good.hooks.trusted=()=>{good.input.clock.iso='2026-10-07T13:00:02.000Z';};assert.equal(good.seal(ticket).result,'SEALED');
});

test('review forgery, extra client target fields and unauthenticated operator calls block',()=>{
 const h=setup(),t=h.preview().ticket;
 for(const ticket of [{...t,packageDigest:'f'.repeat(64)},{...t,previewDigest:'f'.repeat(64)},{...t,snapshotDigest:'f'.repeat(64)},{...t,targetId:'client-controlled'}])assert.throws(()=>h.seal(ticket));
 h.setIdentity('');for(const f of [()=>h.preview(),()=>h.seal(t),()=>h.adapter.exportSnapshot(),()=>h.adapter.readReady('REVIEW')])assert.throws(f,/authenticated operator/);assert.equal(h.writes(),0);
});

test('production, historical, duplicate targets and absent host dependencies fail construction',()=>{
 const h=setup();for(const id of ['1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0','1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho','1K5iBARfGpUGdM-fKWdZANXjpsyuPcAaa-oVPy8RDNd0',h.policy.draftId])assert.throws(()=>h.c.adbCreateDevReviewedHandoffV1({...h.policy,databaseId:id},h.io,sha),/fresh DEV targets/);
 assert.throws(()=>h.c.adbCreateDevReviewedHandoffV1({...h.policy,purpose:'PRODUCTION'},h.io,sha));assert.throws(()=>h.c.adbCreateDevReviewedHandoffV1(h.policy,{...h.io,operatorIdentity:null},sha));
});

for(const [name,mutate] of [
 ['sealed bytes',h=>h.sealed[0].stage.chunks[0].JSON=h.sealed[0].stage.chunks[0].JSON.replace('Austin','Changed')],['review identity',h=>h.sealed[0].review.operator='draft-author'],
 ['duplicate record',h=>h.sealed.push(clone(h.sealed[0]))],['trusted snapshot',h=>h.input.history.cutoff='2026-10-07T09:00:00-05:00']
])test('read-only publication preparation rejects changed '+name,()=>{
 const h=setup(),t=h.preview().ticket;h.seal(t);mutate(h);assert.throws(()=>h.adapter.readReady('REVIEW'));assert.equal(h.writes(),1);
});

test('post-write readback corruption fails and is not silently repaired',()=>{
 const h=setup(),t=h.preview().ticket;h.hooks.afterWrite=()=>{h.sealed[0].review.at='2026-10-07T14:00:00.000Z';};assert.throws(()=>h.seal(t),/readback differs/);assert.equal(h.writes(),1);
});

test('privacy export rejects nested personalization, address-bearing facts and unknown completeness',()=>{
 for(const mutate of [h=>h.state.personalization.SYNTHETIC.volume={token:'secret'},
  h=>h.input.history.recentComplete=false,
  h=>h.state.publishedHistory.push({date:'2026-10-06',profile_id:'SYNTHETIC',key:'story',topic:'topic',lane:'shared',facts:'Contact secret@example.invalid',delivered:true}),
  h=>h.input.history.windowStart='2026-09-99']) {
  const h=setup();mutate(h);assert.throws(()=>h.adapter.exportSnapshot());assert.equal(h.writes(),0);
 }
});

test('sealed lookup cannot substitute a different package identity',()=>{
 const h=setup(),t=h.preview().ticket;h.seal(t);h.sealed[0].review.ticket.packageId='OTHER';
 assert.throws(()=>h.adapter.readReady('REVIEW'),/lookup identity/);
});

test('read-only preparation reconciles an actual core-planned commit without changing targets',()=>{
 const h=setup(),ticket=h.preview().ticket;h.seal(ticket);
 const plan=clone(h.c.adbPlanEditorialPublication(h.pkg,h.state,h.input.clock,sha));
 h.state.queue=plan.queue;h.state.history=plan.history;h.state.ledger=[plan.ledger];
 const before=JSON.stringify(h.state);assert.equal(h.adapter.readReady('REVIEW').result,'ALREADY_COMMITTED');
 assert.equal(JSON.stringify(h.state),before);assert.equal(h.writes(),1);
});

test('independent selection, source binding and layout gates still reject invalid drafts',()=>{
 for(const mutate of [p=>p.selection_bundle.history_complete=false,p=>p.editions[0].bindings[0].key='wrong',
  p=>p.editions[0].editorial.featured.sources[0].url='https://not-selected.invalid/story']) {
  const h=setup(),p=clone(h.pkg);mutate(p);h.draft=clone(h.c.adbDevDraftPackageV1('REVIEW',p));
  assert.throws(()=>h.preview());assert.equal(h.writes(),0);
 }
});

test('snapshot export rejects duplicate or unresolved identities before exposing drafting inputs',()=>{
 for(const mutate of [h=>h.state.profiles.push(clone(h.state.profiles[0])),h=>h.state.profiles[0].Status='Paused',
  h=>h.state.subscribers.push({...h.state.subscribers[0],'Profile ID':'OTHER',Status:'Paused'}),
  h=>h.state.profiles[0]['Primary Preference Email']='different@example.invalid']) {
  const h=setup();mutate(h);assert.throws(()=>h.adapter.exportSnapshot(),/ambiguous snapshot audience/);
 }
});
