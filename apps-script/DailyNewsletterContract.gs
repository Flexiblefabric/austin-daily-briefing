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
  const report = {
    contract: result.contract,
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
