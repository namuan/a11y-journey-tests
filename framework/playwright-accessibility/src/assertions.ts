import { expect, type Locator } from '@playwright/test';

export async function expectAccessibleName(locator: Locator, name: string | RegExp) {
  await expect(locator).toHaveAccessibleName(name);
}

export async function expectAccessibleDescription(locator: Locator, description: string | RegExp) {
  await expect(locator).toHaveAccessibleDescription(description);
}

export async function expectFocusWithin(container: Locator) {
  const focusIsWithin = await container.evaluate((element) => (
    element === document.activeElement || element.contains(document.activeElement)
  ));
  expect(focusIsWithin, 'Expected keyboard focus to be within the supplied region').toBe(true);
}

export async function expectFocusRestored(trigger: Locator) {
  await expect(trigger, 'Expected keyboard focus to return to the triggering control').toBeFocused();
}

export async function expectValidationAssociation(control: Locator, error: Locator) {
  await expect(control).toHaveAttribute('aria-invalid', 'true');
  await expect(error).toBeVisible();
  const errorId = await error.getAttribute('id');
  expect(errorId, 'Expected the error message to have an id').toBeTruthy();
  const describedBy = await control.getAttribute('aria-describedby') ?? '';
  const errorMessage = await control.getAttribute('aria-errormessage') ?? '';
  expect(
    [describedBy, errorMessage].join(' ').split(/\s+/),
    'Expected the invalid control to reference its error via aria-describedby or aria-errormessage',
  ).toContain(errorId);
}
