import { test, expect } from "@playwright/test";

test.describe("browsing and cart", () => {
  test("view a product detail page and add it to cart", async ({ page }) => {
    await page.goto("/");
    const firstProductLink = page.locator('a[href^="/product/"]').first();
    const productName = await firstProductLink.textContent();
    await firstProductLink.click();

    await expect(page.getByRole("heading", { name: productName.trim() })).toBeVisible();
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByText("Added to cart ✓")).toBeVisible();

    // Header cart badge reflects the addition.
    await expect(page.getByRole("link", { name: /Cart/ }).locator("span")).toHaveText("1");
  });

  test("update quantity and remove an item from the cart page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.getByRole("link", { name: /Cart/ }).click();

    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible();
    await page.getByRole("button", { name: "Increase quantity" }).click();
    // The header cart badge sums quantities, so it's the unambiguous way to confirm the
    // increase landed (the stepper's own value span isn't uniquely identifiable by role/text).
    await expect(page.getByRole("link", { name: /Cart/ }).locator("span")).toHaveText("2");

    await page.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
  });
});
