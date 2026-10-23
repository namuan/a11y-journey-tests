import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('interactive elements expose accessible names', async ({ page }) => {
  const controls = page.locator('a[href], button, input:not([type="hidden"]), select, textarea, [role="combobox"]');
  const count = await controls.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    await expect(controls.nth(index)).toHaveAccessibleName(/\S+/);
  }
});

test('important page structure and control semantics are exposed', async ({ page }) => {
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('radio', { name: 'Northstar E1 All-electric SUV From £42,500' })).toBeChecked();
  await expect(page.getByRole('combobox', { name: 'Preferred dealer' })).toHaveAttribute('aria-autocomplete', 'list');
  await expect(page.getByRole('button', { name: 'Send my enquiry' })).toBeEnabled();
});

test('non-text visuals are decorative or have alternatives', async ({ page }) => {
  const images = page.locator('img');
  for (let index = 0; index < await images.count(); index += 1) {
    const image = images.nth(index);
    const hidden = await image.getAttribute('aria-hidden') === 'true';
    if (!hidden) await expect(image).toHaveAttribute('alt');
  }
  for (const selector of ['.car-art', '.swatch']) {
    const visuals = page.locator(selector);
    for (let index = 0; index < await visuals.count(); index += 1) {
      await expect(visuals.nth(index)).toHaveAttribute('aria-hidden', 'true');
    }
  }
});
