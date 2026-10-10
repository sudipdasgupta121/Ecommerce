import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("home page loads and lists products", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByPlaceholder("Search products...")).toBeVisible();
    await expect(page.getByRole("link", { name: "Shopfront" })).toBeVisible();
    // Seeded catalog should render at least one product card with an "Add to cart" action.
    await expect(page.getByRole("button", { name: "Add to cart" }).first()).toBeVisible();
  });

  test("search filters the product grid", async ({ page }) => {
    await page.goto("/");
    const search = page.getByPlaceholder("Search products...");
    await search.fill("zzzzzz-no-such-product-zzzzzz");
    await expect(page.getByText("No products match your search.")).toBeVisible();

    await search.fill("");
    await expect(page.getByRole("button", { name: "Add to cart" }).first()).toBeVisible();
  });

  test("an unknown route shows the 404 page", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
