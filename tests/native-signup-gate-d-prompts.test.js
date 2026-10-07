const assert = require('assert');
const fs = require('fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

const subops = read('docs/automation-prompts/production-subscriber-operations.md');
const completion = read('docs/end-to-end-completion-spec.md');
const reconcile = read('docs/automation-prompts/end-to-end-completion-reconcile.md');
const watchdog = read('docs/automation-prompts/production-health-watchdog.md');
const prodContract = read('docs/native-signup-production-processing.md');
const monitorContract = read('docs/native-signup-completion-monitoring.md');
const resend = read('apps-script/ResendTransport.gs');

assert(subops.includes('ADB-SUBOPS-PROD-1.1'));
assert(subops.includes('Native Signup Mode behavior:'));
assert(subops.includes('DISABLED: do not read or mutate Native Signup Requests / Native Signup Diagnostics.'));
assert(subops.includes('NATIVE:SIGNUP:<Response Key>'));
assert(subops.includes('WELCOME-NATIVE:<Response Key>'));
assert(subops.includes('admin_hold_noop'));
assert(subops.includes('A signup request must never clear or bypass an administrative hold'));
assert(subops.includes('Process Google Signup responses first, then eligible Native Signup requests'));

assert(prodContract.includes('ADB-NATIVE-SIGNUP-PROD-0.1'));
assert(prodContract.includes('Existing Admin Hold subscriber'));
assert(prodContract.includes('admin_hold_noop'));

assert(completion.includes('ADB-COMPLETION-0.2'));
assert(completion.includes('Native Signup Requests'));
assert(completion.includes('WELCOME-NATIVE:<Response Key>'));
assert(completion.includes('admin_hold_noop'));

assert(reconcile.includes('ADB-COMPLETION-RECON-0.2'));
assert(reconcile.includes('Native Signup Mode absent/blank/DISABLED means ignore Native Signup Requests entirely'));
assert(reconcile.includes('WELCOME-NATIVE:<Response Key>'));
assert(reconcile.includes('admin_hold_noop'));

assert(monitorContract.includes('ADB-NATIVE-SIGNUP-MONITOR-0.1'));
assert(monitorContract.includes('admin_hold_noop'));

assert(watchdog.includes('ADB-WATCHDOG-PROD-2.4'));
assert(watchdog.includes('DISABLED: do not read Native Signup Requests and preserve prior Google-only Signup Completion behavior exactly.'));
assert(watchdog.includes('ADB-COMPLETION-0.2'));
assert(watchdog.includes('ADB-COMPLETION-RECON-0.2'));
assert(watchdog.includes('ADB-NATIVE-SIGNUP-MONITOR-0.1'));
assert(watchdog.includes('WELCOME-NATIVE:<Response Key>'));
assert(watchdog.includes('admin_hold_noop'));
assert(watchdog.includes('only Unhealthy — intake incomplete is alert-enabled in ADB-WATCHDOG-PROD-2.4'));
assert(watchdog.includes('The promoted alert class is unchanged by FORM-7.'));

assert(resend.includes("SUPPORTED_INTAKE_MODES: Object.freeze(['GOOGLE ONLY', 'GOOGLE + NATIVE CONTROLLED', 'GOOGLE + NATIVE'])"));
assert(!subops.includes('GOOGLE + NATIVE SIGNUP'));
assert(!watchdog.includes('GOOGLE + NATIVE SIGNUP'));

console.log('FORM-7 Gate D prompt compatibility QA passed.');
