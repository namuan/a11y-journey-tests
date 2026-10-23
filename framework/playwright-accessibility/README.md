# Playwright Accessibility Helpers

A small TypeScript package for consistent axe-core scans, Playwright assertions, and finding normalization. The automotive and stock-portfolio demos are independent consumers of this package.

Automated scans help identify programmatically detectable issues; they do not prove WCAG conformance or replace keyboard, screen-reader, zoom, and usability testing.

## What the framework does

- Runs axe-core against the current page using WCAG 2.0, 2.1, and 2.2 A/AA tags by default.
- Attaches full axe results and a compact summary to the current Playwright test.
- Fails `auditAccessibility` when axe reports violations.
- Provides thin helpers around Playwright's accessible-name and accessible-description assertions.
- Normalizes axe violations to an app-independent finding format for custom reporting.

The app test remains responsible for navigation, waiting for a meaningful state, choosing scan points, test data, service mocks, business assertions, and expected names/roles/states. The framework has no app-specific selectors or service behavior. It does not currently implement baselines, waivers, CI workflows, or issue-tracker integrations.

## Use inside this repository

Install dependencies and browser binaries from the repository root:

```bash
npm install
npx playwright install chromium
```

The demos already depend on `@poc/playwright-accessibility` through the root npm workspace. Build the shared package and run all checks with:

```bash
npm run build
npm test
```

To run an individual consumer:

```bash
npm run test --workspace=automotive-accessibility-demo
npm run test --workspace=stock-portfolio-accessibility-demo
```

## Use from a separate project

The package is not published to npm yet. For local development, clone this repository beside the consumer project, build the package, then add it as a local package dependency:

```bash
cd a11y-journey-tests
npm install
npm run build --workspace=@poc/playwright-accessibility
cd ../my-project
npm install -D @axe-core/playwright @playwright/test
npm install ../a11y-journey-tests/framework/playwright-accessibility
```

The consumer also needs Playwright installed and configured for its app. The helper package declares `@axe-core/playwright` and `@playwright/test` as peer dependencies; keep compatible versions in the consuming project. A future registry release can replace the local package path.

## Run an audit at a meaningful state

Import the audit helper in a Playwright test. First navigate and wait for the relevant application state, then scan it with a descriptive label:

```ts
import { auditAccessibility } from '@poc/playwright-accessibility';
import { expect, test } from '@playwright/test';

test('configuration is accessible after selecting Sport', async ({ page }, testInfo) => {
  await page.goto('/configure');
  await page.getByRole('radio', { name: 'Sport trim' }).check();
  await expect(page.getByTestId('vehicle-price')).toHaveText('£44,900');
  await auditAccessibility(page, testInfo, { label: 'configurator-sport-selected' });
});
```

The scan examines the page at the time it runs. It does not wait for application-specific API calls or UI transitions. Use Playwright assertions or explicit response/state waits before scanning. Add separate scans for important states such as initial load, validation errors, dialogs, dynamic updates, and success/failure feedback.

### Scan options and evidence

```ts
await auditAccessibility(page, testInfo, {
  label: 'lead-validation-errors',
  tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
});
```

`label` names the evidence attachment and identifies the state in reports. It is normalized for use as an attachment name. `tags` replaces the default axe tag set. Full results include violations, passes, incomplete checks, and inapplicable checks; the summary highlights violations and incomplete checks. Violations fail the test. Incomplete checks are attached for review, not automatically treated as passes or failures.

The consumers configure Playwright reporters. The demos use HTML, JSON, and JUnit reports; open an HTML report with `npx playwright show-report <demo-directory>/playwright-report`.

## Assert product-specific semantics

A scan cannot determine whether every control has the *right* user-facing name or state. Use explicit role/name locators and assertions for important controls:

```ts
import { expectAccessibleName } from '@poc/playwright-accessibility';
import { expect, test } from '@playwright/test';

test('trade form exposes its labels and validation state', async ({ page }) => {
  await page.goto('/portfolio');
  const quantity = page.getByRole('spinbutton', { name: 'Number of shares' });
  await expectAccessibleName(quantity, 'Number of shares');
  await page.getByRole('button', { name: 'Review buy order' }).click();
  await expect(quantity).toHaveAttribute('aria-invalid', 'true');
  await expect(quantity).toHaveAttribute('aria-describedby', 'shares-error');
});
```

`expectAccessibleName(locator, name)` and `expectAccessibleDescription(locator, description)` delegate to Playwright's built-in matchers. Assertions for checked, selected, expanded, disabled, invalid, modal, and focus states can use Playwright's normal locator assertions directly.

## Collect findings without failing

Most tests should use `auditAccessibility`, which fails on findings. `collectAccessibilityResults` is available when a test needs to inspect results without an immediate assertion, such as a deliberate-defect demonstration:

```ts
import { collectAccessibilityResults } from '@poc/playwright-accessibility';
import { expect } from '@playwright/test';

const results = await collectAccessibilityResults(page, testInfo, {
  label: 'deliberate-missing-label',
});
expect(results.violations.map((violation) => violation.id)).toContain('label');
```

Use this only when the test explicitly asserts the expected finding; otherwise accessibility violations could go unnoticed.

## Normalize findings for app-owned reporting

`normalizeAccessibilityFindings(results, metadata)` returns one record per affected axe node, with the rule ID, impact, summary, selector target, failure summary, page URL, and optional state label:

```ts
import { normalizeAccessibilityFindings } from '@poc/playwright-accessibility';

const findings = normalizeAccessibilityFindings(results, {
  pageUrl: page.url(),
  state: 'lead-validation-errors',
});
```

The framework does not create tickets or define product severity, owners, deduplication policy, or exceptions. Consumers decide how to use normalized findings.

## Practical guidance

- Prefer `getByRole`, `getByLabel`, and other user-facing locators over CSS selectors for interaction assertions.
- Scan only after the test has reached a stable, meaningful state.
- Mock external services and use synthetic data so failures are reproducible and no real transactions or personal data are involved.
- Keep assertion expectations local to the app's tests; do not encode app-specific names or behavior in this shared package.
- Review `incomplete` results and manually evaluate screen-reader announcements, focus visibility/order, zoom/reflow, and usability.
- Treat an axe pass as one signal, not as a conformance claim.
