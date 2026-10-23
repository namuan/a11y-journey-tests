import {
  auditAccessibility,
  collectAccessibilityResults,
  expectFocusRestored,
  expectFocusWithin,
  expectValidationAssociation,
} from '@poc/playwright-accessibility';
import { expect, test, type Page } from '@playwright/test';

async function completeLeadForm(page: Page) {
  await page.getByLabel('First name').fill('Alex');
  await page.getByLabel('Last name').fill('Example');
  await page.getByLabel('Email address').fill('alex@example.test');
  await page.getByLabel('Phone number').fill('2065550123');
  const dealer = page.getByRole('combobox', { name: 'Preferred dealer' });
  await dealer.fill('Seattle');
  await dealer.press('ArrowDown');
  await dealer.press('Enter');
  await page.getByRole('checkbox', { name: /I agree that Northstar Motors/ }).check();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('initial and changed configurator states are accessible', async ({ page }, testInfo) => {
  await auditAccessibility(page, testInfo, { label: 'configurator-initial' });
  await page.getByRole('radio', { name: /Sport/ }).check();
  await expect(page.getByRole('checkbox', { name: /Touring tow package/ })).toBeDisabled();
  await expect(page.getByText('This package is unavailable with Sport trim.')).toBeVisible();
  await page.getByRole('radio', { name: /Metallic Blue/ }).check();
  await page.getByRole('checkbox', { name: /Cold-weather comfort/ }).check();
  await expect(page.getByText('£46,200')).toBeVisible();
  await expect(page.getByText('Sport', { exact: true }).last()).toBeVisible();
  await auditAccessibility(page, testInfo, { label: 'configurator-sport-selected' });
});

test('axe detects the deliberately broken paint accessible name', async ({ page }, testInfo) => {
  await page.goto('/?a11y-defect=paint-label');
  const results = await collectAccessibilityResults(page, testInfo, { label: 'deliberate-paint-name-defect' });
  expect(results.violations.map((violation) => violation.id)).toContain('label');
});

test('empty lead submission associates errors and focuses the summary', async ({ page }, testInfo) => {
  await page.getByRole('button', { name: 'Send my enquiry' }).click();
  await expect(page.getByRole('alert').getByRole('heading', { name: 'There’s a little more to complete' })).toBeVisible();
  await expectFocusWithin(page.getByRole('alert'));
  await expectValidationAssociation(page.getByLabel('First name'), page.locator('#firstName-error'));
  await expect(page.getByLabel('First name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('First name')).toHaveAttribute('aria-describedby', 'firstName-error');
  await auditAccessibility(page, testInfo, { label: 'lead-validation-errors' });
});

test('dealer autocomplete and privacy dialog work with the keyboard', async ({ page }, testInfo) => {
  const dealer = page.getByRole('combobox', { name: 'Preferred dealer' });
  await dealer.fill('Seattle');
  await expect(dealer).toHaveAttribute('aria-expanded', 'true');
  await dealer.press('ArrowDown');
  await expect(dealer).toHaveAttribute('aria-activedescendant', 'dealer-option-0');
  await dealer.press('Enter');
  await expect(dealer).toHaveValue('Northstar Seattle');
  const dialogTrigger = page.getByRole('button', { name: 'Read our contact and privacy information' });
  await dialogTrigger.click();
  const dialog = page.getByRole('dialog', { name: 'Contact and privacy information' });
  await expect(dialog).toBeVisible();
  await expectFocusWithin(dialog);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expectFocusRestored(dialogTrigger);
  await auditAccessibility(page, testInfo, { label: 'dealer-and-dialog' });
});

test('successful lead submission displays an accessible confirmation', async ({ page }, testInfo) => {
  await page.route('**/api/leads', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ reference: 'TEST-LEAD-001' }),
    });
  });
  await completeLeadForm(page);
  await page.getByRole('button', { name: 'Send my enquiry' }).click();
  await expect(page.getByRole('status')).toContainText('TEST-LEAD-001');
  await auditAccessibility(page, testInfo, { label: 'lead-success' });
});

test('failed lead submission keeps details and allows a successful retry', async ({ page }, testInfo) => {
  let attempts = 0;
  await page.route('**/api/leads', async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({ status: 503, body: 'Unavailable' });
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ reference: 'TEST-LEAD-RETRY' }),
    });
  });
  await completeLeadForm(page);
  await page.getByRole('button', { name: 'Send my enquiry' }).click();
  await expect(page.getByRole('status')).toContainText('could not send your enquiry');
  await expect(page.getByLabel('First name')).toHaveValue('Alex');
  await auditAccessibility(page, testInfo, { label: 'lead-failure-retry' });
  await page.getByRole('button', { name: 'Send my enquiry' }).click();
  await expect(page.getByRole('status')).toContainText('TEST-LEAD-RETRY');
});
