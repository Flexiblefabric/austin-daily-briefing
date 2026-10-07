const assert = require('assert');
const fs = require('fs');

const prod = fs.readFileSync('apps-script/NativeSignupProd.gs', 'utf8');
const resend = fs.readFileSync('apps-script/ResendTransport.gs', 'utf8');

assert(prod.includes("BUILD: 'native-signup-prod-stage-v1.1'"));
assert(prod.includes('function getNativeSignupProdRuntimeStatusV1()'));
assert(prod.includes('integrationNativeSignupMode'));
assert(prod.includes('integrationControlledEmailConfigured'));
assert(prod.includes('allowlistConfigured'));
assert(prod.includes('sharedProcessorMode'));
assert(prod.includes('function runGateDDeploymentSafetyRequestV1()'));
assert(prod.includes('function logNativeSignupProdRuntimeStatusV1()'));
assert(prod.includes("cfg['Native Signup Production Web App URL']"));
assert(prod.includes('UrlFetchApp.fetch(endpoint'));

assert(resend.includes("BUILD: 'resend-transport-native-customize-v1'"));
assert(resend.includes('function getAdbResendRuntimeStatusV1()'));
assert(resend.includes("welcomeCopy: 'state-neutral-v1'"));
assert(resend.includes("SUPPORTED_INTAKE_MODES: Object.freeze(['GOOGLE ONLY', 'GOOGLE + NATIVE CONTROLLED', 'GOOGLE + NATIVE'])"));

console.log('FORM-7 Gate D runtime fingerprint QA passed.');
