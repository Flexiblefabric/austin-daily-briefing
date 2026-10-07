const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const endpoint = fs.readFileSync('apps-script/NativeManagementDev.gs','utf8');
const processor = fs.readFileSync('apps-script/NativeManagementDevProcessor.gs','utf8');
const browser = fs.readFileSync('site/manage.js','utf8');
const html = fs.readFileSync('site/manage.html','utf8');
const config = fs.readFileSync('site/manage-config.js','utf8');
const confirmHtml = fs.readFileSync('site/manage-confirm.html','utf8');
const confirmConfig = fs.readFileSync('site/manage-confirm-config.js','utf8');
const confirmBrowser = fs.readFileSync('site/manage-confirm.js','utf8');
const design = fs.readFileSync('docs/native-management-design.md','utf8');
const css = fs.readFileSync('site/styles.css','utf8');

function digestBytes(value) {
  const crypto = require('crypto');
  return Array.from(crypto.createHash('sha256').update(String(value),'utf8').digest())
    .map(x => x > 127 ? x - 256 : x);
}

function context() {
  const ctx = {
    console,
    Utilities:{
      DigestAlgorithm:{SHA_256:'SHA_256'},
      Charset:{UTF_8:'UTF_8'},
      computeDigest:(_alg,value)=>digestBytes(value),
      getUuid:()=> '00000000-0000-4000-8000-000000000000',
      base64EncodeWebSafe:(bytes)=>Buffer.from(bytes.map(x=>x<0?x+256:x)).toString('base64url')
    }
  };
  vm.createContext(ctx);
  vm.runInContext(endpoint + '\n' + processor,ctx);
  return ctx;
}

(function staticBoundaryChecks(){
  assert(endpoint.includes("DEV_INTAKE_ID: '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw'"));
  assert(endpoint.includes("DEV_DATABASE_ID: '1rl5GTOvuBSHyFK1r9CqI_6Z5gAwtgsTQnQQf9VCMeyM'"));
  assert(endpoint.includes('FORM-9 DEV boundary collided with production.'));
  assert(endpoint.includes("REQUEST_SHEET: 'Native Manage Requests'"));
  assert(endpoint.includes("VERIFICATION_SHEET: 'Native Manage Verification Queue'"));
  assert(endpoint.includes("DIAGNOSTIC_SHEET: 'Native Manage Diagnostics'"));
  assert(endpoint.includes("BUILD_ID: 'native-management-dev-v0.1'"));
  assert(!endpoint.includes('SpreadsheetApp.openById(ADB_NATIVE_MANAGE_DEV.PROD_INTAKE_ID)'));
  assert(!endpoint.includes('SpreadsheetApp.openById(ADB_NATIVE_MANAGE_DEV.PROD_DATABASE_ID)'));
})();

(function browserGuardrails(){
  assert(html.includes('<meta name="robots" content="noindex, nofollow">'));
  assert(html.includes('name="delivery_action" value="keep_current"'));
  assert(html.includes('name="delivery_action" value="pause"'));
  assert(html.includes('name="delivery_action" value="resume"'));
  assert(html.includes('name="delivery_action" value="unsubscribe"'));
  assert(html.includes('name="reset_topics"'));
  assert(config.includes("environment: 'development'"));
  assert(config.includes("https://script.google.com/macros/s/AKfycbzENgETifuF_AXbYEfgwb5oWjjsyvDRByWWaATxmfopXbObgF6_KeiTBVHBlJiHytUO/exec"));
  assert(browser.includes("data.type !== expectedResultType"));
  assert(browser.includes("Choose a delivery change, a topic reset, or both."));
  assert(confirmHtml.includes('<meta name="robots" content="noindex, nofollow">'));
  assert(confirmHtml.includes('name="token"'));
  assert(confirmConfig.includes("defaultEnvironment: 'development'"));
  assert(confirmConfig.includes("https://script.google.com/macros/s/AKfycbzENgETifuF_AXbYEfgwb5oWjjsyvDRByWWaATxmfopXbObgF6_KeiTBVHBlJiHytUO/exec"));
  assert(confirmBrowser.includes("window.location.hash"));
  assert(confirmBrowser.includes("params.get('result')"));
  assert(confirmBrowser.includes("form.submit()"));
  assert(confirmBrowser.includes("button.hidden = true"));
  assert(css.includes('#manage-confirm-button[hidden]{display:none!important}'));

  assert(endpoint.includes("CONFIRM_PAGE_URL_PROPERTY: 'ADB_NATIVE_MANAGE_DEV_CONFIRM_PAGE_URL'"));
  assert(endpoint.includes("https://austindailybriefing.com/manage-confirm.html"));
  assert(endpoint.includes("'#env=development&token='"));
  assert(!endpoint.includes("?action=confirm&token="));
  assert(endpoint.includes("function adbManageConfirmRedirectHtml_"));
  assert(endpoint.includes("/manage-confirm.html#result="));
  assert(!endpoint.includes("adb-native-manage-confirm-dev"));
})();

(function payloadValidation(){
  const ctx=context();
  let r=ctx.adbManagePayloadFromParams_({delivery_action:'pause',reset_topics:''});
  assert.strictEqual(r.ok,true);
  assert.strictEqual(r.deliveryAction,'pause');
  assert.strictEqual(r.resetTopics,false);

  r=ctx.adbManagePayloadFromParams_({delivery_action:'keep_current',reset_topics:'yes'});
  assert.strictEqual(r.ok,true);
  assert.strictEqual(r.resetTopics,true);

  r=ctx.adbManagePayloadFromParams_({delivery_action:'keep_current',reset_topics:''});
  assert.strictEqual(r.ok,false);
  assert.strictEqual(r.code,'no_changes');

  r=ctx.adbManagePayloadFromParams_({delivery_action:'activate',reset_topics:''});
  assert.strictEqual(r.ok,false);
  assert.strictEqual(r.code,'invalid_delivery_action');
})();

(function payloadBindingIsStable(){
  const ctx=context();
  const a=ctx.adbManagePayloadFromParams_({delivery_action:'resume',reset_topics:'yes'});
  const b=ctx.adbManagePayloadFromStoredRequest_({
    'Delivery Action':'resume',
    'Reset Topics':'TRUE'
  });
  assert.strictEqual(a.hash,b.hash);
  assert.strictEqual(a.canonical,'{"delivery_action":"resume","reset_topics":true}');
})();

(function emailValidation(){
  const ctx=context();
  assert.strictEqual(ctx.adbManageValidEmail_('USER@example.com'),true);
  assert.strictEqual(ctx.adbManageNormalizeEmail_(' USER@example.com '),'user@example.com');
  assert.strictEqual(ctx.adbManageValidEmail_('bad address@example.com'),false);
  assert.strictEqual(ctx.adbManageValidEmail_('missing-domain@localhost'),false);
})();

(function statusMatrix(){
  const ctx=context();
  const f=ctx.adbManageResolveStatus_;
  assert.strictEqual(f('Active','pause'),'Paused');
  assert.strictEqual(f('Paused','resume'),'Active');
  assert.strictEqual(f('Active','unsubscribe'),'Unsubscribed');
  assert.strictEqual(f('Paused','unsubscribe'),'Unsubscribed');
  assert.strictEqual(f('Admin Hold','pause'),'Admin Hold');
  assert.strictEqual(f('Admin Hold','resume'),'Admin Hold');
  assert.strictEqual(f('Admin Hold','unsubscribe'),'Unsubscribed');
  assert.strictEqual(f('Unsubscribed','resume'),'Unsubscribed');
  assert.strictEqual(f('Unsubscribed','pause'),'Unsubscribed');
  assert.strictEqual(f('Active','keep_current'),'Active');
})();

(function actionLabels(){
  const ctx=context();
  assert.strictEqual(ctx.adbManageActionLabel_('pause',false),'Pause subscription');
  assert.strictEqual(ctx.adbManageActionLabel_('resume',true),'Resume subscription + Reset preferences to Normal');
  assert.strictEqual(ctx.adbManageActionLabel_('keep_current',true),'Reset preferences to Normal');
})();

(function designContract(){
  assert(design.includes('Unsubscribed + resume remains Unsubscribed'));
  assert(design.includes('Admin Hold + unsubscribe becomes Unsubscribed'));
  assert(design.includes('32 random token bytes'));
  assert(design.includes('manage-confirm.html'));
  assert(design.includes('URL fragment'));
  assert(design.includes('Native Manage Verification Queue'));
  assert(design.includes('Production non-goals during DEV'));
})();

console.log('FORM-9 native management Gate A/B unit QA passed.');
