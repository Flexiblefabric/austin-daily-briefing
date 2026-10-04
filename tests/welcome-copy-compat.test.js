const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('apps-script/ResendTransport.gs', 'utf8');

assert(source.includes("'YOUR SETTINGS\\n\\n' +"));
assert(source.includes(">YOUR SETTINGS</div>' +"));
assert(source.includes("Personalized sections use the interests and reading settings saved to your profile."));
assert(source.includes("If you’re new, your interests start at Normal with standard reading settings."));
assert(!source.includes("YOUR STARTING SETTINGS"));
assert(!source.includes("subscribers begin with all interest categories set to Normal"));

const plainMatches = (source.match(/Personalized sections use the interests and reading settings saved to your profile\./g) || []).length;
assert.strictEqual(plainMatches, 2, 'Welcome compatibility copy should appear once in plain text and once in HTML.');

console.log('Welcome copy compatibility QA passed.');
