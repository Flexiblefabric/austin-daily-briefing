'use strict';
/* Pure JS deterministic newsletter integration, without Python or Node dependencies in renderer. */
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'scripts/daily_newsletter_renderer.js'),'utf8');
const contract=fs.readFileSync(path.join(root,'apps-script/DailyNewsletterContract.gs'),'utf8');
const fixture=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/daily-newsletter-example.json'),'utf8'));
function prepare(){
  const sandbox=vm.createContext({});
  vm.runInContext(code,sandbox,{timeout:1500});
  vm.runInContext(contract,sandbox,{timeout:1500});
  return {
    render:sandbox.adbRenderDailyNewsletter,
    validate:sandbox.adbValidateDailyNewsletterPayload_
  };
}
function clone(x){return JSON.parse(JSON.stringify(x));}
test('pure JavaScript renderer produces compliant HTML/text from production-shaped JSON',()=>{
  const {render,validate}=prepare();
  const out=render(fixture);
  const result=validate(out.html,out.text);
  assert.equal(result.contract,'ADB-DAILY-HTML-1.0');
  assert(result.destinations>=10);
  assert(out.html.indexOf('adb-masthead@2x.png')<out.html.indexOf('FEATURED TOP STORY'));
  assert(out.html.indexOf('FEATURED TOP STORY')<out.html.indexOf('TOP STORIES'));
  assert(!out.html.includes('CONTROLLED COMPONENT QA'));
});
test('same fixture has deterministic identical outputs on successive Code Mode calls',()=>{
  const {render}=prepare();
  const first=render(fixture),second=render(fixture);
  assert.deepEqual({...first},{...second});
});
test('optional discovery and personalization sections may be absent',()=>{
  const data=clone(fixture),{render,validate}=prepare();
  delete data.underTheRadar; data.moreForYou=[];
  const out=render(data);
  assert(!out.html.includes('>UNDER THE RADAR<'));
  assert(!out.html.includes('>MORE FOR YOU<'));
  validate(out.html,out.text);
});
test('missing every Austin Ahead candidate gives honest empty state',()=>{
  const data=clone(fixture),{render,validate}=prepare();
  data.austinAhead=[]; const out=render(data);
  assert(out.text.includes('No major Austin Ahead items'));
  validate(out.html,out.text);
});
test('html injection is escaped, plain text remains readable',()=>{
  const data=clone(fixture),{render,validate}=prepare();
  data.featured.headline='A test <script>alert("x")</script> & source';
  const out=render(data);
  assert(!out.html.includes('<script>alert'));
  assert(out.html.includes('&lt;script&gt;'));
  assert(out.text.includes('<script>alert'));
  validate(out.html,out.text);
});
test('one missing publisher source is an error',()=>{
  const data=clone(fixture),{render}=prepare();
  data.topStories[0].sources=[];
  assert.throws(()=>render(data),/requires named source URLs/);
});
test('correction appears after Pulse and before weather',()=>{
  const data=clone(fixture),{render,validate}=prepare();
  data.correction='A clearly marked correction to a previous publication.';
  const out=render(data);
  assert(out.html.indexOf('>AUSTIN PULSE<') < out.html.indexOf('>CORRECTION / CLARIFICATION<'));
  assert(out.html.indexOf('>CORRECTION / CLARIFICATION<') < out.html.indexOf('>WEATHER<'));
  validate(out.html,out.text);
});
test('sourced Friday recap can appear only on Friday',()=>{
  const data=clone(fixture),{render,validate}=prepare();
  data.fridayRecap=[{text:'What changed this week and why.',sources:[{publisher:'City of Austin',url:'https://www.austintexas.gov/'}]}];
  assert.throws(()=>render(data),/only Friday/);
  data.date='2026-10-16';
  const out=render(data);
  assert(out.html.includes('>THIS WEEK IN AUSTIN<'));
  validate(out.html,out.text);
});
test('non-HTTPS source URL and invalid event action fail',()=>{
  const data=clone(fixture),{render}=prepare();
  data.featured.sources[0].url='http://example.org';
  assert.throws(()=>render(data),/HTTPS URL/);
  data.featured.sources[0].url='https://www.austintexas.gov/';
  data.austinAhead[0].action='NOTIFY';
  assert.throws(()=>render(data),/GO, WATCH or PLAN/);
});
test('missing required editorial field is rejected, never rendered as null',()=>{
  const data=clone(fixture),{render}=prepare();
  data.featured.headline=null;
  assert.throws(()=>render(data),/Required nonempty text field: headline/);
});
test('rendered copy and URLs are checked by the exact installed Apps Script contract',()=>{
  const data=clone(fixture),{render,validate}=prepare();
  const out=render(data);
  validate(out.html,out.text);
  assert.throws(()=>validate(out.html,out.text.replace('https://www.kut.org/','https://wrong.example.org/')),/destination order mismatch/);
});
test('invalid date and oversized issue fail closed',()=>{
  const data=clone(fixture),{render}=prepare();
  data.date='2026-02-30';
  assert.throws(()=>render(data),/Invalid calendar date/);
  data.date='2026-10-14';
  data.featured.summary='Long '.repeat(15000);
  assert.throws(()=>render(data),/45000-character Sheets limit/);
});
