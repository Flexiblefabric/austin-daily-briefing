# Synthetic publisher batch sizing and renderer parity

`apps-script/EditorialPublisherBatchQa.gs` adds one read-only entry point:
`runPublisherDevBatchQaV1()`.

Install it as a new Apps Script file named `EditorialPublisherBatchQa` alongside
the already installed publisher at source revision
`27c484eca26c2da77f594c31373ae479ae7c93f1`. Keep the existing source-revision script
property unchanged: the publisher itself is unchanged. No deployment or trigger
is needed.

The helper reads the sealed October 28 DEV synthetic fixture and its independent
DEV state. It verifies the package hash, source pin, current Chicago date and
reserved-domain test identity. It clones those inputs and builds 1-, 12- and
24-profile synthetic cases in memory. The committed one-profile QA remains intact.

For each case it runs the actual planner, renderer, layout validator and selection
gate; serializes the same typed appendCells request shape as the DEV adapter; and
measures UTF-8 bytes against the writer's 1,800,000-byte safeguard. It also compares
every planned HTML/text pair with a direct call to the approved renderer.

Local Node verification passed 34 publisher/evidence tests, including the three
new batch-helper regressions. With the synthetic six-item fixture, the 12-profile
wire request measured 412,303 bytes (22.9% of the writer safeguard), and the
24-profile request measured 824,000 bytes (45.8%). Those figures describe this
fixture, not a maximum-size real briefing. Twelve profiles is the previously
observed audience-size baseline; this test does not read or recount production
subscribers.

Apps Script execution remains pending until the operator runs the new helper.
Its logs report `profiles`, `historyRows`, `requestBytes`, `withinByteLimit`,
`planRenderValidateMs`, `totalMeasureMs` and `syntheticRendererParity`, followed by
a compact overall result. Expect 6, 72 and 144 proposed history rows respectively,
and parity of 1/1, 12/12 and 24/24. The 12-profile case must fit the byte safeguard;
the 24-profile case reports additional headroom independently.

The measurement includes DEV reads and in-memory planning, rendering, validation
and request serialization. It does not time a Sheets commit, delivery, or a full
production-size historical database. This is a synthetic renderer parity test;
an actual production editorial shadow comparison remains a separate next step.
No Sheets write, commit, repair, trigger or mail/provider API is called.

The fixture is date-bound to October 28, 2026, America/Chicago. After that date,
refresh its editorial cutoff and evidence through the normal DEV staging process
rather than bypassing the publisher's current-date gate.
