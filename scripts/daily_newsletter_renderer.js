/**
 * ADB-DAILY-RENDER-JS-1.0
 * Pure, deterministic render function. No DOM, Node, filesystem, network,
 * external dependencies, queues or transport calls. Suitable for ChatGPT
 * connected-tool Code Mode and for Node VM tests.
 *
 * Usage after retrieving this exact file at a verified GitHub commit:
 *   const render = new Function(source + ';return adbRenderDailyNewsletter;')();
 *   const {html,text} = render(approvedStructuredEditorialInput);
 *   const validate = new Function(contractSource +
 *     ';return adbValidateDailyNewsletterPayload_;')();
 *   validate(html,text); // must pass BEFORE any production queue writes
 */
function adbRenderDailyNewsletter(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Expected one structured editorial JSON object.');
  }
  const h=[],t=[];
  function requireText(obj,key) {
    if (!obj || typeof obj[key] !== 'string' || !obj[key].trim()) {
      throw new Error('Required nonempty text field: ' + key);
    }
    return obj[key].trim();
  }
  function optText(value) {
    if (value === undefined || value === null) return '';
    if (typeof value !== 'string') throw new Error('Optional copy must be a string.');
    return value.trim();
  }
  function esc(v) {
    return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function url(s) {
    const v=String(s || '').trim();
    if (!/^https:\/\/[a-z0-9.-]+(?::[0-9]{1,5})?(?:[\/?#]|$)/i.test(v) ||
        /[\s<>"'\\]/.test(v) || v.includes('@')) {
      throw new Error('Expected HTTPS URL with no embedded credentials.');
    }
    return v;
  }
  function add(markup,text) {
    h.push(markup);
    if (text !== undefined && text !== null) t.push(String(text));
  }
  function link(prefix,name,target) {
    const dest=url(target), label=prefix+': '+name+' →';
    add('<p style="margin:10px 0 0;"><a href="'+esc(dest)+
      '" style="display:inline-block;padding:8px 0;color:#8f1717;font-size:16px;font-weight:700;text-decoration:underline;">'+
      esc(label)+'</a></p>',prefix+': '+name+'\n'+dest);
  }
  function footerLink(label,target,primary) {
    const dest=url(target);
    const style=primary?
      'display:inline-block;padding:12px 16px;background:#db2d2d;color:#fffefa;font-size:16px;font-weight:700;text-decoration:none;':
      'display:inline-block;padding:6px 8px;color:#fffefa;font-size:15px;text-decoration:underline;';
    add('<a href="'+esc(dest)+'" style="'+style+'">'+esc(label)+'</a>',label+'\n'+dest);
  }
  function section(name) {
    add('<div class="major" style="padding:42px 0;border-bottom:1px solid #dedad1;">');
    add('<div style="margin:0 0 12px;color:#8f1717;font-family:Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">'+esc(name)+'</div>',name);
  }
  function end() {add('</div>'); t.push('');}
  function why(body) {
    const text=optText(body);
    if (!text) throw new Error('Required Why It Matters text missing.');
    add('<div style="margin:16px 0 0;padding:15px 16px;border-left:4px solid #db2d2d;background:#f2efe8;">');
    add('<div style="margin:0 0 5px;color:#181818;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">WHY IT MATTERS</div>');
    add('<p style="margin:0;font-size:16px;line-height:1.53;color:#2a2926;">'+esc(text)+'</p>','WHY IT MATTERS: '+text);
    add('</div>');
  }
  function sources(item) {
    if (!Array.isArray(item.sources) || !item.sources.length) throw new Error('Editorial story requires named source URLs.');
    item.sources.forEach(function(s){link('Source',requireText(s,'publisher'),requireText(s,'url'));});
  }
  function story(item,feature) {
    if (!item || typeof item!=='object') throw new Error('Story must be an object.');
    const title=requireText(item,'headline'),summary=requireText(item,'summary'),expl=requireText(item,'why');
    const tag=feature?'h1':'h2',size=feature?31:24;
    add('<'+tag+' style="margin:0;color:#181818;font-family:Georgia,\'Times New Roman\',serif;font-size:'+
      size+'px;line-height:1.17;font-weight:700;">'+esc(title)+'</'+tag+'>',title);
    if (item.metadata) add('<p style="margin:9px 0 0;color:#68635a;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;">'+
      esc(optText(item.metadata))+'</p>',optText(item.metadata));
    add('<p style="margin:14px 0 0;font-size:16px;line-height:1.57;color:#2a2926;">'+esc(summary)+'</p>',summary);
    why(expl); sources(item);
  }
  const iso=requireText(payload,'date');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error('Invalid America/Chicago YYYY-MM-DD edition date.');
  const parts=iso.split('-').map(Number), date=new Date(Date.UTC(parts[0],parts[1]-1,parts[2]));
  if (date.getUTCFullYear()!==parts[0] || date.getUTCMonth()!==parts[1]-1 || date.getUTCDate()!==parts[2]) {
    throw new Error('Invalid calendar date.');
  }
  const dayNames=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  const monthNames=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  const dateLabel=dayNames[date.getUTCDay()]+' · '+monthNames[date.getUTCMonth()]+' '+date.getUTCDate()+', '+date.getUTCFullYear();
  if (!Array.isArray(payload.topStories) || !payload.topStories.length) {
    throw new Error('A nonempty array of non-featured Top Stories is required.');
  }
  if (!payload.weather || typeof payload.weather!=='object') throw new Error('Missing weather object.');
  const footer=payload.footer || {};
  const manage=url(requireText(footer,'manageUrl'));
  const masthead='https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/main/assets/brand/adb-masthead@2x.png';
  const mark='https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/main/assets/brand/adb-mark-reversed@2x.png';
  const site='https://austindailybriefing.com/';
  const feedbackDefault='https://docs.google.com/forms/d/e/1FAIpQLSc_0-djww4qboFaEn9k-nEponrCBBqz-MCB81sOUtLjVsOZ7w/viewform';
  add('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'+
    '<body style="margin:0;padding:0;background:#ece9e2;color:#181818;font-family:Arial,Helvetica,sans-serif;">');
  add('<div style="display:none!important;max-height:0;max-width:0;opacity:0;overflow:hidden;color:transparent;">'+
    esc(optText(payload.preheader))+'</div>');
  add('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ece9e2;"><tr><td align="center" style="padding:18px 8px;">');
  add('<table role="presentation" width="620" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:620px;background:#fffefa;"><tr><td align="center" style="padding:30px 24px 22px;border-bottom:1px solid #dedad1;background:#fffefa;">');
  add('<img src="'+masthead+'" width="500" alt="Austin Daily Briefing" style="display:block;width:100%;max-width:500px;height:auto;border:0;">');
  add('<div style="margin-top:12px;color:#68635a;font-family:Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;">'+
    esc(dateLabel)+'</div></td></tr><tr><td class="content-pad" style="padding:0 34px;background:#fffefa;">',dateLabel);
  section('AUSTIN PULSE');
  const pulse=requireText(payload,'pulse');
  add('<p style="margin:0;padding-left:18px;border-left:4px solid #db2d2d;color:#2a2926;font-family:Georgia,\'Times New Roman\',serif;font-size:21px;line-height:1.48;">'+esc(pulse)+'</p>',pulse);
  end();
  if (payload.correction) {
    section('CORRECTION / CLARIFICATION');
    const correction=optText(payload.correction);
    add('<p style="font-size:16px;line-height:1.55;">'+esc(correction)+'</p>',correction);end();
  }
  section('WEATHER');
  const w=payload.weather,summary=requireText(w,'summary');
  add('<p style="margin:0;font-size:16px;line-height:1.55;">'+esc(summary)+'</p>',summary);
  if(w.high!==undefined && w.low!==undefined && w.high!==null && w.low!==null) {
    const hi=Number(w.high),lo=Number(w.low);
    if (!Number.isFinite(hi) || !Number.isFinite(lo)) throw new Error('Weather high/low must be numeric.');
    const temp=hi+'° / '+lo+'°';
    add('<p style="margin:14px 0 0;color:#181818;font-size:30px;font-weight:800;">'+esc(temp)+'</p>',temp);
  }
  link('Forecast','National Weather Service',requireText(w,'url'));end();
  section('FEATURED TOP STORY');story(payload.featured,true);end();
  section('TOP STORIES');
  payload.topStories.forEach(function(item) {
    add('<div style="padding:0 0 26px;margin:0 0 24px;border-bottom:1px solid #dedad1;">');
    story(item,false); add('</div>');
  });
  end();
  const radar=payload.underTheRadar;
  if (radar) {
    add('<div class="major" style="padding:46px 0;border-bottom:1px solid #dedad1;"><div style="border-top:5px solid #db2d2d;">');
    add('<div style="padding:14px 22px;background:#f2efe8;color:#181818;font-family:Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">UNDER THE RADAR</div>','UNDER THE RADAR');
    add('<div style="padding:24px 22px;background:#fffefa;">');story(radar,false);
    add('</div></div></div>');t.push('');
  }
  const mfy=payload.moreForYou||[];
  if (!Array.isArray(mfy)) throw new Error('moreForYou must be an array.');
  if (mfy.length) {
    section('MORE FOR YOU');
    add('<p style="font-size:14px;color:#68635a;">Selected based on your saved interests.</p>','Selected based on your saved interests.');
    mfy.forEach(function(item){
      const title=requireText(item,'headline'),summary=requireText(item,'summary');
      add('<div style="padding:18px 0;border-bottom:1px solid #dedad1;">');
      add('<h3 style="margin:0;color:#181818;font-family:Georgia,\'Times New Roman\',serif;font-size:21px;line-height:1.2;">'+esc(title)+'</h3>',title);
      add('<p style="font-size:16px;line-height:1.55;">'+esc(summary)+'</p>',summary);
      if (item.why) why(item.why);
      sources(item);
      add('</div>');
    });
    end();
  }
  section('AUSTIN AHEAD');
  add('<p style="font-size:14px;color:#68635a;">What to attend, watch, and plan around in the days ahead.</p>',
    'What to attend, watch, and plan around in the days ahead.');
  const ahead=payload.austinAhead||[];
  if (!Array.isArray(ahead)) throw new Error('austinAhead must be an array.');
  if (!ahead.length) add('<p style="font-size:16px;">No major Austin Ahead items to flag today.</p>',
    'No major Austin Ahead items to flag today.');
  ahead.forEach(function(item){
    const action=requireText(item,'action').toUpperCase(),when=requireText(item,'when');
    if (!['GO','WATCH','PLAN'].includes(action)) throw new Error('Austin Ahead action must be GO, WATCH or PLAN.');
    const title=requireText(item,'title');
    add('<div style="padding:15px 0;border-bottom:1px solid #dedad1;">');
    add('<div style="color:#8f1717;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">'+
      esc(action+' · '+when)+'</div>',action+' · '+when);
    add('<h3 style="margin:7px 0 0;color:#181818;font-family:Georgia,\'Times New Roman\',serif;font-size:20px;line-height:1.2;">'+esc(title)+'</h3>',title);
    if(item.description) {
      const descr=optText(item.description);
      add('<p style="font-size:16px;line-height:1.5;">'+esc(descr)+'</p>',descr);
    }
    const type=item.linkType || 'Event details';
    if (!['Event details','Source'].includes(type)) throw new Error('Invalid Austin Ahead linkType.');
    link(type,requireText(item,'organizer'),requireText(item,'url'));
    add('</div>');
  });
  end();
  const recap=payload.fridayRecap||[];
  if (!Array.isArray(recap)) throw new Error('fridayRecap must be an array.');
  if (recap.length) {
    if (date.getUTCDay()!==5 || recap.length>3) throw new Error('Friday recap allowed only Friday, at most three entries.');
    section('THIS WEEK IN AUSTIN');
    recap.forEach(function(entry) {
      const summary=requireText(entry,'text');
      add('<p style="font-size:16px;line-height:1.55;">'+esc(summary)+'</p>',summary);
      sources(entry);
    });
    end();
  }
  if (payload.whatsNew) {
    const copy=optText(payload.whatsNew);
    section("WHAT'S NEW");
    add('<p style="font-size:16px;line-height:1.55;">'+esc(copy)+'</p>',copy);
    end();
  }
  add('</td></tr><tr><td align="center" style="background:#181818;color:#fffefa;padding:26px 20px;text-align:center;">');
  add('<img src="'+mark+'" width="54" alt="ADB" style="display:block;margin:0 auto 12px;width:54px;height:auto;">');
  add('<p style="font-size:14px;line-height:1.5;color:#e8ecef;">You’re receiving Austin Daily Briefing because this address is subscribed.</p>',
    'You are receiving Austin Daily Briefing because this address is subscribed.');
  add('<p style="margin:16px 0 10px;">');
  footerLink('Manage / pause or unsubscribe',manage,true);
  add('</p><p style="margin:0;">');
  footerLink('Website',site);footerLink('Customize',site+'customize.html');
  footerLink('Feedback & Corrections',footer.feedbackUrl||feedbackDefault);
  footerLink('Corrections Log',site+'corrections.html');
  footerLink('Privacy',site+'privacy.html');footerLink('Terms',site+'terms.html');
  add('</p></td></tr></table></td></tr></table></body></html>');
  const out={html:h.join('\n'),text:t.join('\n\n').trim()+'\n'};
  if (out.html.length>45000 || out.text.length>45000)
    throw new Error('Rendered newsletter exceeds the 45000-character Sheets limit.');
  return out;
}
