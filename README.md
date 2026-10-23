# Automotive Accessibility POC Workspace

This repository contains a reusable Playwright accessibility package and two mock apps that demonstrate it: an automotive configurator and a stock portfolio.

## Screenshots

### Automotive configurator

![Automotive configurator demo](screenshots/automotive-configurator.png)

### Stock portfolio

![Stock portfolio demo](screenshots/stock-portfolio.png)

### Playwright test reports

Automotive demo: 9 tests passed.

![Automotive Playwright test report](screenshots/automotive-test-report.png)

Stock portfolio demo: 5 tests passed.

![Stock portfolio Playwright test report](screenshots/stock-portfolio-test-report.png)

```text
framework/playwright-accessibility/  Shared audit utilities and assertions
demo-app-automotive/                 Automotive configurator demo and tests
demo-app-stock-portfolio/             Mock stock portfolio demo and tests
```

## Setup

```bash
npm install
npx playwright install chromium
```

## Run the demo

```bash
npm run dev:automotive
```

Run the stock portfolio demo with:

```bash
npm run dev:stock-portfolio
```

## Build and test

```bash
npm run build
npm test
```

Each demo app owns its journey, synthetic data, service mocks, page behavior, and state selection. The shared package owns reusable axe scans, attachments, finding normalization, and thin Playwright accessible-name assertions. Automated scans do not replace manual keyboard and assistive-technology testing.

## License

This project is licensed under the [MIT License](LICENSE).
