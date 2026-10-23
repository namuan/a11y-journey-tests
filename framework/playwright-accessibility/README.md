# Playwright Accessibility Helpers

A small TypeScript package for consistent axe-core scans, Playwright assertions, and finding normalization. The automotive and stock-portfolio demos are independent consumers of this package.

Automated scans help identify programmatically detectable issues; they do not prove WCAG conformance or replace keyboard, screen-reader, zoom, and usability testing.

## What the framework does

- Runs axe-core against the current page using WCAG 2.0, 2.1, and 2.2 A/AA tags by default.
- Attaches full axe results and a compact summary to the current Playwright test.
- Fails `auditAccessibility` when axe reports violations.
- Provides thin helpers for accessible names, descriptions, focus containment/restoration, and validation-error associations.
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

`expectAccessibleName(locator, name)` and `expectAccessibleDescription(locator, description)` delegate to Playwright's built-in matchers. `expectFocusWithin(container)` verifies focus is on or within a region; `expectFocusRestored(trigger)` verifies focus returned to a specific trigger. `expectValidationAssociation(control, error)` verifies the control is invalid, the error is visible and has an ID, and the control references that ID through `aria-describedby` or `aria-errormessage`. Assertions for checked, selected, expanded, disabled, and other states can use Playwright's normal locator assertions directly.

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

## Manual checks: automation opportunities and boundaries

Many manual checks contain repeatable assertions that can be automated. The framework standardizes generic mechanics, while each app test supplies its controls, expected behavior, and meaningful state. The package currently provides axe scans, accessible-name/description assertions, focus containment/restoration, validation-error association, and finding normalization. Other checks below are performed directly in app tests or remain future additions.

| Check area | Reusable framework potential | App-specific test responsibility | Still needs human review |
|---|---|---|---|
| Keyboard workflows | `expectFocusWithin` and `expectFocusRestored`; explicit sequence helpers remain a possible addition | Define the actual journey, actionable controls, and expected focus order | Whether the sequence is logical and focus is easy to track |
| Dialogs and popovers | `expectFocusWithin` and `expectFocusRestored` assert focus location around app-owned open/close actions | Open the specific component and identify the expected trigger and focus destination | Whether dialog instructions and behavior are understandable with assistive technology |
| Forms and errors | `expectValidationAssociation` verifies invalid state and error-description association | Supply fields, validation actions, expected errors, and recovery behavior | Whether error messages and recovery instructions are clear |
| Dynamic announcements | A helper could verify live-region semantics and expected text changes | Trigger the update and define expected pricing/status/results | Whether announcements are timely, non-duplicative, and useful with a screen reader |
| Autocomplete | Optional role/state assertions for comboboxes, listboxes, and options | Define the widget's supported keys, expected options, and selection behavior | Whether the interaction and announcements make sense to users |
| Responsive reflow | Optional viewport smoke checks or generic overflow detection | Choose supported viewports and assert critical content remains usable | Browser zoom, enlarged text, and real-device usability |
| Structure and alternatives | Existing axe scans and accessible-name/description helpers; additional reusable assertions could be added | State which headings, landmarks, tables, and image alternatives are expected | Whether the hierarchy and alternatives convey the content correctly |

Automated checks do not verify actual screen-reader output. Keep targeted keyboard, screen-reader, zoom/reflow, and usability reviews in each product's accessibility test plan.

## Roadmap for reusable helpers

Implement these as small, opt-in utilities. Every helper must accept app-owned locators and expected behavior; avoid guessing selectors, navigating the app, triggering business actions, or claiming to prove assistive-technology output.

### Phase 1: Focus and form relationships (implemented)

- `expectFocusWithin(container)` verifies focus is on or within a supplied region.
- `expectFocusRestored(trigger)` verifies focus returned to the supplied trigger.
- `expectValidationAssociation(control, error)` verifies an invalid control references its visible error through `aria-describedby` or `aria-errormessage`.
- Both demo apps use the helpers; the automotive dialog test also verifies focus restoration after Escape.
- Framework tests cover passing and failing helper cases.

The app test still owns opening/closing dialogs, submitting forms, correcting input, and deciding where focus should go.

### Phase 2: Live-region and composite-widget contracts

- Add `expectLiveRegionUpdate(region, expectedText)` to verify that a caller-provided region has a status/live semantic and receives the expected text after the app test triggers an update.
- Add `expectComboboxState` assertions for caller-supplied expanded state, controlled list, active option, and selected value where those attributes are used.
- Do not provide a generic keyboard driver for every combobox pattern. App tests specify the supported keys and expected behavior.

**Acceptance:** Tests demonstrate initial and updated states, expanded/collapsed states, valid active descendants, and clear failures for malformed relationships. Documentation states that DOM assertions cannot confirm spoken announcements.

### Phase 3: Responsive smoke checks

- Add an opt-in `expectNoHorizontalOverflow(page, options)` check for the document at a caller-selected viewport.
- Permit explicit exclusions for intentionally scrollable regions such as data tables; keep exclusions narrow and visible in test code.
- Keep viewport selection, critical content assertions, browser zoom testing, and expected responsive behavior app-owned.

**Acceptance:** Framework tests verify both document-level overflow detection and allowed nested scroll regions; demo tests cover a small viewport without relying on screenshot pixel comparisons.

### Phase 4: Stabilize and publish the API

- Apply consistent naming, useful failure messages, TypeScript types, and public exports.
- Document each helper's guarantees, assumptions, and non-goals.
- Keep framework tests separate from consumer journey tests and use both demos as integration consumers.
- Review Playwright/axe version compatibility before publishing a release; keep the `@poc` scope and local-workspace distribution model until an actual package owner and registry are selected.

**Definition of done:** Each utility has focused positive/negative tests, both consumers can adopt it without framework-specific application code, error messages identify the failed relationship/state, and the documentation preserves the human-review boundary.

## Practical guidance

- Prefer `getByRole`, `getByLabel`, and other user-facing locators over CSS selectors for interaction assertions.
- Scan only after the test has reached a stable, meaningful state.
- Mock external services and use synthetic data so failures are reproducible and no real transactions or personal data are involved.
- Keep assertion expectations local to the app's tests; do not encode app-specific names or behavior in this shared package.
- Review `incomplete` results and manually evaluate screen-reader announcements, focus visibility/order, zoom/reflow, and usability.
- Treat an axe pass as one signal, not as a conformance claim.
