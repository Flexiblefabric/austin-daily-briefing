/** ADB-SELECTION-JS-1.0. Pure JS counterpart of validate_selection_notes.py.
 * Evidence is checked mechanically; source truth still requires editorial review.
 * No network, delivery, or storage side effects.
 */
function adbValidateSelectionEvidence(b) {
  const R=(ok,msg)=>{if(!ok)throw Error('Selection: '+msg);};
  const obj=x=>x && typeof x==='object' && !Array.isArray(x);
  const text=x=>typeof x==='string' && !!x.trim();
  const meaningful=x=>text(x) && !['pass','true','unknown','n/a','none','material update','new information','material update after prior coverage','no prior normalized key'].includes(x.trim().toLowerCase());
  const stable=x=>JSON.stringify(x && typeof x==='object' ? (Array.isArray(x)?x.map(v=>JSON.parse(stable(v))):Object.fromEntries(Object.keys(x).sort().map(k=>[k,JSON.parse(stable(x[k]))]))) : x);
  const eq=(a,c)=>stable(a)===stable(c);
  const date=x=>{R(text(x)&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x,'invalid date');return x;};
  const stamp=x=>{R(text(x)&&/(Z|[+-]\d\d:\d\d)$/.test(x)&&Number.isFinite(Date.parse(x)),'invalid timestamp or offset');return Date.parse(x);};
  const url=x=>typeof x==='string'&&/^https?:\/\/[^\s/@]+(?:[/?#]|$)/i.test(x)&&!/[<>"\\]/.test(x);
  const shared=[20,20,15,15,10,10,10],mfy=[25,25,20,10,10,10];
  const lanes={'Featured Top Story':'top','Top Story':'top','Under the Radar':'utr','More for You':'mfy','Austin Ahead':'utility','This Week in Austin':'utility',"What's New":'utility'};
  R(obj(b),'bundle required');const cutoff=stamp(b.cutoff);
  const local=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(cutoff));
  const part=k=>local.find(p=>p.type===k).value;
  const edition=part('year')+'-'+part('month')+'-'+part('day');
  // Determine offset from actual zone rules; do not hardcode daylight saving dates.
  const zone=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',timeZoneName:'longOffset'}).formatToParts(new Date(cutoff)).find(p=>p.type==='timeZoneName').value.replace('GMT','');
  R(b.cutoff.endsWith(zone),'cutoff must use America/Chicago offset');
  date(b.history_window_start);R(Date.parse(b.history_window_start)<=Date.parse(edition)-14*86400000,'history window shorter than 14 days');
  R(b.history_complete===true,'history incomplete');R(obj(b.profiles)&&Object.keys(b.profiles).length,'profiles missing');
  R(Array.isArray(b.published_history),'history missing');
  b.published_history.forEach(h=>{R(date(h.date)<edition,'history must precede edition');R(meaningful(h.facts),'published facts missing');});
  function source(s){R(obj(s)&&url(s.url),'source URL missing');R(s.access==='read','source unread');R(stamp(s.accessed_at)<=cutoff,'source access after cutoff');R(meaningful(s.locator),'source locator missing');if(s.published_at!=null)R(stamp(s.published_at)<=cutoff,'source published after cutoff');else R(meaningful(s.timestamp_note),'publication-time explanation missing');}
  function candidate(c,lane,p){
    R(obj(c),'candidate missing');['key','topic','fact','procedural_status','placement_reason'].forEach(k=>R(meaningful(c[k]),'candidate missing '+k));
    R(c.lane===lane,'lane mismatch');R(['upcoming','today','completed','not_applicable'].includes(c.event_timing),'event timing missing');
    R(Array.isArray(c.sources)&&c.sources.length,'sources missing');c.sources.forEach(source);
    R(obj(c.gates)&&eq(Object.keys(c.gates).sort(),['fit','repeat','section','source'])&&Object.values(c.gates).every(v=>v===true),'eligibility gate failed');
    const h=c.history||{};R(h.key_checked===true&&h.topic_checked===true,'history checks missing');R(meaningful(h.search_reason),'history search reason missing');R(typeof h.material_update==='boolean','material update boolean missing');
    const applicable=b.published_history.filter(r=>r.delivered===true&&((lane==='mfy'&&r.lane==='mfy'&&r.profile_id===p)||(['top','utr'].includes(lane)&&['top','utr'].includes(r.lane))||(lane==='utility'&&r.profile_id===p))&&(r.key===c.key||r.topic===c.topic)&&(r.date>=b.history_window_start||c.evergreen===true));
    R(Array.isArray(h.prior),'prior array missing');
    applicable.forEach(r=>R(h.prior.some(v=>v.key===r.key&&v.date===r.date),'known repeat missing'));
    h.prior.forEach(v=>R(applicable.some(r=>r.key===v.key&&r.date===v.date&&r.facts===v.facts),'prior fact unbound'));
    if(c.evergreen===true)R(h.resource_history_known===true,'evergreen history unknown');
    if(h.prior.length&&lane!=='utility'){
      const ch=h.change||{};R(h.material_update===true,'unchanged ranked repeat');['before','after','incremental_value','locator'].forEach(k=>R(meaningful(ch[k]),'repeat change missing '+k));
      R(h.prior.some(v=>v.facts===ch.before),'before fact mismatch');R(ch.before.trim().toLowerCase()!==ch.after.trim().toLowerCase(),'no changed fact');
      R(['vote','ruling','funding','lawsuit','construction_phase','cancellation','opening_closure','new_data','hearing_outcome','changed_deadline','new_document_facts','new_capability','other_substantive'].includes(ch.basis),'invalid change basis');
      R(ch.calendar_only===false,'calendar-only update');R(c.sources.some(s=>s.url===ch.source_url),'change source missing');R(stamp(ch.verified_at)<=cutoff,'change after cutoff');
    }else if(h.prior.length){R(meaningful(h.repeat_utility),'utility repeat reason missing');R(h.material_update===false,'utility falsely claims change');}
    else R(h.material_update===false,'material update without prior');
    if(lane==='utility'){R(c.scores==null&&c.total==null,'utility scores prohibited');return;}
    const caps=lane==='mfy'?mfy:shared;
    R(Array.isArray(c.scores)&&c.scores.length===caps.length&&c.scores.every((v,i)=>Number.isInteger(v)&&v>=0&&v<=caps[i]),'score vector invalid');
    R(Number.isInteger(c.total)&&c.total===c.scores.reduce((a,v)=>a+v,0)&&c.total>=60,'score sum or floor failed');
    R(Array.isArray(c.score_reasons)&&c.score_reasons.length===caps.length&&c.score_reasons.every(meaningful),'score reasons missing');
    if(lane==='mfy'){
      const f=c.fit||{},prefs=b.profiles[p].preferences||{},pref=prefs[f.interest_id],bands={direct_high:[21,25],direct_normal:[16,20],strong_adjacency:[16,20],narrow_adjacency:[11,15]},band=bands[f.match];
      R(c.scores[1]>=15&&c.scores[4]>=5,'MFY value/substance floor');R(['Normal','High'].includes(pref)&&f.saved_preference===pref,'MFY saved preference invalid');
      R(band&&c.scores[0]>=band[0]&&c.scores[0]<=band[1],'MFY calibrated band failed');
      if(f.match==='direct_high'||f.match==='direct_normal')R(pref===(f.match==='direct_high'?'High':'Normal'),'direct band preference mismatch');
      ['source_feature','reader_payoff','catalog_scope'].forEach(k=>R(meaningful(f[k]),'MFY fit missing '+k));R(f.off_topic_relabel===false,'Off-topic relabeling');
    }
  }
  function slate(s,lane,selected,p){
    R(obj(s)&&s.complete_eligible_pool===true&&Array.isArray(s.decisions)&&Array.isArray(s.ranked),'slate incomplete');
    const keys=s.ranked.map(c=>c.key);R(new Set(keys).size===keys.length,'duplicate candidate');
    R(s.ranked.every((c,i)=>i===0||s.ranked[i-1].total>=c.total),'slate not ranked');R(meaningful(s.capacity_reason),'capacity reason missing');
    R(Number.isInteger(s.slots)&&s.slots>=0&&s.slots<=keys.length,'invalid slots');s.ranked.forEach(c=>candidate(c,lane,p));
    const pool=Object.fromEntries(s.ranked.map(c=>[c.key,c])),baseline=keys.slice(0,s.slots),expected=new Set(baseline),removed=new Set(),added=new Set();let discoveries=0;
    s.decisions.forEach(d=>{
      const old=d.displaced,fresh=d.replacement;R(meaningful(d.reason),'decision reason missing');R(baseline.includes(old)&&!removed.has(old),'chained or invalid displacement');
      if(d.control==='freshness_veto')R(fresh===null&&pool[old].history.material_update===true,'invalid freshness veto');
      else{
        R(Object.hasOwnProperty.call(pool,fresh)&&!baseline.includes(fresh)&&!added.has(fresh),'replacement outside original pool');
        if(lane==='mfy'){
          R(['variety','discovery'].includes(d.control),'invalid MFY control');if(d.control==='discovery')discoveries++;R(discoveries<=1,'second discovery');
          const delta=pool[old].total-pool[fresh].total,value=pool[old].scores[1]-pool[fresh].scores[1];
          R(delta<=(d.control==='variety'?5:10)&&value<=3,'displacement exceeds limits');R(Number.isInteger(d.score_drop)&&Number.isInteger(d.reader_value_drop)&&d.score_drop===delta&&d.reader_value_drop===value,'recorded deltas mismatch');
        }else R(d.control==='selection_balance','invalid shared control');
        added.add(fresh);expected.add(fresh);
      }
      removed.add(old);expected.delete(old);
    });
    R(s.control_status===(s.decisions.length?'applied':'none'),'control status mismatch');R(eq(Object.keys(selected).sort(),Array.from(expected).sort()),'final slate mismatch');
    Object.keys(selected).forEach(k=>R(eq(selected[k],pool[k]),'selected evidence changed'));
  }
  R(Array.isArray(b.rows)&&b.rows.length,'published rows missing');const grouped=Object.fromEntries(Object.keys(b.profiles).map(p=>[p,[]])),seen=new Set();
  b.rows.forEach(r=>{
    R(Object.hasOwnProperty.call(grouped,r.profile_id),'profile snapshot missing');const id=JSON.stringify([r.profile_id,r.section,r.key]);R(!seen.has(id),'duplicate published row');seen.add(id);
    R(text(r.notes)&&r.notes.startsWith('ADB-SELECTION-NOTE-1 ')&&r.notes.length<45000,'note prefix/size invalid');
    // Handoff uses JSON-only envelopes. Transport prose is generated by publisher.
    const n=JSON.parse(r.notes.slice('ADB-SELECTION-NOTE-1 '.length));
    R(n.schema==='ADB-SELECTION-NOTE-1'&&n.selection_spec==='ADB-V2-SELECT-1.0'&&n.production_spec==='ADB-DAILY-PROD-2.0','note spec mismatch');
    R(text(n.run_id)&&n.run_id===b.run_id&&n.cutoff===b.cutoff,'run/cutoff mismatch');
    const c=n.candidate,lane=lanes[r.section];R(lane&&c.key===r.key,'section/key mismatch');R(typeof r.material_update==='boolean'&&c.history.material_update===r.material_update,'material flag mismatch');R(c.sources.some(s=>s.url===r.source_url),'row source mismatch');
    candidate(c,lane,r.profile_id);grouped[r.profile_id].push(n);
  });
  let sharedReference;
  Object.keys(grouped).forEach(p=>{
    const notes=grouped[p],profile=b.profiles[p];R(['Fewer','Standard','More'].includes(profile.volume),'volume missing');const contexts=notes.filter(n=>n.context!==undefined);R(contexts.length===1,'exactly one context carrier required');
    const ctx=contexts[0].context;R(ctx.volume===profile.volume&&eq(ctx.shared_weights,shared)&&eq(ctx.mfy_weights,mfy)&&ctx.history_window_start===b.history_window_start,'context snapshots mismatch');
    R(Array.isArray(ctx.rejected),'rejected records missing');ctx.rejected.forEach(r=>{R(['key','topic','reason'].every(k=>meaningful(r[k]))&&['top','utr','mfy'].includes(r.lane)&&['source','fit','repeat','section','score','freshness'].includes(r.failed_gate),'rejected record invalid');R(!notes.some(n=>n.candidate.key===r.key),'rejected candidate published');});
    ['top','mfy'].forEach(l=>slate(ctx[l],l,Object.fromEntries(notes.filter(n=>n.candidate.lane===l).map(n=>[n.candidate.key,n.candidate])),p));
    const search=ctx.utr_search||{};R(search.independent===true&&Array.isArray(search.checks)&&search.checks.length,'independent UTR search missing');search.checks.forEach(ch=>{R(meaningful(ch.query_or_path)&&meaningful(ch.finding),'UTR search detail missing');source(ch.source);});
    const utr=notes.filter(n=>n.candidate.lane==='utr').map(n=>n.candidate);R(search.outcome===(utr.length?'selected':'none_qualified')&&meaningful(search.reason),'UTR outcome mismatch');
    utr.forEach(c=>{const d=c.discovery||{};R(['overlooked_fact','prominence_evidence','placement_reason'].every(k=>meaningful(d[k])),'UTR discovery missing');R(Number.isInteger(d.search_check)&&d.search_check>=0&&d.search_check<search.checks.length,'UTR search binding missing');R(d.narrow_scope_only===false&&d.rejected_headline_only===false,'invalid UTR rationale');});
    const sh={top:ctx.top,utr_search:search,utr:utr,rejected:ctx.rejected.filter(r=>r.lane!=='mfy')};if(sharedReference===undefined)sharedReference=sh;R(eq(sh,sharedReference),'shared selection differs');
    R(new Set(notes.map(n=>n.candidate.key)).size===notes.length,'same item in multiple sections');const topics=notes.filter(n=>['top','utr'].includes(n.candidate.lane)).map(n=>n.candidate.topic);
    notes.forEach(n=>{if(n.candidate.lane==='mfy'&&topics.includes(n.candidate.topic))R(meaningful(n.candidate.distinct_shared_angle),'MFY retelling lacks distinct angle');});
  });
  return {contract:'ADB-SELECTION-JS-1.0',rows:b.rows.length};
}
