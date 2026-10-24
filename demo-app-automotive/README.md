# Automotive Configurator Demo

A self-contained, three-step automotive configurator and lead-submission journey for testing the shared accessibility framework. Visitors choose a model, configure trim and options, then review the configuration and send an enquiry. Dealer search, pricing, and lead services use synthetic data; no production service is called and submissions are not persisted.

Run commands from the repository root.

## Start the app

```bash
npm run dev:automotive
```

## Build and test

Build all workspaces and run every test suite:

```bash
npm run build
npm test
```

To run only the automotive suite from a fresh checkout, build the framework first:

```bash
npm run build --workspace=@poc/playwright-accessibility
npm test --workspace=automotive-accessibility-demo
```

The automotive tests cover step-by-step navigation, progress semantics, focus after step changes, choice preservation, configuration and pricing announcements, conditional options, form validation, dealer autocomplete, consent dialog focus behavior, and mocked lead success/failure. They also test a narrow viewport. Reports are written to `demo-app-automotive/playwright-report/` and `demo-app-automotive/test-results/`.

A deliberate missing-paint-label example is available at `/?a11y-defect=paint-label`; it is disabled by default and tested as an expected axe finding.

Automated scans do not establish WCAG conformance. Screen-reader output, broader keyboard usability, browser/assistive-technology combinations, and zoom behavior still need manual review.
