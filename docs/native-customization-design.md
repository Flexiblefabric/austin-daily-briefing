# Native Customization Page — Product and Security Design

**Status:** Draft design specification  
**Workstream:** Native subscriber forms / Stage 1  
**Target public path:** `/customize.html`  
**Backend constraint:** Preserve the existing Google Sheets + Apps Script subscriber control plane  
**Current source schema:** `Google Customize Responses` in the production intake workbook

## 1. Goal

Replace the public Google customization form with a first-party Austin Daily Briefing page that feels continuous with the website and newsletter while preserving the existing subscriber-processing architecture.

This stage does **not** create a subscriber account portal and does not expose saved preferences before ownership is verified.

The initial native flow is a **change-request form**:

1. Reader enters the subscribed email address.
2. Reader specifies only the preferences they want to change.
3. The website submits the request to a narrow Apps Script intake endpoint.
4. The system gives the same generic response whether or not the address is subscribed.
5. For a matching subscriber, the existing verification model sends a single-use confirmation link.
6. Preferences change only after valid confirmation.
7. The existing subscriber processor remains authoritative for applying the change.

## 2. Security posture

The native form must improve presentation without weakening the current ownership-verification model.

### Required controls

- Email address alone is not authorization to change a profile.
- No current preference values are shown before verification.
- Every submitted field defaults to **Keep current**.
- Unknown email addresses receive the same browser response as known addresses.
- A valid request for an existing subscriber creates a single-use, scoped verification request.
- Raw verification tokens may appear only in the confirmation link delivered to the subscriber.
- Store only the token hash and verification metadata.
- Tokens expire and cannot be replayed.
- The confirmation is bound to the exact email address and exact submitted change request.
- Server-side validation is authoritative; client-side validation is convenience only.
- Unexpected fields and unsupported option values are rejected.
- The public page contains no Sheet IDs, internal profile IDs, private endpoint secrets, raw tokens, or operational configuration.
- Repeated confirmation requests are constrained with per-address cooldown/caps and a global safety threshold.
- If abuse becomes material, add Cloudflare Turnstile or an equivalent challenge without redesigning the page.

### Preference privacy

Topic selections are personal preference data. Some topics, such as LGBTQ+ Community or Health & Wellness, can concern subjects that overlap with legally or socially sensitive characteristics. A topic selection must never be treated as proof of a subscriber's identity or condition, but access to preference data should still be restricted and minimized.

## 3. Information architecture

The page uses the common ADB site shell:

- approved masthead;
- standard desktop/mobile navigation;
- Paper reading surface;
- Charcoal footer;
- no imagery;
- one clear page `h1`.

Working page header:

> **Customize your briefing.**

Supporting copy:

> Choose what you want to see more or less of in More for You, and adjust how much detail the briefing gives you. Leave anything unchanged that you do not want to update.

Security/orientation note:

> We’ll send a confirmation link to the subscribed address before applying any changes.

## 4. Form structure

### A. Subscriber email

**Email Address** — required.

Help text:

> Use the address that receives Austin Daily Briefing.

Do not display whether the address exists in the subscriber database.

### B. Austin & Civic Life

Each topic offers:

- Keep current
- Off
- Normal
- High

Topics:

- Local Government & Policy — `CIV01`
- Housing, Homelessness & Urban Life — `CIV02`
- Transportation & Transit — `CIV03`
- Public Safety & Courts — `CIV04`
- LGBTQ+ Community — `CIV05`
- Development, Land Use & Zoning — `CIV06`

### C. Culture & Leisure

- Stand-up Comedy — `CUL01`
- Live Music — `CUL02`
- Arts, Museums & Visual Culture — `CUL03`
- Food & Restaurants — `CUL04`
- Outdoors, Parks & Nature — `CUL05`
- Nightlife & Bars — `CUL06`
- Theater & Performing Arts — `CUL07`

Each uses Keep current / Off / Normal / High.

### D. Technology & Ideas

- Artificial Intelligence — `TEC01`
- Gaming — `TEC02`
- Science, Space & Astronomy — `TEC03`
- Philosophy & Big Ideas — `TEC04`
- Consumer Technology — `TEC05`

Each uses Keep current / Off / Normal / High.

### E. Broader Interests

- Business & Economy — `LIF01`
- Books & Publishing — `LIF02`
- Health & Wellness — `LIF03`
- Sports — `LIF04`
- Film, TV & Streaming — `LIF05`

Each uses Keep current / Off / Normal / High.

### F. Briefing style

**More for You volume**

- Keep current
- Fewer
- Standard
- More

**Story summary style**

- Keep current
- Concise
- Standard
- Explanatory

**Why It Matters length**

- Keep current
- Brief
- Standard
- Detailed

## 5. Interaction design

### Desktop

Use section fieldsets rather than individual cards.

Each topic should read as a horizontal preference row:

`Topic name | Keep current | Off | Normal | High`

- Topic label receives the largest share of row width.
- Choice controls use restrained segmented styling.
- Selected state must be visible without relying on color alone.
- Signal Red is reserved for focus/selection cues and the submit action.
- Section headings use IBM Plex Sans Condensed.
- Avoid putting every topic in a bordered card.

### Mobile

Each topic becomes a compact stacked unit:

`Topic name`  
`Keep current   Off   Normal   High`

Touch targets must remain comfortable and the selected state must remain obvious.

Do not hide topic sections behind required accordion interactions. Native `details` sections may be considered later only if testing shows the full page is unwieldy and keyboard/screen-reader behavior remains clear.

## 6. Submission rules

The browser should prevent submission when:

- email is blank or obviously malformed;
- no preference or style field differs from Keep current.

The server must independently validate both conditions.

Submitted native request fields should use stable internal keys rather than the full display labels where possible:

- `email`
- `CIV01` … `CIV06`
- `CUL01` … `CUL07`
- `TEC01` … `TEC05`
- `LIF01` … `LIF05`
- `more_for_you_volume`
- `summary_style`
- `why_it_matters_length`

Only changed values need to be persisted into the pending request. A missing/Keep current value means no change.

The backend must map native keys into the existing production customization schema before the current processor applies anything.

## 7. Browser response

Successful submission should never reveal whether the email address is subscribed.

Recommended response:

> **Check your inbox.**
>
> If that address is connected to Austin Daily Briefing, we’ll send a confirmation link for the requested changes. Nothing changes until the request is confirmed.

Secondary links:

- Back to Austin Daily Briefing
- Manage subscription

Do not say “email not found,” “subscriber exists,” or show saved preference values.

## 8. Confirmation email

The confirmation message should:

- identify that an ADB customization request was received;
- summarize the requested changes in plain language;
- state that nothing changes unless the link is confirmed;
- include one generic HTTPS confirmation link containing the single-use token;
- provide an ignore-this-message instruction for unrequested changes;
- avoid internal IDs, profile data not needed for confirmation, and raw token text outside the link.

A confirmation email should not disclose preferences that were not part of the submitted change.

## 9. Apps Script endpoint boundary

The public website may submit to a dedicated Apps Script web endpoint, but the endpoint should be intentionally narrow.

It may:

- accept the expected customization request;
- normalize and validate fields;
- enforce request-size and option allowlists;
- create the source/intake record required by the current processing model;
- return a generic success/error state.

It must not:

- expose production Sheet contents;
- return whether an email is subscribed;
- directly modify subscriber preferences;
- send the daily briefing;
- alter Resend/Cloudflare configuration;
- place runtime secrets in browser code;
- bypass the existing verification or subscriber-operation ownership boundaries.

## 10. Abuse controls

Initial low-complexity protections:

- hidden honeypot field;
- minimum/maximum request body size;
- strict allowlist of field names and values;
- per-address confirmation cooldown;
- per-address daily confirmation cap;
- global submission/confirmation ceiling that stops or defers sends if abnormal volume appears;
- operational logging without raw tokens.

If needed later:

- Cloudflare Turnstile;
- stronger global throttling;
- signed newsletter links that reduce repeated email entry.

## 11. Privacy and retention

The native form should not create a second long-term database.

Use the existing production control plane and existing verification/audit structures.

Before promotion, define exact retention for:

- native intake source rows;
- applied/expired verification records;
- failed/invalid request metadata;
- abuse-control counters.

Keep only what is needed to operate, reconcile, protect, or honor subscriber requests.

## 12. Accessibility

Required:

- semantic `form`, `fieldset`, and `legend` structure;
- visible labels for every control;
- no placeholder-only labels;
- keyboard-operable preference controls;
- visible focus state;
- error summary linked to invalid fields;
- inline errors associated with fields;
- status/success messaging announced appropriately;
- selected states indicated by text/control state, not color alone;
- no horizontal scrolling at common mobile widths.

## 13. Initial QA matrix

Before production promotion test at minimum:

- known subscriber, one topic change;
- known subscriber, multiple topic changes;
- style-only change;
- mixed topic and style change;
- all fields Keep current;
- malformed email;
- unknown email;
- duplicate submit;
- rapid repeated submit;
- expired confirmation;
- reused confirmation;
- altered token;
- token for different request;
- confirmation after request already applied;
- processor replay after successful application;
- blank fields preserve existing values;
- unsupported field/value rejected server-side;
- production endpoint cannot read or return subscriber rows to the browser.

## 14. Deliberately deferred

Not part of the first native customization release:

- subscriber login/password system;
- showing current saved preferences before verification;
- account dashboard;
- browser-side direct access to Google Sheets;
- retiring the Google customization form;
- migrating the subscriber database away from Google Sheets;
- native signup, feedback, or management forms.

## 15. Promotion criteria

The native customization page is ready to replace the public Google Form link when:

- visual review passes on desktop and mobile;
- field mapping matches the production schema;
- ownership verification cannot be bypassed;
- unknown addresses cannot be enumerated;
- replay/idempotency tests pass;
- rate/cooldown behavior is tested;
- the current subscriber processor applies exactly one authorized change;
- Google Form remains available as fallback;
- Privacy and operational documentation are updated as needed;
- explicit production promotion approval is recorded.
