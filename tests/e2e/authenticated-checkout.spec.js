import { test, expect } from "@playwright/test";

test.describe("authenticated checkout", () => {
  test("checkout prefills from the logged-in session and places an order", async ({ page }) => {
    const user = {
      name: "Auth Checkout Tester",
      email: `auth-checkout-${Date.now()}@example.test`,
      password: "correct-horse-battery-staple",
    };

    await page.goto("/signup");
    await page.getByLabel("Full name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.getByText(user.name)).toBeVisible();

    await page.goto("/");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.getByRole("link", { name: /Cart/ }).click();
    await page.getByRole("link", { name: "Proceed to checkout" }).click();

    await expect(page.getByLabel("Full name")).toHaveValue(user.name);
    await expect(page.getByLabel("Email")).toHaveValue(user.email);

    await page.getByLabel("Shipping address").fill("42 Authenticated Ave, Testville");
    await page.getByRole("button", { name: "Place order" }).click();

    await expect(page.getByRole("heading", { name: "Thank you for your order!" })).toBeVisible();
    await expect(page.getByText(/Order ID: ORD-/)).toBeVisible();
  });
});
