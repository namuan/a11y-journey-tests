import { expect, type Locator, type Page } from '@playwright/test';

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

export type LiveRegionOptions = {
  politeness?: 'polite' | 'assertive';
};

export async function expectLiveRegionUpdate(
  region: Locator,
  expectedText: string | RegExp,
  options: LiveRegionOptions = {},
) {
  const role = await region.getAttribute('role');
  const explicitPoliteness = await region.getAttribute('aria-live');
  const implicitPoliteness = role === 'status' || role === 'log'
    ? 'polite'
    : role === 'alert'
      ? 'assertive'
      : undefined;
  const actualPoliteness = explicitPoliteness === null
    ? implicitPoliteness
    : explicitPoliteness === 'off'
      ? undefined
      : explicitPoliteness;
  expect(
    actualPoliteness,
    'Expected a live region with the requested announcement politeness',
  ).toBe(options.politeness ?? 'polite');
  await expect(region).toContainText(expectedText);
}

export type ComboboxStateOptions = {
  expanded: boolean;
  listbox?: Locator;
  activeOption?: Locator;
  selectedOption?: Locator;
  value?: string | RegExp;
};

export async function expectComboboxState(combobox: Locator, options: ComboboxStateOptions) {
  await expect(combobox).toHaveAttribute('aria-expanded', String(options.expanded));

  if (options.value !== undefined) {
    await expect(combobox).toHaveValue(options.value);
  }

  if (options.listbox) {
    await expect(options.listbox).toHaveAttribute('role', 'listbox');
    const listboxId = await options.listbox.getAttribute('id');
    expect(listboxId, 'Expected the listbox to have an id').toBeTruthy();
    const controlledIds = await combobox.getAttribute('aria-controls') ?? '';
    expect(controlledIds.split(/\s+/), 'Expected aria-controls to reference the listbox').toContain(listboxId);
    if (options.expanded) await expect(options.listbox).toBeVisible();
  }

  if (options.activeOption) {
    await expect(options.activeOption).toHaveAttribute('role', 'option');
    await expect(options.activeOption).toBeVisible();
    const activeOptionId = await options.activeOption.getAttribute('id');
    expect(activeOptionId, 'Expected the active option to have an id').toBeTruthy();
    await expect(combobox).toHaveAttribute('aria-activedescendant', activeOptionId!);
  }

  if (options.selectedOption) {
    await expect(options.selectedOption).toHaveAttribute('role', 'option');
    await expect(options.selectedOption).toHaveAttribute('aria-selected', 'true');
  }
}

export type HorizontalOverflowOptions = {
  tolerance?: number;
  allowedScrollableRegions?: readonly Locator[];
};

export async function expectNoHorizontalOverflow(page: Page, options: HorizontalOverflowOptions = {}) {
  const tolerance = options.tolerance ?? 1;
  const { viewportWidth, documentWidth } = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));

  expect(
    documentWidth,
    `Expected document width (${documentWidth}px) not to exceed viewport width (${viewportWidth}px) by more than ${tolerance}px`,
  ).toBeLessThanOrEqual(viewportWidth + tolerance);

  for (const region of options.allowedScrollableRegions ?? []) {
    const dimensions = await region.evaluate((element) => ({
      overflowX: window.getComputedStyle(element).overflowX,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(['auto', 'scroll'], 'Allowed regions must explicitly support horizontal scrolling').toContain(dimensions.overflowX);
    expect(dimensions.scrollWidth, 'Allowed scroll regions should contain horizontally scrollable content').toBeGreaterThan(dimensions.clientWidth);
  }
}
