// GENERATED DEV REVIEW ONLY. No configured files, publication or delivery.

// Source: scripts/daily_newsletter_renderer.js
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

// Source: apps-script/DailyNewsletterContract.gs
/**
 * ADB-DAILY-HTML-1.0
 * Pure Apps Script / Node JS; validates ACTUAL generated newsletter payloads.
 * Fail closed before Resend. A sample-only QA success cannot bypass this guard.
 */
function adbValidateDailyNewsletterHtml_(value) {
  const html = String(value || '');
  const errors = [];
  function reject(message) { errors.push(message); }
  function location(label) {
    const escaped = label.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    const match = new RegExp('>\\s*' + escaped + '\\s*<', 'i').exec(html);
    return match ? match.index : -1;
  }
  function styleValue(tag, property, value) {
    const escaped = value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    return new RegExp(property + '\\s*:\\s*' + escaped + '(?=\\s*[;\\x22\\x27>]|$)', 'i').test(tag);
  }
  if (!html || html.length > 45000) reject('Body must be nonempty and no more than 45000 characters');
  const logoMatch = /<img\b[^>]*adb-masthead@2x\.png[^>]*>/i.exec(html);
  const footMatch = /<img\b[^>]*adb-mark-reversed@2x\.png[^>]*>/i.exec(html);
  const logo = logoMatch ? logoMatch.index : -1;
  const footer = footMatch ? footMatch.index : -1;
  if (logo < 0) reject('Approved masthead image missing');
  if (footer < 0) reject('Approved footer mark missing');

  const sections = [
    ['AUSTIN PULSE',location('AUSTIN PULSE')],
    ['WEATHER',location('WEATHER')],
    ['FEATURED TOP STORY',location('FEATURED TOP STORY')],
    ['TOP STORIES',location('TOP STORIES')],
    ['UNDER THE RADAR',location('UNDER THE RADAR')],
    ['MORE FOR YOU',location('MORE FOR YOU')],
    ['AUSTIN AHEAD',location('AUSTIN AHEAD')]
  ];
  const mandatory = ['AUSTIN PULSE','WEATHER','FEATURED TOP STORY','TOP STORIES','AUSTIN AHEAD'];
  sections.forEach(function(s) {
    if (mandatory.indexOf(s[0]) >= 0 && s[1] < 0) reject('Required component missing: ' + s[0]);
  });
  const sequence = [['MASTHEAD',logo]].concat(sections.filter(function(s) { return s[1] >= 0; }), [['FOOTER',footer]]);
  for (let n = 1; n < sequence.length; n++) {
    if (sequence[n][1] <= sequence[n-1][1])
      reject('Wrong component order: ' + sequence[n][0] + ' must follow ' + sequence[n-1][0]);
  }
  const pulse = location('AUSTIN PULSE');
  const dateRange = logo >= 0 && pulse > logo ? html.slice(logo, pulse).replace(/<[^>]+>/g,' ') : '';
  if (!/\b(?:SUNDAY|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY)\b[\s,·–-]+(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+\d{1,2},?\s+\d{4}/i.test(dateRange))
    reject('Edition date missing between masthead and Austin Pulse');

  // Stack-parse tables so an outside-the-frame Top Stories panel cannot pass.
  const tokens = /<\/?table\b[^>]*>/gi, stack = [], frames = [];
  let match;
  while ((match = tokens.exec(html)) !== null) {
    if (/^<\/table/i.test(match[0])) {
      if (!stack.length) { reject('Unbalanced closing table'); continue; }
      const open = stack.pop();
      if (styleValue(open.tag,'max-width','620px') && styleValue(open.tag,'background','#fffefa'))
        frames.push({from:open.at,to:match.index});
    } else stack.push({at:match.index,tag:match[0]});
  }
  if (stack.length) reject('Unbalanced opening table');
  const frame = frames.find(function(f) { return f.from < logo && footer < f.to; });
  if (!frame) reject('Single Paper #FFFEFA / max-width:620px reading frame missing');
  else sections.forEach(function(s) {
    if (s[1] >= 0 && (s[1] <= frame.from || s[1] >= frame.to)) reject(s[0] + ' outside reading frame');
  });

  // Check nearest TD of each editorial component, ignoring centered exterior shell.
  const tdTokens = /<\/?td\b[^>]*>/gi, tdStack = [], cells = [];
  while ((match = tdTokens.exec(html)) !== null) {
    if (/^<\/td/i.test(match[0])) tdStack.pop();
    else tdStack.push(match[0]);
    cells.push({at:match.index,tag:tdStack.length ? tdStack[tdStack.length-1] : ''});
  }
  ['FEATURED TOP STORY','TOP STORIES','UNDER THE RADAR','MORE FOR YOU','AUSTIN AHEAD'].forEach(function(name) {
    const at = location(name);
    if (at < 0) return;
    let cell = '';
    for (let i = 0; i < cells.length && cells[i].at < at; i++) cell = cells[i].tag;
    if (!cell) reject(name + ' not inside a reading table cell');
    else if (/\balign\s*=\s*["']?center/i.test(cell) || styleValue(cell,'text-align','center'))
      reject('Centered editorial reading cell: ' + name);
    if (name === 'FEATURED TOP STORY' && cell && !styleValue(cell,'background','#fffefa'))
      reject('Featured story reading cell must use Paper #FFFEFA');
  });

  const featuredAt = location('FEATURED TOP STORY'), storiesAt = location('TOP STORIES');
  const next = sections.filter(function(s) {
    return ['UNDER THE RADAR','MORE FOR YOU','AUSTIN AHEAD'].indexOf(s[0]) >= 0 && s[1] > storiesAt;
  }).map(function(s){return s[1];}).sort(function(a,b){return a-b;})[0] || footer;
  const featured = featuredAt >= 0 && storiesAt > featuredAt ? html.slice(featuredAt,storiesAt) : '';
  const storyHtml = storiesAt >= 0 && next > storiesAt ? html.slice(storiesAt,next) : '';
  const h1 = /<h1\b([^>]*)>/i.exec(featured);
  if (!h1 || !/font-family\s*:\s*Georgia\s*,/i.test(h1[1])) reject('Featured headline must use Georgia serif');
  const headlines = Array.from(storyHtml.matchAll(/<h2\b([^>]*)>/gi));
  if (!headlines.length) reject('No standard Top Story headlines');
  headlines.forEach(function(h) {
    if (!/font-family\s*:\s*Georgia\s*,/i.test(h[1])) reject('Standard headline must use Georgia serif');
    if (/text-align\s*:\s*center/i.test(h[1])) reject('Centered headline forbidden');
  });
  // Every shared story must independently show both consequence and attribution.
  // Aggregate link counts can conceal a missing source in an individual item.
  function hasNamedSource(segment) {
    return /<a\b[^>]*>\s*Source:\s*[^<]+<\/a>/i.test(segment);
  }
  function hasWhyTreatment(segment) {
    return />\s*WHY IT MATTERS\s*</i.test(segment) &&
      /border-left\s*:\s*4px\s+solid\s+#db2d2d/i.test(segment) &&
      /background\s*:\s*#f2efe8/i.test(segment);
  }
  if (featured && (!hasNamedSource(featured) || !hasWhyTreatment(featured)))
    reject('Featured story must independently contain a named source and canonical Why It Matters');
  headlines.forEach(function(heading,index) {
    const begin = heading.index;
    const finish = index + 1 < headlines.length ? headlines[index+1].index : storyHtml.length;
    const segment = storyHtml.slice(begin,finish);
    if (!hasNamedSource(segment) || !hasWhyTreatment(segment))
      reject('Standard Top Story ' + (index+1) +
        ' must independently contain a named source and canonical Why It Matters');
  });
  const why = (html.slice(featuredAt >= 0 ? featuredAt : 0, next > 0 ? next : html.length)
    .match(/>\s*WHY IT MATTERS\s*</gi) || []).length;
  if (why < headlines.length+1) reject('Why It Matters missing for a Top Story');
  if (!/border-left\s*:\s*4px\s+solid\s+#db2d2d/i.test(featured) ||
      !/background\s*:\s*#f2efe8/i.test(featured))
    reject('Canonical Featured Why It Matters treatment absent');
  const links = Array.from(html.matchAll(/<a\b([^>]*)>\s*Source:\s*[^<]+<\/a>/gi));
  if (links.length < headlines.length+1) reject('Missing publisher source links');
  links.forEach(function(a) {
    if (!styleValue(a[1],'color','#8f1717') || !/text-decoration\s*:\s*underline/i.test(a[1]))
      reject('Source links must use underlined Link Red #8F1717');
  });
  const radar = location('UNDER THE RADAR');
  if (radar >= 0) {
    const area = html.slice(Math.max(0,radar-270),radar+450);
    if (!/border-top\s*:\s*5px\s+solid\s+#db2d2d/i.test(area) ||
        !/background\s*:\s*#f2efe8/i.test(area) ||
        !/background\s*:\s*#fffefa/i.test(area))
      reject('Under the Radar needs red rule, Wash header and Paper body');
  }
  const more = location('MORE FOR YOU'), ahead = location('AUSTIN AHEAD');
  if (more >= 0 && html.indexOf('Selected based on your saved interests.',more) < more)
    reject('More for You orientation missing');
  if (ahead >= 0 && html.indexOf('What to attend, watch, and plan around in the days ahead.',ahead) < ahead)
    reject('Austin Ahead orientation missing');
  if (html.indexOf('https://austindailybriefing.com/customize.html') < 0) reject('Native Customize destination missing');
  if (errors.length) throw new Error('ADB-DAILY-HTML-1.0: ' + errors.join(' | '));
  return {contract:'ADB-DAILY-HTML-1.0',sourceLinks:links.length,standardStories:headlines.length};
}


/**
 * Edition parity guard. Use this exact function in BOTH generator CLI and dispatcher.
 * Prevents a valid HTML shell from hiding incomplete plain text or mismatched links.
 */
function adbValidateDailyNewsletterPayload_(html, plainText) {
  const report = adbValidateDailyNewsletterHtml_(html);
  const text = String(plainText || '');
  if (!text.trim() || text.length > 45000)
    throw new Error('ADB-DAILY-HTML-1.0: Plain text must be nonempty and <= 45000 characters');
  const urls = Array.from(String(html || '').matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi),
    function(match) { return match[1].replace(/&amp;/g, '&'); });
  const textUrls = text.split(/\r?\n/).map(function(line) { return line.trim(); })
    .filter(function(line) { return /^https?:\/\//.test(line); });
  if (urls.length !== textUrls.length ||
      urls.some(function(url,index) { return url !== textUrls[index]; }))
    throw new Error('ADB-DAILY-HTML-1.0: HTML/plain-text URL count or destination order mismatch');
  if (text.indexOf('AUSTIN PULSE') < 0 || text.indexOf('AUSTIN AHEAD') < 0)
    throw new Error('ADB-DAILY-HTML-1.0: Plain text is missing required editorial sections');
  report.destinations = urls.length;
  return report;
}


/**
 * Read-only controlled reference preflight for manually deployed Apps Script.
 * Does not access subscriber data, queue, sheets, tokens, or Resend.
 * Use after installing this file AND the approved ResendTransport.gs revision.
 */
function validateAdbDailyNewsletterContractDeploymentV1() {
  if (typeof adbValidateDailyNewsletterPayload_ !== 'function') {
    throw new Error('ADB daily rendering contract is not installed.');
  }
  // The helper alone is insufficient: confirm the LIVE dispatcher function
  // actually calls the guard before any Resend transport handoff.
  if (typeof dispatchQueuedDailyBriefingsViaResendV1 !== 'function' ||
      String(dispatchQueuedDailyBriefingsViaResendV1).indexOf('adbValidateDailyNewsletterPayload_') < 0 ||
      String(dispatchQueuedDailyBriefingsViaResendV1).indexOf('previouslyBlockedRuns') < 0) {
    throw new Error('Live Resend dispatcher is missing the approved daily HTML/text guard; install the matching ResendTransport.gs first.');
  }
  const base = 'https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/main/design/';
  const htmlResponse = UrlFetchApp.fetch(base + 'newsletter-renderer-qa.html', {
    followRedirects: true, muteHttpExceptions: true
  });
  const textResponse = UrlFetchApp.fetch(base + 'newsletter-renderer-qa.txt', {
    followRedirects: true, muteHttpExceptions: true
  });
  if (htmlResponse.getResponseCode() !== 200 || textResponse.getResponseCode() !== 200) {
    throw new Error('Cannot retrieve the approved QA reference: HTTP ' +
      htmlResponse.getResponseCode() + ' / ' + textResponse.getResponseCode());
  }
  const approvedHtml = htmlResponse.getContentText('UTF-8');
  const approvedText = textResponse.getContentText('UTF-8');
  const result = adbValidateDailyNewsletterPayload_(approvedHtml, approvedText);
  const corrupted = approvedHtml.replace('>TOP STORIES<', '>NEWS<');
  if (corrupted === approvedHtml) {
    throw new Error('Controlled QA reference lacked TOP STORIES marker.');
  }
  let correctlyRejected = false;
  try {
    adbValidateDailyNewsletterPayload_(corrupted, approvedText);
  } catch (expected) {
    correctlyRejected = /Required component missing: TOP STORIES/.test(String(expected));
  }
  if (!correctlyRejected) throw new Error('Negative control was not rejected.');
  const layoutGuardMode = String(PropertiesService.getScriptProperties()
    .getProperty('ADB_DAILY_LAYOUT_GUARD_MODE') || 'STAGED').trim().toUpperCase();
  if (['STAGED', 'ENFORCE'].indexOf(layoutGuardMode) < 0) {
    throw new Error('Unsupported ADB_DAILY_LAYOUT_GUARD_MODE: ' + layoutGuardMode);
  }
  const report = {
    contract: result.contract,
    layoutGuardMode: layoutGuardMode,
    approvedReference: 'PASS',
    negativeControl: 'REJECTED',
    linkParity: 'PASS',
    componentOrder: 'PASS',
    sourceLinks: result.sourceLinks,
    destinationCount: result.destinations,
    queueWrites: 0,
    providerSends: 0
  };
  Logger.log(JSON.stringify(report));
  return report;
}

// Source: apps-script/SelectionEvidenceContract.gs
/** ADB-SELECTION-JS-1.1. Pure JS counterpart of validate_selection_notes.py.
 * Evidence is checked mechanically; source truth still requires editorial review.
 * No network, delivery, or storage side effects.
 */
function adbSelectionScopeMatches_(candidate, record, profileId) {
  return (candidate.lane === 'mfy' && record.lane === 'mfy' && record.profile_id === profileId) ||
    (['top','utr'].includes(candidate.lane) && ['top','utr'].includes(record.lane)) ||
    (candidate.lane === 'utility' && record.profile_id === profileId);
}

function adbSelectionApplicableHistory_(candidate, history, profileId, windowStart) {
  return history.filter(record => record.delivered === true &&
    adbSelectionScopeMatches_(candidate, record, profileId) &&
    (record.key === candidate.key || record.topic === candidate.topic) &&
    (record.date >= windowStart || candidate.evergreen === true));
}

/** Build future handoff references directly from normalized published records.
 * Does not infer a new topic identifier, material change, or editorial approval.
 * Duplicate copies of shared coverage collapse only when their facts agree.
 */
function adbBuildSelectionPriorReferencesV1(candidate, history, profileId, windowStart) {
  if (!candidate || !['top','utr','mfy','utility'].includes(candidate.lane) ||
      !candidate.key || !candidate.topic || !Array.isArray(history) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(windowStart) || !profileId) {
    throw new Error('Selection: invalid prior-reference construction input');
  }
  const refs = new Map();
  adbSelectionApplicableHistory_(candidate, history, profileId, windowStart).forEach(record => {
    if (typeof record.facts !== 'string' || !record.facts.trim()) {
      throw new Error('Selection: published prior fact missing');
    }
    const identity = JSON.stringify([record.key, record.date]);
    if (refs.has(identity) && refs.get(identity).facts !== record.facts) {
      throw new Error('Selection: conflicting published facts for prior key/date');
    }
    refs.set(identity, {key:record.key, date:record.date, facts:record.facts});
  });
  return Array.from(refs.values()).sort((a,b) =>
    a.date.localeCompare(b.date) || a.key.localeCompare(b.key));
}

/** Rejects claimed references; never silently rewrites delivered evidence. */
function adbValidateSelectionPriorReferenceV1(candidate, prior, history, profileId, windowStart) {
  const sameRecord = history.filter(record => record.delivered === true &&
    record.key === prior.key && record.date === prior.date);
  if (!sameRecord.length) throw new Error('Selection: prior key/date is absent from published history');
  if (!sameRecord.some(record => record.facts === prior.facts)) {
    throw new Error('Selection: prior fact must be copied exactly from published history');
  }
  if (!sameRecord.some(record => record.facts === prior.facts &&
      adbSelectionScopeMatches_(candidate, record, profileId))) {
    throw new Error('Selection: prior record is outside the repeat lane/profile scope');
  }
  if (!adbSelectionApplicableHistory_(candidate, sameRecord, profileId, windowStart)
      .some(record => record.facts === prior.facts)) {
    throw new Error('Selection: prior record does not bind to the stable topic/key and history window');
  }
  return true;
}

/** Manual pure-function QA for the DEV 0.2 update; no Sheets or delivery access. */
function runPublisherDevHandoffQaV1() {
  const R = (ok,message) => { if (!ok) throw new Error('Handoff QA: ' + message); };
  R(ADB_PUBLISHER.BUILD === 'ADB-PUBLISHER-DEV-0.2', 'updated publisher file missing');
  const candidate = {key:'synthetic-update', topic:'synthetic-stable-topic', lane:'top'};
  const prior = {key:'synthetic-prior', topic:'synthetic-stable-topic', lane:'top',
    profile_id:'SYNTHETIC', date:'2026-10-27', delivered:true,
    facts:'The original notice scheduled a service opening with accessibility details.'};
  const otherLane = Object.assign({},prior,{key:'synthetic-mfy',lane:'mfy'});
  const refs = adbBuildSelectionPriorReferencesV1(candidate,[prior,otherLane],
    'SYNTHETIC','2026-10-14');
  R(refs.length === 1 && refs[0].facts === prior.facts && refs[0].key === prior.key,
    'exact scoped references differ');
  Logger.log('PASS — exact archived fact copied; MFY excluded from shared scope');
  function reject(label,callback,expected) {
    try { callback(); } catch (error) {
      if (!String(error.message).includes(expected)) throw error;
      Logger.log('PASS — ' + label);
      return;
    }
    throw new Error('Handoff QA: accepted ' + label);
  }
  reject('paraphrased prior fact rejected', () =>
    adbValidateSelectionPriorReferenceV1(candidate,
      {key:prior.key,date:prior.date,facts:'A service opening was scheduled.'},
      [prior],'SYNTHETIC','2026-10-14'), 'copied exactly');
  reject('cross-lane prior rejected', () =>
    adbValidateSelectionPriorReferenceV1(candidate,
      {key:otherLane.key,date:otherLane.date,facts:otherLane.facts},
      [otherLane],'SYNTHETIC','2026-10-14'), 'repeat lane/profile scope');
  reject('changed topic identifier rejected', () =>
    adbValidateSelectionPriorReferenceV1(Object.assign({},candidate,{topic:'changed-topic'}),
      refs[0],[prior],'SYNTHETIC','2026-10-14'), 'stable topic/key');
  R(adbValidateSelectionPriorReferenceV1(candidate,refs[0],[prior],
    'SYNTHETIC','2026-10-14') === true, 'valid exact prior rejected');
  Logger.log('PASS — valid exact prior accepted');
  R(adbPublisherHistoryHeadline_('Austin Ahead',
    {action:'WATCH',when:'TODAY, NOON',title:'Synthetic public meeting'}) ===
    'WATCH · TODAY, NOON · Synthetic public meeting', 'Austin Ahead history format differs');
  Logger.log('PASS — Austin Ahead action/time/title preserved');
  const report = {result:'PASS',build:ADB_PUBLISHER.BUILD,checks:6,writes:false,emails:false};
  Logger.log(JSON.stringify(report));
  return report;
}

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
    const applicable=adbSelectionApplicableHistory_(c,b.published_history,p,b.history_window_start);
    R(Array.isArray(h.prior),'prior array missing');
    applicable.forEach(r=>R(h.prior.some(v=>v.key===r.key&&v.date===r.date),'known repeat missing'));
    h.prior.forEach(v=>adbValidateSelectionPriorReferenceV1(c,v,b.published_history,p,b.history_window_start));
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
  return {contract:'ADB-SELECTION-JS-1.1',rows:b.rows.length};
}

// Source: apps-script/EditorialPublisher.gs
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


// Source: apps-script/EditorialPublisherDevWorkflow.gs
/** ADB-PUBLISHER-DEV-WORKFLOW-0.1. Pure DEV staging/monitoring prototype.
 * No workbook access, transport, property changes or trigger installation.
 * This models lifecycle rules; it does not enforce Google file permissions.
 * Requires EditorialPublisher.gs for canonical JSON and digest helpers.
 */
function adbDevWorkflowRequire_(ok,message) {
  if (!ok) throw new Error('DEV workflow: '+message);
}

/** Drafting produces an unsealed copy, never READY. */
function adbDevDraftPackageV1(packageId,pkg) {
  adbDevWorkflowRequire_(typeof packageId==='string' && /^[A-Za-z0-9_-]{1,100}$/.test(packageId),'invalid package ID');
  adbDevWorkflowRequire_(pkg && typeof pkg==='object' && !Array.isArray(pkg),'package object required');
  const raw=adbPublisherCanonical_(pkg),chunks=[];
  for(let offset=0;offset<raw.length;offset+=39000) {
    chunks.push({'Package ID':packageId,Sequence:chunks.length+1,JSON:raw.slice(offset,offset+39000)});
  }
  return {manifest:{'Package ID':packageId,State:'DRAFT','Chunk Count':chunks.length,'Package SHA-256':''},chunks:chunks};
}

function adbDevDecodeStage_(stage,expectedState) {
  const R=adbDevWorkflowRequire_,m=stage && stage.manifest;
  R(m && m.State===expectedState,'unexpected staging state');
  R(typeof m['Package ID']==='string' && /^[A-Za-z0-9_-]{1,100}$/.test(m['Package ID']),'invalid package ID');
  R(Array.isArray(stage.chunks) && Number.isInteger(m['Chunk Count']) && m['Chunk Count']>0 &&
    stage.chunks.length===m['Chunk Count'],'missing or duplicate chunks');
  const chunks=stage.chunks.slice().sort((a,b)=>a.Sequence-b.Sequence);
  R(chunks.every((c,i)=>c['Package ID']===m['Package ID'] && c.Sequence===i+1 &&
    typeof c.JSON==='string' && c.JSON.length>0 && c.JSON.length<40000),'invalid chunk identity/order/size');
  return JSON.parse(chunks.map(c=>c.JSON).join(''));
}

/** Operator step in the model. A distinct real access boundary is still required. */
function adbDevSealDraftV1(stage,sha256) {
  const pkg=adbDevDecodeStage_(stage,'DRAFT');
  adbDevWorkflowRequire_(stage.manifest['Package SHA-256']==='','draft digest must be empty');
  const sealed=JSON.parse(JSON.stringify(stage));
  const digest=sha256(adbPublisherCanonical_(pkg));
  adbDevWorkflowRequire_(/^[a-f0-9]{64}$/.test(digest),'invalid digest');
  sealed.manifest.State='READY';sealed.manifest['Package SHA-256']=digest;
  return sealed;
}

function adbDevReadReadyV1(stage,sha256) {
  const pkg=adbDevDecodeStage_(stage,'READY');
  const digest=sha256(adbPublisherCanonical_(pkg));
  adbDevWorkflowRequire_(/^[a-f0-9]{64}$/.test(stage.manifest['Package SHA-256']) &&
    digest===stage.manifest['Package SHA-256'],'sealed package changed');
  return pkg;
}

function adbDevMonitorInitialV1() {
  return {status:'Idle',lastAttempt:'',lastSuccess:'',lastEventAt:'',
    activeRun:'',activeDigest:'',stage:'',incident:null,alertKeys:[],events:{},committed:{}};
}

/** Pure proposed monitoring transition; never writes status or sends an alert.
 * COMMIT_VERIFIED must be supplied only after the real writer's ledger/payload
 * readback. A caller-supplied ledger object alone is not verification evidence.
 * The prototype retains replay keys in memory; durable retention is unresolved.
 */
function adbDevReduceMonitorV1(previous,event) {
  const R=adbDevWorkflowRequire_,s=JSON.parse(JSON.stringify(previous));
  R(event && typeof event.id==='string' && /^[A-Za-z0-9_-]{1,100}$/.test(event.id),'event ID required');
  const encoded=adbPublisherCanonical_(event);
  if(Object.prototype.hasOwnProperty.call(s.events,event.id)) {
    R(s.events[event.id]===encoded,'event ID reused with different payload');
    return {state:s,result:'REPLAY',alertIntent:null};
  }
  R(['ATTEMPT','FAILURE','COMMIT_VERIFIED'].includes(event.type),'unsupported event');
  R(typeof event.at==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(event.at) &&
    Number.isFinite(Date.parse(event.at)) && new Date(event.at).toISOString()===event.at,'invalid timestamp');
  R(!s.lastEventAt || event.at>=s.lastEventAt,'out-of-order event');
  R(/^\d{4}-\d\d-\d\d$/.test(event.editionDate) &&
    new Date(event.editionDate+'T00:00:00Z').toISOString().slice(0,10)===event.editionDate &&
    event.runId===event.editionDate+'-publisher-v1' && /^[a-f0-9]{64}$/.test(event.digest),'invalid run identity');
  R(typeof event.stage==='string' && ['validation','commit','readback','monitoring'].includes(event.stage),'invalid failure stage');
  const committed=s.committed[event.runId];
  R(!committed || committed.digest===event.digest,'committed run digest conflict');
  if(s.activeRun===event.runId) R(s.activeDigest===event.digest,'active run digest changed');
  if(event.type!=='ATTEMPT') R(s.activeRun===event.runId && s.activeDigest===event.digest,'run has no active attempt');
  let alertIntent=null,result=event.type;
  if(event.type==='ATTEMPT') {
    // A committed edition is reconciled by readback, never queued again here.
    s.lastAttempt=event.at;s.activeRun=event.runId;s.activeDigest=event.digest;
    s.status='Running';s.stage=committed?'readback':event.stage;
  } else if(event.type==='FAILURE') {
    s.status='Failed';s.stage=event.stage;
    if(!s.incident) s.incident={firstFailure:event.at,runId:event.runId};
    const key='Morning Briefing:'+event.editionDate;
    if(!s.alertKeys.includes(key)) {
      s.alertKeys.push(key);
      alertIntent={key:key,component:'Morning Briefing',stage:event.stage};
    }
  } else {
    const l=event.ledger;
    R(l && l['Edition Key']==='daily:'+event.editionDate && l['Run ID']===event.runId &&
      l['Package SHA-256']===event.digest && Number.isInteger(l['Profile Count']) && l['Profile Count']>0 &&
      Number.isInteger(l['History Count']) && l['History Count']>=l['Profile Count'] &&
      typeof l['Committed At']==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(l['Committed At']) &&
      Number.isFinite(Date.parse(l['Committed At'])) && new Date(l['Committed At']).toISOString()===l['Committed At'] &&
      l['Committed At']<=event.at,'verified ledger identity/count/time mismatch');
    const record={digest:event.digest,ledger:adbPublisherCanonical_(l)};
    R(!committed || adbPublisherCanonical_(committed)===adbPublisherCanonical_(record),'verified ledger changed');
    s.committed[event.runId]=record;
    s.lastSuccess=s.lastSuccess>l['Committed At']?s.lastSuccess:l['Committed At'];
    s.status='Healthy';s.stage='complete';s.incident=null;
    result=committed?'RECONCILED':'SUCCESS';
  }
  s.events[event.id]=encoded;s.lastEventAt=event.at;
  return {state:s,result:result,alertIntent:alertIntent};
}

/** Manual QA in the existing isolated DEV project. Synthetic, memory only. */
function runPublisherDevWorkflowQaV1() {
  const R=adbDevWorkflowRequire_,sha=adbPublisherDigest_;
  const draft=adbDevDraftPackageV1('DEV-WORKFLOW-QA',{schema:'SYNTHETIC-LIFECYCLE-ONLY',text:'QA'});
  const ready=adbDevSealDraftV1(draft,sha);
  R(draft.manifest.State==='DRAFT' && ready.manifest.State==='READY','sealing mutates draft');
  R(adbDevReadReadyV1(ready,sha).text==='QA','round trip');
  const changed=JSON.parse(JSON.stringify(ready));changed.chunks[0].JSON=changed.chunks[0].JSON.replace('QA','EDITED');
  let rejected=false;try {adbDevReadReadyV1(changed,sha);}catch(e){rejected=true;}R(rejected,'tamper accepted');
  const digest=ready.manifest['Package SHA-256'];
  const base={editionDate:'2026-10-28',runId:'2026-10-28-publisher-v1',digest:digest,stage:'validation'};
  const event=(id,type,seconds,extra)=>Object.assign({},base,{id:id,type:type,at:'2026-10-28T19:00:'+seconds+'.000Z'},extra||{});
  let s=adbDevReduceMonitorV1(adbDevMonitorInitialV1(),event('start','ATTEMPT','00')).state;
  const failed=adbDevReduceMonitorV1(s,event('fail','FAILURE','01'));s=failed.state;
  R(failed.alertIntent && !s.lastSuccess,'failure advances success');
  const repeat=adbDevReduceMonitorV1(s,event('fail-again','FAILURE','02'));s=repeat.state;
  R(!repeat.alertIntent && s.incident.firstFailure==='2026-10-28T19:00:01.000Z','failure suppression/incident');
  const ledger={'Edition Key':'daily:2026-10-28','Package SHA-256':digest,'Run ID':base.runId,
    'Profile Count':1,'History Count':6,'Committed At':'2026-10-28T19:00:03.000Z'};
  const done=event('done','COMMIT_VERIFIED','04',{stage:'readback',ledger:ledger});
  const success=adbDevReduceMonitorV1(s,done);s=success.state;
  R(s.status==='Healthy' && !s.incident && !success.alertIntent,'recovery not silent');
  R(adbDevReduceMonitorV1(s,done).result==='REPLAY','exact replay');
  const telemetryFailure=adbDevReduceMonitorV1(s,event('telemetry-fail','FAILURE','05',{stage:'monitoring'}));
  const recovered=adbDevReduceMonitorV1(telemetryFailure.state,event('retry','COMMIT_VERIFIED','06',{stage:'readback',ledger:ledger}));
  R(recovered.result==='RECONCILED' && recovered.state.lastSuccess===ledger['Committed At'] && !recovered.alertIntent,'reconciliation');
  Logger.log(JSON.stringify({result:'PASS',build:'ADB-PUBLISHER-DEV-WORKFLOW-0.1',
    scope:'synthetic in-memory lifecycle only',writes:false,emails:false,
    draftReadyRoundTrip:true,tamperRejected:true,failureSuppression:true,
    earliestIncidentPreserved:true,silentRecovery:true,exactReplay:true,telemetryReconciled:true,
    realPermissionsVerified:false}));
}

// Source: apps-script/EditorialPublisherDevHandoff.gs
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

// Source: apps-script/EditorialPublisherDevReviewHost.gs
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

// Source: apps-script/EditorialPublisherDevReviewSetup.gs
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

const ADB_DEV_REVIEW_SEED_JSON = "{\"schema\":\"ADB-EDITORIAL-HANDOFF-1\",\"edition_date\":\"2026-10-30\",\"source_revision\":\"a1fe5514f362719c0e379ccb2276d7df3492737a\",\"expected_profile_count\":1,\"editions\":[{\"profile_id\":\"SYNTHETIC\",\"editorial\":{\"date\":\"2026-10-30\",\"preheader\":\"Controlled rendering fixture — not a live briefing.\",\"pulse\":\"A local decision and a transit update lead the day; readers can also plan for an upcoming meeting.\",\"weather\":{\"summary\":\"Partly cloudy with an afternoon chance of rain.\",\"high\":89,\"low\":70,\"url\":\"https://forecast.weather.gov/\"},\"featured\":{\"headline\":\"Sample city budget decision for controlled rendering\",\"metadata\":\"AUSTIN · GOVERNMENT\",\"summary\":\"This is a synthetic editorial test, not a current news item.\",\"why\":\"The sample demonstrates a consequence box under the approved headline hierarchy.\",\"sources\":[{\"publisher\":\"City of Austin\",\"url\":\"https://www.austintexas.gov/\"}]},\"topStories\":[{\"headline\":\"Transit sample confirms story presentation\",\"metadata\":\"AUSTIN · TRANSPORTATION\",\"summary\":\"A second synthetic story exercises the standard item component.\",\"why\":\"Readers need context distinguishing the policy from practical effects.\",\"sources\":[{\"publisher\":\"KUT\",\"url\":\"https://www.kut.org/\"}]},{\"headline\":\"Public meeting sample exercises source attribution\",\"summary\":\"A third synthetic example provides another independent source area.\",\"why\":\"The example allows a source-link style check.\",\"sources\":[{\"publisher\":\"Travis County\",\"url\":\"https://www.traviscountytx.gov/\"}]}],\"moreForYou\":[{\"headline\":\"Science and technology personalized sample\",\"summary\":\"A sample selected under reader interests.\",\"why\":\"This is only controlled QA content.\",\"sources\":[{\"publisher\":\"UT News\",\"url\":\"https://news.utexas.edu/\"}]}],\"austinAhead\":[{\"action\":\"WATCH\",\"when\":\"THURSDAY, 9 AM\",\"title\":\"Sample public meeting\",\"description\":\"Check the public agenda before attending.\",\"organizer\":\"City of Austin\",\"url\":\"https://www.austintexas.gov/\"},{\"action\":\"PLAN\",\"when\":\"MONDAY, 10 AM\",\"title\":\"Sample registration deadline\",\"organizer\":\"City of Austin\",\"url\":\"https://www.austintexas.gov/council/meetings\"}],\"footer\":{\"manageUrl\":\"https://example.org/manage\",\"feedbackUrl\":\"https://docs.google.com/forms/d/e/1FAIpQLSc_0-djww4qboFaEn9k-nEponrCBBqz-MCB81sOUtLjVsOZ7w/viewform\"}},\"bindings\":[{\"section\":\"Featured Top Story\",\"index\":0,\"key\":\"fixture-0\",\"category\":\"Synthetic QA\"},{\"section\":\"Top Story\",\"index\":0,\"key\":\"fixture-1\",\"category\":\"Synthetic QA\"},{\"section\":\"Top Story\",\"index\":1,\"key\":\"fixture-2\",\"category\":\"Synthetic QA\"},{\"section\":\"More for You\",\"index\":0,\"key\":\"fixture-3\",\"category\":\"Synthetic QA\"},{\"section\":\"Austin Ahead\",\"index\":0,\"key\":\"fixture-4\",\"category\":\"Synthetic QA\"},{\"section\":\"Austin Ahead\",\"index\":1,\"key\":\"fixture-5\",\"category\":\"Synthetic QA\"}]}],\"selection_bundle\":{\"run_id\":\"2026-10-30-publisher-v1\",\"cutoff\":\"2026-10-30T08:00:00-05:00\",\"history_complete\":true,\"history_window_start\":\"2026-10-16\",\"published_history\":[],\"profiles\":{\"SYNTHETIC\":{\"volume\":\"Standard\",\"summary_style\":\"Standard\",\"why_it_matters_length\":\"Standard\",\"preferences\":{\"TEST_INTEREST\":\"Normal\"}}},\"rows\":[{\"profile_id\":\"SYNTHETIC\",\"section\":\"Featured Top Story\",\"key\":\"fixture-0\",\"material_update\":false,\"source_url\":\"https://www.austintexas.gov/\",\"notes\":\"ADB-SELECTION-NOTE-1 {\\\"schema\\\":\\\"ADB-SELECTION-NOTE-1\\\",\\\"production_spec\\\":\\\"ADB-DAILY-PROD-2.0\\\",\\\"selection_spec\\\":\\\"ADB-V2-SELECT-1.0\\\",\\\"run_id\\\":\\\"2026-10-30-publisher-v1\\\",\\\"cutoff\\\":\\\"2026-10-30T08:00:00-05:00\\\",\\\"candidate\\\":{\\\"key\\\":\\\"fixture-0\\\",\\\"topic\\\":\\\"fixture-0\\\",\\\"lane\\\":\\\"top\\\",\\\"fact\\\":\\\"A newly published decision adds a service.\\\",\\\"procedural_status\\\":\\\"adopted\\\",\\\"placement_reason\\\":\\\"A concrete decision readers can act on.\\\",\\\"event_timing\\\":\\\"completed\\\",\\\"sources\\\":[{\\\"url\\\":\\\"https://www.austintexas.gov/\\\",\\\"access\\\":\\\"read\\\",\\\"accessed_at\\\":\\\"2026-10-30T07:30:00-05:00\\\",\\\"published_at\\\":\\\"2026-10-29T15:00:00-05:00\\\",\\\"locator\\\":\\\"Page 2, decision paragraph\\\"}],\\\"gates\\\":{\\\"source\\\":true,\\\"fit\\\":true,\\\"repeat\\\":true,\\\"section\\\":true},\\\"history\\\":{\\\"key_checked\\\":true,\\\"topic_checked\\\":true,\\\"search_reason\\\":\\\"Searched aliases and prior service coverage in delivered history.\\\",\\\"material_update\\\":false,\\\"prior\\\":[]},\\\"scores\\\":[16,16,12,12,8,8,8],\\\"total\\\":80,\\\"score_reasons\\\":[\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\"]},\\\"context\\\":{\\\"volume\\\":\\\"Standard\\\",\\\"shared_weights\\\":[20,20,15,15,10,10,10],\\\"mfy_weights\\\":[25,25,20,10,10,10],\\\"history_window_start\\\":\\\"2026-10-16\\\",\\\"top\\\":{\\\"complete_eligible_pool\\\":true,\\\"ranked\\\":[{\\\"key\\\":\\\"fixture-0\\\",\\\"topic\\\":\\\"fixture-0\\\",\\\"lane\\\":\\\"top\\\",\\\"fact\\\":\\\"A newly published decision adds a service.\\\",\\\"procedural_status\\\":\\\"adopted\\\",\\\"placement_reason\\\":\\\"A concrete decision readers can act on.\\\",\\\"event_timing\\\":\\\"completed\\\",\\\"sources\\\":[{\\\"url\\\":\\\"https://www.austintexas.gov/\\\",\\\"access\\\":\\\"read\\\",\\\"accessed_at\\\":\\\"2026-10-30T07:30:00-05:00\\\",\\\"published_at\\\":\\\"2026-10-29T15:00:00-05:00\\\",\\\"locator\\\":\\\"Page 2, decision paragraph\\\"}],\\\"gates\\\":{\\\"source\\\":true,\\\"fit\\\":true,\\\"repeat\\\":true,\\\"section\\\":true},\\\"history\\\":{\\\"key_checked\\\":true,\\\"topic_checked\\\":true,\\\"search_reason\\\":\\\"Searched aliases and prior service coverage in delivered history.\\\",\\\"material_update\\\":false,\\\"prior\\\":[]},\\\"scores\\\":[16,16,12,12,8,8,8],\\\"total\\\":80,\\\"score_reasons\\\":[\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\"]},{\\\"key\\\":\\\"fixture-1\\\",\\\"topic\\\":\\\"fixture-1\\\",\\\"lane\\\":\\\"top\\\",\\\"fact\\\":\\\"A newly published decision adds a service.\\\",\\\"procedural_status\\\":\\\"adopted\\\",\\\"placement_reason\\\":\\\"A concrete decision readers can act on.\\\",\\\"event_timing\\\":\\\"completed\\\",\\\"sources\\\":[{\\\"url\\\":\\\"https://www.kut.org/\\\",\\\"access\\\":\\\"read\\\",\\\"accessed_at\\\":\\\"2026-10-30T07:30:00-05:00\\\",\\\"published_at\\\":\\\"2026-10-29T15:00:00-05:00\\\",\\\"locator\\\":\\\"Page 2, decision paragraph\\\"}],\\\"gates\\\":{\\\"source\\\":true,\\\"fit\\\":true,\\\"repeat\\\":true,\\\"section\\\":true},\\\"history\\\":{\\\"key_checked\\\":true,\\\"topic_checked\\\":true,\\\"search_reason\\\":\\\"Searched aliases and prior service coverage in delivered history.\\\",\\\"material_update\\\":false,\\\"prior\\\":[]},\\\"scores\\\":[16,16,12,12,8,8,8],\\\"total\\\":80,\\\"score_reasons\\\":[\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\"]},{\\\"key\\\":\\\"fixture-2\\\",\\\"topic\\\":\\\"fixture-2\\\",\\\"lane\\\":\\\"top\\\",\\\"fact\\\":\\\"A newly published decision adds a service.\\\",\\\"procedural_status\\\":\\\"adopted\\\",\\\"placement_reason\\\":\\\"A concrete decision readers can act on.\\\",\\\"event_timing\\\":\\\"completed\\\",\\\"sources\\\":[{\\\"url\\\":\\\"https://www.traviscountytx.gov/\\\",\\\"access\\\":\\\"read\\\",\\\"accessed_at\\\":\\\"2026-10-30T07:30:00-05:00\\\",\\\"published_at\\\":\\\"2026-10-29T15:00:00-05:00\\\",\\\"locator\\\":\\\"Page 2, decision paragraph\\\"}],\\\"gates\\\":{\\\"source\\\":true,\\\"fit\\\":true,\\\"repeat\\\":true,\\\"section\\\":true},\\\"history\\\":{\\\"key_checked\\\":true,\\\"topic_checked\\\":true,\\\"search_reason\\\":\\\"Searched aliases and prior service coverage in delivered history.\\\",\\\"material_update\\\":false,\\\"prior\\\":[]},\\\"scores\\\":[16,16,12,12,8,8,8],\\\"total\\\":80,\\\"score_reasons\\\":[\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\"]}],\\\"slots\\\":3,\\\"capacity_reason\\\":\\\"Standard volume; only useful eligible items included.\\\",\\\"control_status\\\":\\\"none\\\",\\\"decisions\\\":[]},\\\"mfy\\\":{\\\"complete_eligible_pool\\\":true,\\\"ranked\\\":[{\\\"key\\\":\\\"fixture-3\\\",\\\"topic\\\":\\\"fixture-3\\\",\\\"lane\\\":\\\"mfy\\\",\\\"fact\\\":\\\"A newly published decision adds a service.\\\",\\\"procedural_status\\\":\\\"adopted\\\",\\\"placement_reason\\\":\\\"A concrete decision readers can act on.\\\",\\\"event_timing\\\":\\\"completed\\\",\\\"sources\\\":[{\\\"url\\\":\\\"https://news.utexas.edu/\\\",\\\"access\\\":\\\"read\\\",\\\"accessed_at\\\":\\\"2026-10-30T07:30:00-05:00\\\",\\\"published_at\\\":\\\"2026-10-29T15:00:00-05:00\\\",\\\"locator\\\":\\\"Page 2, decision paragraph\\\"}],\\\"gates\\\":{\\\"source\\\":true,\\\"fit\\\":true,\\\"repeat\\\":true,\\\"section\\\":true},\\\"history\\\":{\\\"key_checked\\\":true,\\\"topic_checked\\\":true,\\\"search_reason\\\":\\\"Searched aliases and prior service coverage in delivered history.\\\",\\\"material_update\\\":false,\\\"prior\\\":[]},\\\"scores\\\":[20,22,16,8,8,6],\\\"total\\\":80,\\\"score_reasons\\\":[\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\"],\\\"fit\\\":{\\\"interest_id\\\":\\\"TEST_INTEREST\\\",\\\"saved_preference\\\":\\\"Normal\\\",\\\"match\\\":\\\"direct_normal\\\",\\\"source_feature\\\":\\\"A usable service guide with concrete instructions.\\\",\\\"reader_payoff\\\":\\\"Readers can use the service immediately.\\\",\\\"catalog_scope\\\":\\\"Synthetic enabled interest scope.\\\",\\\"off_topic_relabel\\\":false}}],\\\"slots\\\":1,\\\"capacity_reason\\\":\\\"Standard volume; only useful eligible items included.\\\",\\\"control_status\\\":\\\"none\\\",\\\"decisions\\\":[]},\\\"rejected\\\":[],\\\"utr_search\\\":{\\\"independent\\\":true,\\\"outcome\\\":\\\"none_qualified\\\",\\\"reason\\\":\\\"Synthetic search found no consequential overlooked development.\\\",\\\"checks\\\":[{\\\"query_or_path\\\":\\\"Synthetic agenda review\\\",\\\"finding\\\":\\\"Only procedural approvals in this fixture.\\\",\\\"source\\\":{\\\"url\\\":\\\"https://example.org/record\\\",\\\"access\\\":\\\"read\\\",\\\"accessed_at\\\":\\\"2026-10-30T07:30:00-05:00\\\",\\\"published_at\\\":\\\"2026-10-29T15:00:00-05:00\\\",\\\"locator\\\":\\\"Page 2, decision paragraph\\\"}}]}}}\"},{\"profile_id\":\"SYNTHETIC\",\"section\":\"Top Story\",\"key\":\"fixture-1\",\"material_update\":false,\"source_url\":\"https://www.kut.org/\",\"notes\":\"ADB-SELECTION-NOTE-1 {\\\"schema\\\":\\\"ADB-SELECTION-NOTE-1\\\",\\\"production_spec\\\":\\\"ADB-DAILY-PROD-2.0\\\",\\\"selection_spec\\\":\\\"ADB-V2-SELECT-1.0\\\",\\\"run_id\\\":\\\"2026-10-30-publisher-v1\\\",\\\"cutoff\\\":\\\"2026-10-30T08:00:00-05:00\\\",\\\"candidate\\\":{\\\"key\\\":\\\"fixture-1\\\",\\\"topic\\\":\\\"fixture-1\\\",\\\"lane\\\":\\\"top\\\",\\\"fact\\\":\\\"A newly published decision adds a service.\\\",\\\"procedural_status\\\":\\\"adopted\\\",\\\"placement_reason\\\":\\\"A concrete decision readers can act on.\\\",\\\"event_timing\\\":\\\"completed\\\",\\\"sources\\\":[{\\\"url\\\":\\\"https://www.kut.org/\\\",\\\"access\\\":\\\"read\\\",\\\"accessed_at\\\":\\\"2026-10-30T07:30:00-05:00\\\",\\\"published_at\\\":\\\"2026-10-29T15:00:00-05:00\\\",\\\"locator\\\":\\\"Page 2, decision paragraph\\\"}],\\\"gates\\\":{\\\"source\\\":true,\\\"fit\\\":true,\\\"repeat\\\":true,\\\"section\\\":true},\\\"history\\\":{\\\"key_checked\\\":true,\\\"topic_checked\\\":true,\\\"search_reason\\\":\\\"Searched aliases and prior service coverage in delivered history.\\\",\\\"material_update\\\":false,\\\"prior\\\":[]},\\\"scores\\\":[16,16,12,12,8,8,8],\\\"total\\\":80,\\\"score_reasons\\\":[\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\"]}}\"},{\"profile_id\":\"SYNTHETIC\",\"section\":\"Top Story\",\"key\":\"fixture-2\",\"material_update\":false,\"source_url\":\"https://www.traviscountytx.gov/\",\"notes\":\"ADB-SELECTION-NOTE-1 {\\\"schema\\\":\\\"ADB-SELECTION-NOTE-1\\\",\\\"production_spec\\\":\\\"ADB-DAILY-PROD-2.0\\\",\\\"selection_spec\\\":\\\"ADB-V2-SELECT-1.0\\\",\\\"run_id\\\":\\\"2026-10-30-publisher-v1\\\",\\\"cutoff\\\":\\\"2026-10-30T08:00:00-05:00\\\",\\\"candidate\\\":{\\\"key\\\":\\\"fixture-2\\\",\\\"topic\\\":\\\"fixture-2\\\",\\\"lane\\\":\\\"top\\\",\\\"fact\\\":\\\"A newly published decision adds a service.\\\",\\\"procedural_status\\\":\\\"adopted\\\",\\\"placement_reason\\\":\\\"A concrete decision readers can act on.\\\",\\\"event_timing\\\":\\\"completed\\\",\\\"sources\\\":[{\\\"url\\\":\\\"https://www.traviscountytx.gov/\\\",\\\"access\\\":\\\"read\\\",\\\"accessed_at\\\":\\\"2026-10-30T07:30:00-05:00\\\",\\\"published_at\\\":\\\"2026-10-29T15:00:00-05:00\\\",\\\"locator\\\":\\\"Page 2, decision paragraph\\\"}],\\\"gates\\\":{\\\"source\\\":true,\\\"fit\\\":true,\\\"repeat\\\":true,\\\"section\\\":true},\\\"history\\\":{\\\"key_checked\\\":true,\\\"topic_checked\\\":true,\\\"search_reason\\\":\\\"Searched aliases and prior service coverage in delivered history.\\\",\\\"material_update\\\":false,\\\"prior\\\":[]},\\\"scores\\\":[16,16,12,12,8,8,8],\\\"total\\\":80,\\\"score_reasons\\\":[\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\"]}}\"},{\"profile_id\":\"SYNTHETIC\",\"section\":\"More for You\",\"key\":\"fixture-3\",\"material_update\":false,\"source_url\":\"https://news.utexas.edu/\",\"notes\":\"ADB-SELECTION-NOTE-1 {\\\"schema\\\":\\\"ADB-SELECTION-NOTE-1\\\",\\\"production_spec\\\":\\\"ADB-DAILY-PROD-2.0\\\",\\\"selection_spec\\\":\\\"ADB-V2-SELECT-1.0\\\",\\\"run_id\\\":\\\"2026-10-30-publisher-v1\\\",\\\"cutoff\\\":\\\"2026-10-30T08:00:00-05:00\\\",\\\"candidate\\\":{\\\"key\\\":\\\"fixture-3\\\",\\\"topic\\\":\\\"fixture-3\\\",\\\"lane\\\":\\\"mfy\\\",\\\"fact\\\":\\\"A newly published decision adds a service.\\\",\\\"procedural_status\\\":\\\"adopted\\\",\\\"placement_reason\\\":\\\"A concrete decision readers can act on.\\\",\\\"event_timing\\\":\\\"completed\\\",\\\"sources\\\":[{\\\"url\\\":\\\"https://news.utexas.edu/\\\",\\\"access\\\":\\\"read\\\",\\\"accessed_at\\\":\\\"2026-10-30T07:30:00-05:00\\\",\\\"published_at\\\":\\\"2026-10-29T15:00:00-05:00\\\",\\\"locator\\\":\\\"Page 2, decision paragraph\\\"}],\\\"gates\\\":{\\\"source\\\":true,\\\"fit\\\":true,\\\"repeat\\\":true,\\\"section\\\":true},\\\"history\\\":{\\\"key_checked\\\":true,\\\"topic_checked\\\":true,\\\"search_reason\\\":\\\"Searched aliases and prior service coverage in delivered history.\\\",\\\"material_update\\\":false,\\\"prior\\\":[]},\\\"scores\\\":[20,22,16,8,8,6],\\\"total\\\":80,\\\"score_reasons\\\":[\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\"],\\\"fit\\\":{\\\"interest_id\\\":\\\"TEST_INTEREST\\\",\\\"saved_preference\\\":\\\"Normal\\\",\\\"match\\\":\\\"direct_normal\\\",\\\"source_feature\\\":\\\"A usable service guide with concrete instructions.\\\",\\\"reader_payoff\\\":\\\"Readers can use the service immediately.\\\",\\\"catalog_scope\\\":\\\"Synthetic enabled interest scope.\\\",\\\"off_topic_relabel\\\":false}}}\"},{\"profile_id\":\"SYNTHETIC\",\"section\":\"Austin Ahead\",\"key\":\"fixture-4\",\"material_update\":false,\"source_url\":\"https://www.austintexas.gov/\",\"notes\":\"ADB-SELECTION-NOTE-1 {\\\"schema\\\":\\\"ADB-SELECTION-NOTE-1\\\",\\\"production_spec\\\":\\\"ADB-DAILY-PROD-2.0\\\",\\\"selection_spec\\\":\\\"ADB-V2-SELECT-1.0\\\",\\\"run_id\\\":\\\"2026-10-30-publisher-v1\\\",\\\"cutoff\\\":\\\"2026-10-30T08:00:00-05:00\\\",\\\"candidate\\\":{\\\"key\\\":\\\"fixture-4\\\",\\\"topic\\\":\\\"fixture-4\\\",\\\"lane\\\":\\\"utility\\\",\\\"fact\\\":\\\"A newly published decision adds a service.\\\",\\\"procedural_status\\\":\\\"adopted\\\",\\\"placement_reason\\\":\\\"A concrete decision readers can act on.\\\",\\\"event_timing\\\":\\\"completed\\\",\\\"sources\\\":[{\\\"url\\\":\\\"https://www.austintexas.gov/\\\",\\\"access\\\":\\\"read\\\",\\\"accessed_at\\\":\\\"2026-10-30T07:30:00-05:00\\\",\\\"published_at\\\":\\\"2026-10-29T15:00:00-05:00\\\",\\\"locator\\\":\\\"Page 2, decision paragraph\\\"}],\\\"gates\\\":{\\\"source\\\":true,\\\"fit\\\":true,\\\"repeat\\\":true,\\\"section\\\":true},\\\"history\\\":{\\\"key_checked\\\":true,\\\"topic_checked\\\":true,\\\"search_reason\\\":\\\"Searched aliases and prior service coverage in delivered history.\\\",\\\"material_update\\\":false,\\\"prior\\\":[]},\\\"scores\\\":null,\\\"total\\\":null,\\\"score_reasons\\\":[\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\"]}}\"},{\"profile_id\":\"SYNTHETIC\",\"section\":\"Austin Ahead\",\"key\":\"fixture-5\",\"material_update\":false,\"source_url\":\"https://www.austintexas.gov/council/meetings\",\"notes\":\"ADB-SELECTION-NOTE-1 {\\\"schema\\\":\\\"ADB-SELECTION-NOTE-1\\\",\\\"production_spec\\\":\\\"ADB-DAILY-PROD-2.0\\\",\\\"selection_spec\\\":\\\"ADB-V2-SELECT-1.0\\\",\\\"run_id\\\":\\\"2026-10-30-publisher-v1\\\",\\\"cutoff\\\":\\\"2026-10-30T08:00:00-05:00\\\",\\\"candidate\\\":{\\\"key\\\":\\\"fixture-5\\\",\\\"topic\\\":\\\"fixture-5\\\",\\\"lane\\\":\\\"utility\\\",\\\"fact\\\":\\\"A newly published decision adds a service.\\\",\\\"procedural_status\\\":\\\"adopted\\\",\\\"placement_reason\\\":\\\"A concrete decision readers can act on.\\\",\\\"event_timing\\\":\\\"completed\\\",\\\"sources\\\":[{\\\"url\\\":\\\"https://www.austintexas.gov/council/meetings\\\",\\\"access\\\":\\\"read\\\",\\\"accessed_at\\\":\\\"2026-10-30T07:30:00-05:00\\\",\\\"published_at\\\":\\\"2026-10-29T15:00:00-05:00\\\",\\\"locator\\\":\\\"Page 2, decision paragraph\\\"}],\\\"gates\\\":{\\\"source\\\":true,\\\"fit\\\":true,\\\"repeat\\\":true,\\\"section\\\":true},\\\"history\\\":{\\\"key_checked\\\":true,\\\"topic_checked\\\":true,\\\"search_reason\\\":\\\"Searched aliases and prior service coverage in delivered history.\\\",\\\"material_update\\\":false,\\\"prior\\\":[]},\\\"scores\\\":null,\\\"total\\\":null,\\\"score_reasons\\\":[\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\",\\\"The source establishes a specific benefit for this component.\\\"]}}\"}]}}";
