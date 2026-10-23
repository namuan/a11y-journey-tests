# Playwright Accessibility Helpers

A small workspace package for consistent axe-core scans and accessibility assertions in Playwright tests.

## API

- `auditAccessibility(page, testInfo, options)` runs axe with the configured/default WCAG tags, attaches complete results and a compact summary, then fails on violations.
- `collectAccessibilityResults(page, testInfo, options)` attaches the same evidence but returns results without failing. Use this for a test that intentionally introduces a defect and asserts that it is detected.
- `expectAccessibleName(locator, name)` and `expectAccessibleDescription(locator, description)` wrap Playwright's accessible-name and description matchers.
- `normalizeAccessibilityFindings(results, metadata)` converts axe violations into a stable finding shape for app-owned triage or reporting.
- `DEFAULT_WCAG_TAGS` exposes the default WCAG 2.0, 2.1, and 2.2 A/AA axe tags.

Example:

```ts
await auditAccessibility(page, testInfo, { label: 'lead-validation-errors' });
```

The consumer owns navigation, waits, fixtures, routes, and the choice of states to scan. Findings from axe do not prove conformance; incomplete checks and manual accessibility evaluation still need review.
