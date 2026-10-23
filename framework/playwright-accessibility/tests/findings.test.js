import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeAccessibilityFindings } from '../dist/index.js';

test('normalizes axe violations into app-independent findings', () => {
  const findings = normalizeAccessibilityFindings({
    violations: [{
      id: 'button-name',
      impact: 'critical',
      help: 'Buttons must have discernible text',
      nodes: [
        { target: ['#save'], failureSummary: 'Add a name.' },
        { target: ['.close'], failureSummary: 'Add a name.' },
      ],
    }],
  }, { pageUrl: 'http://localhost/form', state: 'validation-error' });

  assert.deepEqual(findings, [
    {
      ruleId: 'button-name',
      impact: 'critical',
      summary: 'Buttons must have discernible text',
      target: ['#save'],
      failureSummary: 'Add a name.',
      pageUrl: 'http://localhost/form',
      state: 'validation-error',
    },
    {
      ruleId: 'button-name',
      impact: 'critical',
      summary: 'Buttons must have discernible text',
      target: ['.close'],
      failureSummary: 'Add a name.',
      pageUrl: 'http://localhost/form',
      state: 'validation-error',
    },
  ]);
});
