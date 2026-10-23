export { DEFAULT_WCAG_TAGS, type AccessibilityAuditOptions } from './config.js';
export {
  expectAccessibleDescription,
  expectAccessibleName,
  expectFocusRestored,
  expectFocusWithin,
  expectValidationAssociation,
} from './assertions.js';
export { normalizeAccessibilityFindings, type NormalizedAccessibilityFinding } from './findings.js';
export { auditAccessibility, collectAccessibilityResults } from './scan.js';
