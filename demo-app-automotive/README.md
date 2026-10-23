# Automotive Accessibility POC

A self-contained, mock-data automotive configurator and lead journey for accessibility testing. No production services are called and the demo does not persist form submissions.

## Run locally

```bash
npm install
npx playwright install chromium
npm run dev
```

Open the local Vite URL printed in the terminal. The demo uses synthetic dealer names and example contact information only.

## Run the accessibility tests

```bash
npx playwright test
```

Playwright starts the app automatically. The suite exercises configuration, form validation, dealer autocomplete, the privacy dialog, successful submission, and service failure/retry. ANDI-inspired checks also assert accessible names on interactive elements, page landmarks and heading structure, control roles/states, and text alternatives for non-text visuals. Lead submission is intercepted and mocked in the tests. Reports are written to `playwright-report/` and `test-results/`.

Automated axe scans are not a conformance assessment. Screen reader announcement quality, broader keyboard usability, and cross-browser/assistive-technology behavior still require manual review.

To demonstrate detection of a deliberate accessible-name defect, open `/?a11y-defect=paint-label`. This mode is disabled by default and is covered by a test that expects axe to report the defect.
