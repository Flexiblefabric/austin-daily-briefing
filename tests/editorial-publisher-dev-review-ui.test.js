'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
// Browser check is optional in CI unless the host supplies Playwright/Chromium.
let chromium;try{({chromium}=require('playwright'));}catch{}
const executable=process.env.ADB_TEST_CHROMIUM||'/usr/bin/chromium';
test('review browser requires an explicit check/click; stale errors clear approval; preview is sandboxed', {skip:process.env.ADB_RUN_BROWSER_TESTS!=='1'||!chromium||!fs.existsSync(executable)},async()=>{
 const browser=await chromium.launch({executablePath:executable,headless:true,args:['--no-sandbox']});
 try {
  const c=vm.createContext({Intl});vm.runInContext(fs.readFileSync('scripts/daily_newsletter_renderer.js','utf8'),c);
  const pkg=JSON.parse(cp.execFileSync('python',['tests/publisher-fixture.py'],{encoding:'utf8'}));
  const review={ticket:{schema:'ADB-DEV-REVIEW-1',packageId:'REVIEW',editionDate:pkg.edition_date,sourceRevision:pkg.source_revision,packageDigest:'a'.repeat(64),snapshotDigest:'b'.repeat(64),previewDigest:'c'.repeat(64)},profiles:1,historyRows:6,
   snapshot:{cutoff:pkg.selection_bundle.cutoff,history_window_start:pkg.selection_bundle.history_window_start},selectionEvidence:pkg.selection_bundle,
   previews:[{profileId:'SYNTHETIC',rendered:JSON.parse(JSON.stringify(c.adbRenderDailyNewsletter(pkg.editions[0].editorial)))}]};
  review.previews[0].rendered.html+='<script>parent.window.previewExecuted=true</script><img src="https://tracking.invalid/pixel">';
  const page=await browser.newPage({viewport:{width:1100,height:900}});let requests=0;await page.route('**/*',route=>{requests++;return route.abort();});
  await page.addInitScript(()=>{});
  await page.setContent(fs.readFileSync('apps-script/EditorialPublisherDevReview.html','utf8'));
  await page.evaluate(data=>{
    window.mock={loads:0,seals:0,nextError:false,ticket:null};
    window.google={script:{get run(){const chain={withFailureHandler(fn){this.failure=fn;return this;},withSuccessHandler(fn){this.success=fn;return this;},adbDevReviewLoadV1(id){mock.loads++;setTimeout(()=>this.success(data),0);},adbDevReviewSealV1(ticket){mock.seals++;mock.ticket=ticket;setTimeout(()=>mock.nextError?this.failure({message:'review expired'}):this.success({result:'SEALED',digest:ticket.packageDigest}),0);}};return chain;}}};
  },review);
  assert.equal(await page.locator('#seal').isDisabled(),true);
  await page.fill('#package','REVIEW');await page.click('#load');await page.waitForFunction(()=>document.getElementById('review').hidden===false);
  assert.equal(await page.locator('#seal').isDisabled(),true);assert.equal(await page.evaluate(()=>mock.seals),0);
  assert.equal(await page.locator('#preview').getAttribute('sandbox'),'');assert.equal(await page.evaluate(()=>window.previewExecuted),undefined);assert.equal(requests,0);
  await page.locator('#checked').check();assert.equal(await page.locator('#seal').isEnabled(),true);
  await page.screenshot({path:'/tmp/adb-dev-review-desktop.png',fullPage:true});
  await page.click('#seal');await page.waitForFunction(()=>document.getElementById('status').textContent.includes('sealed successfully'));
  assert.equal(await page.evaluate(()=>mock.seals),1);assert.deepEqual(await page.evaluate(()=>mock.ticket),review.ticket);assert.equal(await page.locator('#review').isHidden(),true);
  await page.click('#load');await page.waitForFunction(()=>!document.getElementById('review').hidden);await page.locator('#checked').check();
  await page.evaluate(()=>mock.nextError=true);await page.click('#seal');await page.waitForFunction(()=>document.getElementById('status').textContent.includes('review expired'));
  assert.equal(await page.locator('#checked').isChecked(),false);assert.equal(await page.locator('#seal').isDisabled(),true);assert.equal(await page.locator('#review').isHidden(),true);
  await page.evaluate(()=>mock.nextError=false);await page.click('#load');await page.waitForFunction(()=>!document.getElementById('review').hidden);
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/adb-dev-review-mobile.png',fullPage:true});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 } finally {await browser.close();}
});


test('review UI handlers bind the exact ticket, clear stale approval and expose no publication control',()=>{
 const html=fs.readFileSync('apps-script/EditorialPublisherDevReview.html','utf8');
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1],elements=new Map();
 function el(id){if(!elements.has(id))elements.set(id,{value:'',hidden:true,disabled:false,checked:false,textContent:'',srcdoc:'',handlers:{},children:[],addEventListener(name,fn){this.handlers[name]=fn;},replaceChildren(){this.children=[];},appendChild(v){this.children.push(v);if(this.value==='')this.value=v.value;}});return elements.get(id);}
 const callbacks=[],calls=[];
 const run={withFailureHandler(fn){this.failure=fn;return this;},withSuccessHandler(fn){this.success=fn;return this;},adbDevReviewLoadV1(id){calls.push(['load',id]);callbacks.push({success:this.success,failure:this.failure});},adbDevReviewSealV1(ticket){calls.push(['seal',ticket]);callbacks.push({success:this.success,failure:this.failure});}};
 const c=vm.createContext({document:{getElementById:el,createElement:()=>({})},google:{script:{run}}});vm.runInContext(script,c);
 el('package').value='REVIEW';el('load').handlers.click();assert.deepEqual(calls,[['load','REVIEW']]);assert.equal(el('seal').disabled,true);
 const ticket={packageId:'REVIEW',editionDate:'2026-10-30',sourceRevision:'a'.repeat(40),packageDigest:'b'.repeat(64)};
 callbacks.shift().success({ticket,profiles:1,previews:[{profileId:'SYNTHETIC',rendered:{html:'<h1>Preview</h1>',text:'Preview'}}],snapshot:{cutoff:'2026-10-30T08:00:00-05:00',history_window_start:'2026-10-16'},selectionEvidence:{rows:[]}});
 assert.equal(el('review').hidden,false);assert.equal(el('seal').disabled,true);assert.equal(calls.length,1);
 el('checked').checked=true;el('checked').handlers.change();assert.equal(el('seal').disabled,false);
 el('seal').handlers.click();el('seal').handlers.click();assert.equal(calls.length,2);assert.equal(calls[1][1],ticket);
 callbacks.shift().failure({message:'review expired'});assert.equal(el('checked').checked,false);assert.equal(el('review').hidden,true);assert.equal(el('seal').disabled,true);assert(el('status').textContent.includes('review expired'));
 assert(html.includes('sandbox=""'));assert(html.includes("img-src data:"));assert(!/adbDev.*Publish|publishReadyEditorial/.test(html));
 assert(!script.includes('.innerHTML'));assert(!script.includes('eval('));
});
