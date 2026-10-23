# Stock Portfolio Demo

A mock stock portfolio app that demonstrates the shared Playwright accessibility framework outside the automotive journey. Holdings, prices, balances, and trade responses are synthetic; no brokerage or external financial service is connected.

Run commands from the repository root.

## Start the app

```bash
npm run dev:stock-portfolio
```

## Build and test

Build all workspaces and run every test suite:

```bash
npm run build
npm test
```

To run only the portfolio suite from a fresh checkout, build the framework first:

```bash
npm run build --workspace=@poc/playwright-accessibility
npm test --workspace=stock-portfolio-accessibility-demo
```

The tests cover holdings table semantics, trade validation, buy/sell constraints, live feedback, responsive layout with a scrollable table, and mocked trade success/failure. Reports are written to `demo-app-stock-portfolio/playwright-report/` and `demo-app-stock-portfolio/test-results/`.
