/* Austin Daily Briefing — native signup browser configuration.
 *
 * Gate A/B DEV posture. Configure only with a dedicated DEV Apps Script
 * deployment. Production signup remains on the Google Form until promotion.
 */
window.ADB_NATIVE_SIGNUP_CONFIG = Object.freeze({
  environment: 'development',
  endpoint: 'https://script.google.com/macros/s/AKfycbzx2Ktealkm7PnFf1aXCcrZOzmffG7KBUE3NUsVA-pxsaq0lLkzn-O9F_Ajruov5v1l/exec'
});
