/* Austin Daily Briefing — native signup browser configuration.
 *
 * Production native signup endpoint. The Google signup form remains available
 * from signup.html as a fallback during observation.
 */
window.ADB_NATIVE_SIGNUP_CONFIG = Object.freeze({
  environment: 'production',
  endpoint: 'https://script.google.com/macros/s/AKfycbxdV2H97WfZRS4Hh2Qm7TLXSNvvRmgSiZclxssgrdhCwJDgl9LVqaLHbI_9EHlEQLNyAQ/exec'
});
