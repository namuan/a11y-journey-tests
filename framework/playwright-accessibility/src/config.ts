export const DEFAULT_WCAG_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
] as const;

export type AccessibilityAuditOptions = {
  label?: string;
  tags?: readonly string[];
};
