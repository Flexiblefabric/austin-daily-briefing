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
assert(source.includes('deliveryInvoked: false'));
assert(source.includes('writes: false'));

const nativeCustomizeUrl = 'https://austindailybriefing.com/customize.html';
const legacyCustomizeUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScwQiC37TuOgRqXpCsfcC9jTOL4Gg7d9KOUrYhRkwdfNGhhuQ/viewform';
const dailyPrompt = fs.readFileSync('docs/automation-prompts/austin-daily-briefing.md', 'utf8');
const emailQaAssets = [
  'design/newsletter-renderer-qa.html',
  'design/newsletter-renderer-qa.txt',
  'design/welcome-email-qa.html',
  'design/welcome-email-qa.txt'
].map(path => fs.readFileSync(path, 'utf8'));

assert(source.includes(`CUSTOMIZE_URL: '${nativeCustomizeUrl}'`), 'Resend transport must use the native Customize URL.');
assert(!source.includes(`CUSTOMIZE_URL: '${legacyCustomizeUrl}'`), 'Resend transport still points Customize to the legacy Google form.');
assert(source.includes(`const expectedCustomizeUrl = '${nativeCustomizeUrl}'`), 'Runtime compatibility check must pin the native Customize URL.');
assert(dailyPrompt.includes(`Reader-facing Customize destination: ${nativeCustomizeUrl}`), 'Daily prompt must declare the native reader-facing Customize destination.');
assert(dailyPrompt.includes('The fallback is not a normal reader-facing destination.'), 'Daily prompt must keep the Google form operator-only by default.');
assert(dailyPrompt.includes(`Set Customize URL exactly to ${nativeCustomizeUrl}.`), 'Daily queue rule must pin the native Customize URL.');
emailQaAssets.forEach((asset, index) => {
  assert(asset.includes(nativeCustomizeUrl), `Email QA asset ${index} is missing the native Customize URL.`);
  assert(!asset.includes(legacyCustomizeUrl), `Email QA asset ${index} still contains the legacy Customize URL.`);
});

console.log('Welcome copy compatibility QA passed.');
