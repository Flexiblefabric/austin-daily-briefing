const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('apps-script/ResendTransport.gs', 'utf8');

assert(source.includes("'YOUR SETTINGS\\n\\n' +"));
assert(source.includes(">YOUR SETTINGS</div>' +"));
assert(source.includes("Personalized sections use the interests and reading settings saved to your profile."));
assert(source.includes("If you’re new, your interests start at Normal with standard reading settings."));
assert(!source.includes("YOUR STARTING SETTINGS"));
const obsoleteMatches = (source.match(/subscribers begin with all interest categories set to Normal/g) || []).length;
assert.strictEqual(obsoleteMatches, 1, 'Obsolete Welcome wording may appear only as the validator guard string.');
assert(source.includes('function validateForm7GateDTransportCompatibilityV1()'));
assert(source.includes("deliveryInvoked: false"));
assert(source.includes("writes: false"));

const plainMatches = (source.match(/Personalized sections use the interests and reading settings saved to your profile\./g) || []).length;
assert.strictEqual(plainMatches, 2, 'Welcome compatibility copy should appear once in plain text and once in HTML.');

console.log('Welcome copy compatibility QA passed.');
