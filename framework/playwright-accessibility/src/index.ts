export { DEFAULT_WCAG_TAGS, type AccessibilityAuditOptions } from './config.js';
export {
  expectAccessibleDescription,
  expectAccessibleName,
  expectFocusRestored,
  expectFocusWithin,
  expectValidationAssociation,
  expectLiveRegionUpdate,
  expectComboboxState,
  expectNoHorizontalOverflow,
  type ComboboxStateOptions,
  type HorizontalOverflowOptions,
  type LiveRegionOptions,
} from './assertions.js';
export {
  normalizeAccessibilityFindings,
  type AccessibilityFindingMetadata,
  type AccessibilityTarget,
  type NormalizedAccessibilityFinding,
} from './findings.js';
export { auditAccessibility, collectAccessibilityResults } from './scan.js';
