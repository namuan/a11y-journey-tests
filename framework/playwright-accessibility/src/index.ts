export { DEFAULT_WCAG_TAGS, type AccessibilityAuditOptions } from './config.js';
export {
  expectAccessibleDescription,
  expectAccessibleName,
  expectFocusRestored,
  expectFocusWithin,
  expectValidationAssociation,
  expectLiveRegionUpdate,
  expectComboboxState,
  type ComboboxStateOptions,
  type LiveRegionOptions,
} from './assertions.js';
export { normalizeAccessibilityFindings, type NormalizedAccessibilityFinding } from './findings.js';
export { auditAccessibility, collectAccessibilityResults } from './scan.js';
