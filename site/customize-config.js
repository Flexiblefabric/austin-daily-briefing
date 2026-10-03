/* Austin Daily Briefing — native customization browser configuration.
 *
 * Gate E production cutover. The production Apps Script /exec endpoint is
 * inserted immediately before merge after final runtime-state verification.
 */
window.ADB_NATIVE_CUSTOMIZE_CONFIG = Object.freeze({
  environment: 'production',
  endpoint: ''
});
