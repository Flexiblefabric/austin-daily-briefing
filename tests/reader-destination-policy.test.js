const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const transport = fs.readFileSync('apps-script/ResendTransport.gs', 'utf8');

const URLS = Object.freeze({
  SIGNUP_NATIVE: 'https://austindailybriefing.com/signup.html',
  SIGNUP_FORM: 'https://docs.google.com/forms/d/e/1FAIpQLSfoDFw2mnESsjLPCJkBBhmSnxSl0P7tc7t19bUFq1bbE0BSaA/viewform',
  CUSTOMIZE_NATIVE: 'https://austindailybriefing.com/customize.html',
  CUSTOMIZE_FORM: 'https://docs.google.com/forms/d/e/1FAIpQLScwQiC37TuOgRqXpCsfcC9jTOL4Gg7d9KOUrYhRkwdfNGhhuQ/viewform',
  MANAGE_NATIVE: 'https://austindailybriefing.com/manage.html',
  MANAGE_FORM: 'https://docs.google.com/forms/d/e/1FAIpQLSeR4whAT-kkkdx81VMGdHtVJMSVAe5CdZx-PvFhwhrwMSEFxg/viewform',
  FEEDBACK_FORM: 'https://docs.google.com/forms/d/e/1FAIpQLSc_0-djww4qboFaEn9k-nEponrCBBqz-MCB81sOUtLjVsOZ7w/viewform'
});

function roleBlock(role) {
  const re = new RegExp(role + ": Object\\.freeze\\(\\{([\\s\\S]*?)\\n  \\}\\)", 'm');
  const match = transport.match(re);
  assert(match, `Missing reader-destination policy role: ${role}`);
  return match[1];
}

function field(role, name) {
  const block = roleBlock(role);
  const re = new RegExp(name + ": '([^']+)'");
  const match = block.match(re);
  return match ? match[1] : '';
}

function state(role) {
  return field(role, 'state');
}

function fallbackVisibility(role) {
  return field(role, 'fallbackVisibility');
}

function googleForms(text) {
  const re = /https:\/\/docs\.google\.com\/forms\/d\/e\/[A-Za-z0-9_-]+\/viewform/g;
  return [...new Set(String(text).match(re) || [])];
}

assert(transport.includes("ADB_READER_DESTINATION_POLICY_VERSION = 'ADB-READER-DESTINATIONS-1.0'"));
assert(transport.includes("BUILD: 'resend-transport-destination-policy-v1'"));
assert(transport.includes('function validateReaderDestinationPolicyV1()'));
assert(transport.includes('function adbValidateReaderFacingDestinations_'));
assert(transport.includes("requiredRoles: ['SITE','CUSTOMIZE','MANAGE','FEEDBACK','CORRECTIONS_LOG','PRIVACY','TERMS']"));
assert(/requiredQueue = \[[\s\S]*?'Customize URL'[\s\S]*?'Plain Text'[\s\S]*?'HTML'[\s\S]*?'Run ID'\]/m.test(transport),
  'Daily dispatcher must require the Customize URL queue field.');

assert.strictEqual(state('SIGNUP'), 'NATIVE_PRIMARY');
assert.strictEqual(state('CUSTOMIZE'), 'NATIVE_PRIMARY');
assert.strictEqual(state('MANAGE'), 'LEGACY_PRIMARY');
assert.strictEqual(state('FEEDBACK'), 'LEGACY_PRIMARY');
assert.strictEqual(fallbackVisibility('CUSTOMIZE'), 'OPERATOR_ONLY');

const publicAllowedForms = new Set();
if (state('SIGNUP') === 'LEGACY_PRIMARY') publicAllowedForms.add(URLS.SIGNUP_FORM);
if (fallbackVisibility('SIGNUP') === 'PUBLIC_TEMPORARY') publicAllowedForms.add(URLS.SIGNUP_FORM);
if (state('CUSTOMIZE') === 'LEGACY_PRIMARY') publicAllowedForms.add(URLS.CUSTOMIZE_FORM);
if (fallbackVisibility('CUSTOMIZE') === 'PUBLIC_TEMPORARY') publicAllowedForms.add(URLS.CUSTOMIZE_FORM);
if (state('MANAGE') === 'LEGACY_PRIMARY') publicAllowedForms.add(URLS.MANAGE_FORM);
if (state('FEEDBACK') === 'LEGACY_PRIMARY') publicAllowedForms.add(URLS.FEEDBACK_FORM);

const siteFiles = fs.readdirSync('site')
  .filter(name => name.endsWith('.html'))
  .map(name => path.join('site', name));

siteFiles.forEach(file => {
  const body = fs.readFileSync(file, 'utf8');
  googleForms(body).forEach(url => {
    assert(publicAllowedForms.has(url), `${file} exposes a Google Form that policy does not permit publicly: ${url}`);
  });
});

const emailAllowedForms = new Set();
if (state('MANAGE') === 'LEGACY_PRIMARY') emailAllowedForms.add(URLS.MANAGE_FORM);
if (state('FEEDBACK') === 'LEGACY_PRIMARY') emailAllowedForms.add(URLS.FEEDBACK_FORM);

[
  'design/newsletter-renderer-qa.html',
  'design/newsletter-renderer-qa.txt',
  'design/welcome-email-qa.html',
  'design/welcome-email-qa.txt'
].forEach(file => {
  const body = fs.readFileSync(file, 'utf8');
  googleForms(body).forEach(url => {
    assert(emailAllowedForms.has(url), `${file} exposes a Google Form not permitted in reader-facing email: ${url}`);
  });
});

assert(!fs.readFileSync('design/newsletter-renderer-qa.html', 'utf8').includes(URLS.CUSTOMIZE_FORM));
assert(!fs.readFileSync('design/welcome-email-qa.html', 'utf8').includes(URLS.CUSTOMIZE_FORM));

const dailyPrompt = fs.readFileSync('docs/automation-prompts/austin-daily-briefing.md', 'utf8');
assert(dailyPrompt.includes('ADB-READER-DESTINATIONS-1.0'));
assert(dailyPrompt.includes(URLS.CUSTOMIZE_NATIVE));
assert(!dailyPrompt.includes('unless an explicit native-customization outage has been declared for that run'),
  'Operator-only Customize fallback must not be authorized for reader-facing outage use.');


const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  transport +
    '\nthis.__validateReaderDestinations = adbValidateReaderFacingDestinations_;' +
    '\nthis.__readerDestinations = ADB_READER_DESTINATIONS;',
  sandbox
);

const dailyRoles = ['SITE','CUSTOMIZE','MANAGE','FEEDBACK','CORRECTIONS_LOG','PRIVACY','TERMS'];
const validDailyBody = dailyRoles
  .map(role => sandbox.__readerDestinations[role].primaryUrl)
  .join('\n');

assert.doesNotThrow(() => sandbox.__validateReaderDestinations(
  validDailyBody,
  validDailyBody,
  {
    context: 'synthetic valid daily',
    requiredRoles: dailyRoles,
    customizeUrlField: URLS.CUSTOMIZE_NATIVE
  }
));

assert.throws(() => sandbox.__validateReaderDestinations(
  validDailyBody + '\n' + URLS.CUSTOMIZE_FORM,
  validDailyBody + '\n' + URLS.CUSTOMIZE_FORM,
  {
    context: 'synthetic legacy customize',
    requiredRoles: dailyRoles,
    customizeUrlField: URLS.CUSTOMIZE_NATIVE
  }
), /operator-only fallback|unauthorized reader-facing Google Form/);

assert.throws(() => sandbox.__validateReaderDestinations(
  validDailyBody + '\n' + URLS.SIGNUP_FORM,
  validDailyBody + '\n' + URLS.SIGNUP_FORM,
  {
    context: 'synthetic unrelated signup fallback',
    requiredRoles: dailyRoles,
    customizeUrlField: URLS.CUSTOMIZE_NATIVE
  }
), /unauthorized reader-facing Google Form/);

assert.throws(() => sandbox.__validateReaderDestinations(
  validDailyBody,
  validDailyBody,
  {
    context: 'synthetic stale queue field',
    requiredRoles: dailyRoles,
    customizeUrlField: URLS.CUSTOMIZE_FORM
  }
), /noncanonical Customize URL field/);

const unknownForm = 'https://docs.google.com/forms/d/e/1FAIpQLUnknownReaderFacingForm/viewform';
assert.throws(() => sandbox.__validateReaderDestinations(
  validDailyBody + '\n' + unknownForm,
  validDailyBody + '\n' + unknownForm,
  {
    context: 'synthetic unknown form',
    requiredRoles: dailyRoles,
    customizeUrlField: URLS.CUSTOMIZE_NATIVE
  }
), /unauthorized reader-facing Google Form/);

console.log('Reader destination policy QA passed.');
