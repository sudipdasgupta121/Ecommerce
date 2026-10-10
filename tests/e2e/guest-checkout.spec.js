import { test, expect } from "@playwright/test";

test.describe("guest checkout", () => {
  test("places an order as a guest and clears the cart", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.getByRole("link", { name: /Cart/ }).click();
    await page.getByRole("link", { name: "Proceed to checkout" }).click();

    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    await page.getByLabel("Full name").fill("Guest Tester");
    await page.getByLabel("Email").fill(`guest-${Date.now()}@example.test`);
    await page.getByLabel("Shipping address").fill("1 Test Way, Testville");
    await page.getByRole("button", { name: "Place order" }).click();

    await expect(page.getByRole("heading", { name: "Thank you for your order!" })).toBeVisible();
    await expect(page.getByText(/Order ID: ORD-/)).toBeVisible();

    // Cart was cleared by placeOrder() — badge should be gone.
    await page.goto("/cart");
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
  });

  test("validates required checkout fields", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.getByRole("link", { name: /Cart/ }).click();
    await page.getByRole("link", { name: "Proceed to checkout" }).click();

    await page.getByRole("button", { name: "Place order" }).click();
    await expect(page.getByText("Name is required.")).toBeVisible();
    await expect(page.getByText("Email is required.")).toBeVisible();
    await expect(page.getByText("Shipping address is required.")).toBeVisible();
  });
});
