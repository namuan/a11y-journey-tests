import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium } from '@playwright/test';
import {
  expectComboboxState,
  expectFocusRestored,
  expectFocusWithin,
  expectLiveRegionUpdate,
  expectValidationAssociation,
} from '../dist/assertions.js';

test('live-region and combobox helpers verify announcement semantics and relationships', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(`
      <p id="status" role="status" aria-live="polite">Portfolio refreshed</p>
      <label for="dealer">Dealer</label>
      <input id="dealer" role="combobox" aria-expanded="true" aria-controls="dealers" aria-activedescendant="dealer-option" value="Seattle">
      <ul id="dealers" role="listbox">
        <li id="dealer-option" role="option" aria-selected="true">Seattle North</li>
      </ul>
    `);

    await expectLiveRegionUpdate(page.locator('#status'), 'Portfolio refreshed');
    await expectComboboxState(page.locator('#dealer'), {
      expanded: true,
      listbox: page.locator('#dealers'),
      activeOption: page.locator('#dealer-option'),
      selectedOption: page.locator('#dealer-option'),
      value: 'Seattle',
    });
    await assert.rejects(() => expectLiveRegionUpdate(page.locator('#dealer'), 'Seattle'));
    await page.locator('#dealer').evaluate((element) => element.setAttribute('aria-controls', 'wrong-list'));
    await assert.rejects(() => expectComboboxState(page.locator('#dealer'), {
      expanded: true,
      listbox: page.locator('#dealers'),
      activeOption: page.locator('#dealer-option'),
    }));
  } finally {
    await browser.close();
  }
});

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
