const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('apps-script/ResendTransport.gs','utf8');
const begin = source.indexOf('function adbResendRequireAdminStatusHeader_(');
const end = source.indexOf('function getAdbResendRuntimeStatusV1(', begin);
assert(begin >= 0 && end > begin, 'Admin Status delivery helper block missing.');
const context = {};
vm.createContext(context);
vm.runInContext(source.slice(begin,end), context);

const healthyProfile = {'Profile ID':'P101',Status:'Active','Primary Preference Email':'person@example.com'};
const profiles = {P101:[healthyProfile]};
const baseline = {Email:'PERSON@example.com',Status:'Active','Profile ID':'P101','Admin Status':'OK'};
assert.strictEqual(context.adbResendSubscriberEligible_(baseline,profiles),true);
for (const state of ['Hold','Review','','UNKNOWN',undefined]) {
  assert.strictEqual(context.adbResendSubscriberEligible_(Object.assign({},baseline,{'Admin Status':state}),profiles),false,'Admin status must fail closed: '+state);
}
for (const state of ['Paused','Unsubscribed','Admin Hold','ACTIVE','']) {
  assert.strictEqual(context.adbResendSubscriberEligible_(Object.assign({},baseline,{Status:state}),profiles),false,'Delivery status must fail closed: '+state);
}
assert.strictEqual(context.adbResendSubscriberEligible_(baseline,{}),false,'Missing profile blocked.');
assert.strictEqual(context.adbResendSubscriberEligible_(baseline,{P101:[healthyProfile,healthyProfile]}),false,'Ambiguous profile blocked.');
assert.strictEqual(context.adbResendSubscriberEligible_(baseline,{P101:[Object.assign({},healthyProfile,{Status:'Paused'})]}),false,'Inactive profile blocked.');
assert.strictEqual(context.adbResendSubscriberEligible_(baseline,{P101:[Object.assign({},healthyProfile,{'Primary Preference Email':'different@example.com'})]}),false,'Mismatched profile email blocked.');
assert.doesNotThrow(()=>context.adbResendRequireAdminStatusHeader_(['Email','Status','Admin Status']));
assert.throws(()=>context.adbResendRequireAdminStatusHeader_(['Email','Status']),/Admin Status/);

for (const method of ['dispatchQueuedWelcomeMessagesViaResendV1','sendApprovedSenderChangeNoticeV1','dispatchQueuedDailyBriefingsViaResendV1']) {
  // Calls must exist in every delivery path, not just in the shared helper.
  const match = source.includes('function '+method+'(') || source.includes(method+'(');
  assert(match, 'Expected delivery function: '+method);
}
const guardCalls = (source.match(/adbResendSubscriberEligible_\(row, profilesById\)/g)||[]).length;
assert(guardCalls >= 2, 'Daily and sender-change paths must use Admin Status gate.');
assert(source.includes('!adbResendSubscriberEligible_(match.row, profilesById)'), 'Welcome path must gate Admin Status.');
assert((source.match(/adbResendRequireAdminStatusHeader_\(subscribers.headers\)/g)||[]).length >= 3,'All three delivery paths must require schema.');
console.log('Resend Admin Status compatibility tests passed.');
