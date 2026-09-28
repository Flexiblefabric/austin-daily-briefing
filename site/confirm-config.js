/* Austin Daily Briefing — first-party confirmation configuration.
 *
 * Controlled DEV only until FORM-6 promotion is approved.
 * The endpoint is same-origin and is expected to be served by a Cloudflare Worker route.
 */
window.ADB_CONFIRM_CONFIG = Object.freeze({
  environment: 'development',
  endpoint: 'https://confirm-api.austindailybriefing.com/api/dev/customize/confirm'
});
