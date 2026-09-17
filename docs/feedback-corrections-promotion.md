# Feedback and corrections promotion

Status: draft. The Google Form remains titled `[DEV] Austin Daily Briefing — Feedback & Corrections` until the site changes are approved for release. Do not share its responder link on the production site before promotion.

## Google Form updates at promotion

Rename the form to `Austin Daily Briefing — Feedback & Corrections`.

Replace the form description with:

> Use this form to report a possible error, request clarification, share feedback, or tell us about an accessibility or technical problem.
>
> Austin Daily Briefing is a small experimental project. Every submission will be reviewed, but a personal response or change cannot be guaranteed.
>
> Your email address is required so we can review the submission, follow up if you allow it, and reduce spam. It will be kept private and will not appear in a public correction. We delete your email address and complete submission from our Google Form responses when review is finished and no later than 15 days after submission. A response copy emailed to you remains in your own mailbox.
>
> Do not use this form for emergencies, confidential tips, private records, or sensitive personal information.
>
> Privacy Policy: https://austindailybriefing.com/privacy.html
>
> Terms of Use: https://austindailybriefing.com/terms.html
>
> Corrections log: https://austindailybriefing.com/corrections.html

Replace the confirmation message with:

> Thank you. Your submission has been received and will be reviewed.
>
> A submission does not automatically mean the briefing will be changed. If a material error or meaningful clarification is confirmed, Austin Daily Briefing will publish a visible notice in the next available briefing and add the confirmed change to the public corrections log: https://austindailybriefing.com/corrections.html
>
> Declined or unconfirmed requests will not appear in the log. Your email address will not be published.

Google Forms sends an automatic copy of the submitted answers. Do not claim that it sends a separate editorial decision or resolution email. The copied submission stays in the recipient's own mailbox.

## Release order

1. Review the draft site pull request, including the empty corrections log and privacy language.
2. Update the Form title, description, and confirmation message above. Check that responder copies remain enabled and that the Form shows zero test responses.
3. Merge the site pull request. GitHub Pages will publish the corrections log, privacy update, and footer links.
4. Open the public site and form from the footer. Confirm the policy and log URLs resolve, the Form no longer says `[DEV]`, and the form still accepts responses.
5. Review submissions manually. Record only confirmed material errors or meaningful clarifications in the next available briefing and in `site/corrections.html`. Include the affected briefing date, what was wrong or unclear, what changed, and a supporting source when available. Do not publish the submitter's identity or private message.
6. Delete each complete Google Form response, including its collected email address, after review and no later than 15 days after submission. No response spreadsheet is connected. This is a manual practice and must be checked regularly; no scheduled task is used.

Submitting the sitemap to a search engine remains a separate later step.
