/* Austin Daily Briefing — first-party confirmation configuration.
 *
 * DEV remains the default during the controlled production rollout.
 * Email links select an environment explicitly through the URL fragment.
 */
window.ADB_CONFIRM_CONFIG = Object.freeze({
  defaultEnvironment: 'development',
  endpoints: Object.freeze({
    development: 'https://confirm-api.austindailybriefing.com/api/dev/customize/confirm',
    production: 'https://confirm-prod.austindailybriefing.com/api/customize/confirm'
  })
});
