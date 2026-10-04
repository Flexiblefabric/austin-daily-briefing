const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('apps-script/ResendTransport.gs', 'utf8');
const plainStart = source.indexOf('function adbWelcomePlainText_()');
const htmlStart = source.indexOf('function adbWelcomeHtml_()');

assert(plainStart >= 0, 'Plain-text Welcome renderer missing.');
assert(htmlStart > plainStart, 'HTML Welcome renderer missing or out of order.');

const plainSource = source.slice(plainStart, htmlStart);
const htmlSource = source.slice(htmlStart);

const requiredCopy = 'Personalized sections use the interests and reading settings saved to your profile.';
const newSubscriberCopy = 'If you’re new, your interests start at Normal with standard reading settings.';
const obsoleteCopy = 'subscribers begin with all interest categories set to Normal';

assert(plainSource.includes("'YOUR SETTINGS\\n\\n' +"));
assert(htmlSource.includes(">YOUR SETTINGS</div>' +"));
assert(plainSource.includes(requiredCopy));
assert(htmlSource.includes(requiredCopy));
assert(plainSource.includes(newSubscriberCopy));
assert(htmlSource.includes(newSubscriberCopy));
assert(!plainSource.includes('YOUR STARTING SETTINGS'));
assert(!htmlSource.includes('YOUR STARTING SETTINGS'));
assert(!plainSource.includes(obsoleteCopy));
assert(!htmlSource.includes(obsoleteCopy));

assert(source.includes('function validateForm7GateDTransportCompatibilityV1()'));
assert(source.includes("deliveryInvoked: false"));
assert(source.includes("writes: false"));

console.log('Welcome copy compatibility QA passed.');
