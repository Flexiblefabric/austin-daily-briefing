# Fresh-context synthesis handoff

Run this in a context that has not seen fixture construction, reviewer keys, exploratory prose or scores. If that condition is not true, label the run exploratory and stop short of a promotion-eligible result.

Read only:

1. `docs/friday-synthesis-spec.md` at pinned commit `c0ef0fcf01d913661bf135d571c1ea723250deb2` (blob `160b50b9aed97c6f45ad40302a07b4838bb33789`).
2. `docs/friday-evidence/2026-10-04/synthesis-instructions.txt`.
3. The `packet.json` files under W031, W075, W118 and W032 in that same evidence directory.

Do not read README, manifests with review outcomes, `reviewer-key.json`, challenge matrix, other conversations or exploratory output/evaluation records. The opaque IDs are deliberate; no expected scenario or answer is supplied.

Apply the synthesis instructions to each packet independently. All facts are fictional and all times simulated. Return one frozen output file per packet containing exact prose, opening/arc structure, consolidated source IDs/labels, every materially used source, paragraph/claim source mappings, justified new-context exceptions, and an omission reason if appropriate. Do not assign scores or make a promotion decision. Preserve the exact prompt and input hashes and record which context produced each output. Never queue, send, schedule or mutate production.

Use new filenames such as `W031-blind-01-output.json`; do not overwrite exploratory records. The evaluator receives these files only after they are saved and frozen.
