import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';
import { DEFAULT_WCAG_TAGS, type AccessibilityAuditOptions } from './config.js';

function attachmentLabel(label: string) {
  return label.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-|-$/g, '') || 'accessibility';
}

export async function collectAccessibilityResults(
  page: Page,
  testInfo: TestInfo,
  options: AccessibilityAuditOptions = {},
) {
  const label = options.label ?? 'accessibility';
  const results = await new AxeBuilder({ page })
    .withTags([...(options.tags ?? DEFAULT_WCAG_TAGS)])
    .analyze();
  const prefix = attachmentLabel(label);

  await testInfo.attach(`${prefix}-axe-results`, {
    body: JSON.stringify({
      label,
      url: page.url(),
      results,
    }, null, 2),
    contentType: 'application/json',
  });

  await testInfo.attach(`${prefix}-axe-summary`, {
    body: JSON.stringify({
      label,
      url: page.url(),
      violationCount: results.violations.length,
      incompleteCount: results.incomplete.length,
      violations: results.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          failureSummary: node.failureSummary,
        })),
      })),
      incomplete: results.incomplete.map((item) => ({
        id: item.id,
        impact: item.impact,
        help: item.help,
        nodes: item.nodes.map((node) => ({
          target: node.target,
          failureSummary: node.failureSummary,
        })),
      })),
    }, null, 2),
    contentType: 'application/json',
  });

  return results;
}

export async function auditAccessibility(
  page: Page,
  testInfo: TestInfo,
  options: AccessibilityAuditOptions = {},
) {
  const results = await collectAccessibilityResults(page, testInfo, options);
  expect(results.violations, `Accessibility violations${options.label ? `: ${options.label}` : ''}`).toEqual([]);
  return results;
}
