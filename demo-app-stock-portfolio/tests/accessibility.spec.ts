import {
  auditAccessibility,
  expectAccessibleName,
  expectFocusWithin,
  expectValidationAssociation,
} from '@poc/playwright-accessibility';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('portfolio overview and holdings table are accessible', async ({ page }, testInfo) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Your portfolio' })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Current investment holdings and market values' })).toBeVisible();
  await expect(page.getByRole('row', { name: /VTI Total Market ETF/ })).toBeVisible();
  await expectAccessibleName(page.getByRole('combobox', { name: 'Investment' }), 'Investment');
  await expectAccessibleName(page.getByRole('button', { name: 'Review buy order' }), 'Review buy order');
  await auditAccessibility(page, testInfo, { label: 'portfolio-initial' });
});

test('invalid trade quantity is associated with an error and receives focus', async ({ page }, testInfo) => {
  const quantity = page.getByRole('spinbutton', { name: 'Number of shares' });
  await quantity.fill('0');
  await page.getByRole('button', { name: 'Review buy order' }).click();
  await expect(page.getByRole('alert').getByRole('heading', { name: 'Check your order' })).toBeVisible();
  await expectFocusWithin(page.getByRole('alert'));
  await expectValidationAssociation(quantity, page.locator('#shares-error'));
  await expect(quantity).toHaveAttribute('aria-describedby', 'shares-error');
  await auditAccessibility(page, testInfo, { label: 'trade-validation-error' });
});

test('successful mock trade updates holdings and account values', async ({ page }, testInfo) => {
  await page.route('**/api/trades', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ reference: 'MOCK-TRADE-001' }),
    });
  });
  await page.getByRole('spinbutton', { name: 'Number of shares' }).fill('2');
  await page.getByRole('button', { name: 'Review buy order' }).click();
  await expect(page.getByRole('status')).toContainText('MOCK-TRADE-001');
  await expect(page.getByRole('row', { name: /VTI Total Market ETF 14/ })).toBeVisible();
  await auditAccessibility(page, testInfo, { label: 'trade-success' });
});

test('sell validation prevents trading more shares than owned', async ({ page }) => {
  await page.getByRole('radio', { name: 'Sell' }).check();
  await page.getByRole('spinbutton', { name: 'Number of shares' }).fill('13');
  await page.getByRole('button', { name: 'Review sell order' }).click();
  await expect(page.getByRole('alert')).toContainText('You can sell up to 12 shares of VTI.');
  await expect(page.getByRole('status')).toBeEmpty();
});

test('failed mock trade keeps order details and supports retry', async ({ page }, testInfo) => {
  let attempts = 0;
  await page.route('**/api/trades', async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({ status: 503, body: 'Unavailable' });
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ reference: 'MOCK-TRADE-RETRY' }),
    });
  });
  const quantity = page.getByRole('spinbutton', { name: 'Number of shares' });
  await quantity.fill('2');
  await page.getByRole('button', { name: 'Review buy order' }).click();
  await expect(page.getByRole('status')).toContainText('could not place your order');
  await expect(quantity).toHaveValue('2');
  await auditAccessibility(page, testInfo, { label: 'trade-service-failure' });
  await page.getByRole('button', { name: 'Review buy order' }).click();
  await expect(page.getByRole('status')).toContainText('MOCK-TRADE-RETRY');
});
