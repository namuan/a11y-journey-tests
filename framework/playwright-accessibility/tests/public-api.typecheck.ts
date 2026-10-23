import {
  DEFAULT_WCAG_TAGS,
  auditAccessibility,
  collectAccessibilityResults,
  expectAccessibleDescription,
  expectAccessibleName,
  expectComboboxState,
  expectFocusRestored,
  expectFocusWithin,
  expectLiveRegionUpdate,
  expectNoHorizontalOverflow,
  expectValidationAssociation,
  normalizeAccessibilityFindings,
  type AccessibilityAuditOptions,
  type AccessibilityFindingMetadata,
  type AccessibilityTarget,
  type NormalizedAccessibilityFinding,
} from '../dist/index.js';
import type { Locator, Page, TestInfo } from '@playwright/test';

declare const page: Page;
declare const testInfo: TestInfo;
declare const control: Locator;
declare const region: Locator;
declare const options: Locator;
declare const results: Awaited<ReturnType<typeof collectAccessibilityResults>>;

const auditOptions: AccessibilityAuditOptions = {
  label: 'type-contract',
  tags: [...DEFAULT_WCAG_TAGS],
};
const findingMetadata: AccessibilityFindingMetadata = {
  pageUrl: 'https://example.test',
  state: 'validation-error',
};
const findings: NormalizedAccessibilityFinding[] = normalizeAccessibilityFindings(results, findingMetadata);
const findingTarget: AccessibilityTarget = ['#save', ['iframe', '#control']];

void auditAccessibility(page, testInfo, auditOptions);
void expectAccessibleDescription(control, 'Additional instructions');
void expectAccessibleName(control, 'Submit');
void expectComboboxState(control, { expanded: true, listbox: options });
void expectFocusRestored(control);
void expectFocusWithin(region);
void expectLiveRegionUpdate(region, 'Updated');
void expectNoHorizontalOverflow(page, { allowedScrollableRegions: [region] });
void expectValidationAssociation(control, region);
void findings;
void findingTarget;
