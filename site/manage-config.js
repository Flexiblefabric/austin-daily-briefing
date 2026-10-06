/* Austin Daily Briefing — FORM-9 native management DEV browser configuration.
 *
 * Keep the public Manage navigation on the Google form until FORM-9 production
 * cutover. Populate endpoint only after the isolated DEV Apps Script web app is
 * deployed and its runtime guardrails pass.
 */
window.ADB_NATIVE_MANAGE_CONFIG = Object.freeze({
  environment: 'development',
  endpoint: 'https://script.google.com/macros/s/AKfycbzENgETifuF_AXbYEfgwb5oWjjsyvDRByWWaATxmfopXbObgF6_KeiTBVHBlJiHytUO/exec'
});
