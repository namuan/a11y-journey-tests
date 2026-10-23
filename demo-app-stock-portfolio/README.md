# Stock Portfolio Demo

A separate mock stock portfolio app that consumes the shared Playwright accessibility workspace package. Portfolio balances, holdings, and trade responses are synthetic; no brokerage or external data service is connected.

Run it from the repository root:

```bash
npm run dev:portfolio
```

Run its build and tests from the repository root:

```bash
npm run build
npm test
```

The tests cover accessible holdings structure, form validation, buy/sell constraints, successful mock trades, and service failure/retry. Axe scans use the shared framework package at caller-selected states.
