import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium } from '@playwright/test';
import { expectFocusRestored, expectFocusWithin, expectValidationAssociation } from '../dist/assertions.js';

test('focus and validation helpers verify supplied element relationships', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(`
      <button id="trigger">Open panel</button>
      <section id="panel" aria-label="Panel"><input id="focused"></section>
      <div id="outside"></div>
      <label for="quantity">Quantity</label>
      <input id="quantity" aria-invalid="true" aria-describedby="quantity-error">
      <p id="quantity-error">Enter a valid quantity.</p>
      <p id="unrelated-error">An unrelated message.</p>
    `);

    await page.locator('#focused').focus();
    await expectFocusWithin(page.locator('#panel'));
    await page.locator('#trigger').focus();
    await expectFocusRestored(page.locator('#trigger'));
    await expectValidationAssociation(page.locator('#quantity'), page.locator('#quantity-error'));
    await assert.rejects(() => expectFocusWithin(page.locator('#outside')));
    await assert.rejects(() => expectValidationAssociation(page.locator('#quantity'), page.locator('#unrelated-error')));
  } finally {
    await browser.close();
  }
});
