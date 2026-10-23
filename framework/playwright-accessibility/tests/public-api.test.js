import assert from 'node:assert/strict';
import test from 'node:test';
import * as api from '../dist/index.js';

test('public entry point exports the documented runtime helpers', () => {
  for (const name of [
    'auditAccessibility',
    'collectAccessibilityResults',
    'expectAccessibleDescription',
    'expectAccessibleName',
    'expectComboboxState',
    'expectFocusRestored',
    'expectFocusWithin',
    'expectLiveRegionUpdate',
    'expectNoHorizontalOverflow',
    'expectValidationAssociation',
    'normalizeAccessibilityFindings',
  ]) {
    assert.equal(typeof api[name], 'function', `${name} should be exported from the package entry point`);
  }
  assert.deepEqual(api.DEFAULT_WCAG_TAGS, ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']);
});
