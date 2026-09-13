const required = ["RESEND_API_KEY", "ADB_TEST_RECIPIENT"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`Missing required environment variable(s): ${missing.join(", ")}`);
  process.exit(1);
}

const runId = process.env.GITHUB_RUN_ID || "local";
const runAttempt = process.env.GITHUB_RUN_ATTEMPT || "1";
const sentAt = new Date().toISOString();

const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
    "Idempotency-Key": `adb-delivery-test-${runId}-${runAttempt}`,
  },
  body: JSON.stringify({
    from: "Austin Daily Briefing <briefing@austindailybriefing.com>",
    to: [process.env.ADB_TEST_RECIPIENT],
    subject: "Austin Daily Briefing — Delivery Test",
    text: [
      "Austin Daily Briefing delivery test",
      "",
      "This message confirms that the ADB sender domain and Resend delivery path are working.",
      `Sent at: ${sentAt}`,
    ].join("\n"),
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f3f3f1;color:#141414;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">ADB sender-domain and Resend delivery test.</div>
    <main style="max-width:640px;margin:0 auto;padding:40px 24px;">
      <div style="border-top:5px solid #ce1829;background:#ffffff;padding:32px;">
        <p style="margin:0 0 20px;color:#ce1829;font-size:12px;font-weight:700;letter-spacing:.12em;">DELIVERY SYSTEM TEST</p>
        <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1.05;">Austin Daily Briefing</h1>
        <p style="margin:0 0 18px;font-size:17px;line-height:1.6;">This message confirms that the ADB sender domain and Resend delivery path are working.</p>
        <p style="margin:0;color:#626262;font-size:13px;line-height:1.5;">Sent at ${sentAt}</p>
      </div>
    </main>
  </body>
</html>`,
  }),
});

const result = await response.json().catch(() => ({}));

if (!response.ok) {
  console.error(`Resend request failed (${response.status}).`);
  if (result.message) console.error(result.message);
  process.exit(1);
}

console.log(`Delivery test accepted by Resend. Message ID: ${result.id}`);
