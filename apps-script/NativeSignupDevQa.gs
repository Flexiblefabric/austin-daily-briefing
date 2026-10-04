/** Gate A/B unit-style checks for NativeSignupDev.gs. No production writes. */
function runNativeSignupDevQaV1() {
  adbSignupAssertDevBoundary_();
  const results = [];
  function check(name, condition) {
    results.push({name:name,pass:!!condition});
    if (!condition) throw new Error('FAIL: ' + name);
  }

  check('normalizes email', adbSignupNormalizeEmail_('  Example@Email.COM ') === 'example@email.com');
  check('valid email accepted', adbSignupValidEmail_('reader@example.com'));
  check('missing domain rejected', !adbSignupValidEmail_('reader@example'));
  check('space rejected', !adbSignupValidEmail_('reader @example.com'));

  const a = adbSignupResponseKey_('NSDEV-test','reader@example.com','yes');
  const b = adbSignupResponseKey_('NSDEV-test','reader@example.com','yes');
  const c = adbSignupResponseKey_('NSDEV-other','reader@example.com','yes');
  check('response key deterministic', a === b);
  check('response key changes with request identity', a !== c);
  check('response key is URL-safe SHA-256 length', /^[A-Za-z0-9_-]{43}$/.test(a));

  const intake = SpreadsheetApp.openById(ADB_NATIVE_SIGNUP_DEV.DEV_INTAKE_ID);
  check('DEV intake identity', intake.getId() === ADB_NATIVE_SIGNUP_DEV.DEV_INTAKE_ID);
  check('request sheet exists', !!intake.getSheetByName(ADB_NATIVE_SIGNUP_DEV.REQUEST_SHEET));
  check('diagnostic sheet exists', !!intake.getSheetByName(ADB_NATIVE_SIGNUP_DEV.DIAGNOSTIC_SHEET));

  console.log(JSON.stringify({suite:'NativeSignupDevQaV1',passed:results.length,results:results}));
  return results;
}
