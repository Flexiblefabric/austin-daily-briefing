# Austin Daily Briefing

Austin Daily Briefing is a one-page editorial website for a free, personalized daily email covering Austin news, useful context, things to do, and subscribers' selected interests. It is an independent passion project.

## Live site

[flexiblefabric.github.io/austin-daily-briefing](https://flexiblefabric.github.io/austin-daily-briefing/)

## Current state

The public landing page is live and search indexing is enabled. It includes:

- Production forms for signup, briefing customization, and subscription management
- An illustrative briefing sample and an explanation of the three primary content areas
- Frequently asked questions covering personalization, information use, and subscription controls
- Responsive layouts, keyboard focus states, a skip link, and reduced-motion support
- Open Graph and X/Twitter metadata with a branded social-sharing preview

Submitting the signup form creates a subscription and a briefing profile with default preferences. Subscribers can later personalize their topics and reading style, pause delivery, resume delivery, or unsubscribe through the linked forms.

## Project structure

The website is a static HTML and CSS project stored in `site/`. Its primary files are:

- `index.html` — page content, navigation, forms, and metadata
- `styles.css` — visual design and responsive behavior
- `austin.webp` — primary page image
- `social-preview.jpg` — shared-link preview image
- `favicon.svg` — browser icon

## Hosting

GitHub Pages deploys the contents of `site/` through `.github/workflows/pages.yml`. Updates pushed to the `main` branch trigger the deployment workflow.
