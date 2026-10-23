import { expect, type Locator } from '@playwright/test';

export async function expectAccessibleName(locator: Locator, name: string | RegExp) {
  await expect(locator).toHaveAccessibleName(name);
}

export async function expectAccessibleDescription(locator: Locator, description: string | RegExp) {
  await expect(locator).toHaveAccessibleDescription(description);
}
