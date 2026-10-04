/* Austin Daily Briefing — native signup browser configuration.
 *
 * Gate A/B DEV posture. Configure only with a dedicated DEV Apps Script
 * deployment. Production signup remains on the Google Form until promotion.
 */
window.ADB_NATIVE_SIGNUP_CONFIG = Object.freeze({
  environment: 'development',
  endpoint: ''
});
