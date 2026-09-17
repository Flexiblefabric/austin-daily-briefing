# Austin Daily Briefing

Austin Daily Briefing is an editorial website for a free, personalized daily email covering Austin news, useful context, things to do, and subscribers' selected interests. It is an independent experimental passion project.

## Live site

[austindailybriefing.com](https://austindailybriefing.com/)

## Current state

The public landing page is live and search indexing is enabled. It includes:

- Production forms for signup, briefing customization, and subscription management
- A feedback and corrections form linked from the website footer
- A public corrections log that lists confirmed material corrections and meaningful clarifications; the empty state reads “No confirmed corrections yet”
- An illustrative briefing sample and an explanation of the three primary content areas
- Frequently asked questions covering personalization, information use, and subscription controls
- Dedicated privacy and terms pages written in plain language
- Responsive layouts, keyboard focus states, a skip link, and reduced-motion support
- Open Graph and X/Twitter metadata with a branded social-sharing preview

Submitting the signup form creates a subscription and a briefing profile with default preferences. Subscribers can later personalize their topics and reading style, pause delivery, resume delivery, or unsubscribe through the linked forms.

Feedback and corrections are reviewed manually. Confirmed changes are noted in the next available briefing and added to the public log without the submitter's email address. Form responses are deleted after review and no later than 15 days after submission. The feedback form is not connected to a response spreadsheet; review and deletion take place in Google Forms. This is a manual operating commitment, not an automated retention control.

## Project structure

The website is a static HTML and CSS project stored in `site/`. Its primary files are:

- `index.html` — page content, navigation, forms, and metadata
- `styles.css` — visual design and responsive behavior
- `austin.webp` — primary page image
- `social-preview.jpg` — shared-link preview image
- `favicon.svg` — browser icon
- `corrections.html` — public log of confirmed corrections and clarifications
- `privacy.html` — privacy practices, subscriber choices, feedback submissions, and service providers
- `terms.html` — experimental-service terms and content limitations

## Hosting

GitHub Pages deploys the contents of `site/` through `.github/workflows/pages.yml` at the custom domain `austindailybriefing.com`. Updates pushed to the `main` branch trigger the deployment workflow.
