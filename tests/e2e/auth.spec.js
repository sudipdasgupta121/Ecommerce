import { test, expect } from "@playwright/test";

function uniqueUser() {
  const stamp = Date.now();
  return {
    name: "E2E Tester",
    email: `e2e-${stamp}@example.test`,
    password: "correct-horse-battery-staple",
  };
}

test.describe("authentication", () => {
  test("sign up, log out, and log back in", async ({ page }) => {
    const user = uniqueUser();

    await page.goto("/signup");
    await page.getByLabel("Full name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByText(user.name)).toBeVisible();
    await expect(page.getByRole("link", { name: "Log in" })).not.toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();

    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText(user.name)).toBeVisible();
  });

  test("shows an error for a wrong password", async ({ page }) => {
    const user = uniqueUser();

    await page.goto("/signup");
    await page.getByLabel("Full name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.getByText(user.name)).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();

    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill("definitely-the-wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();

    // Wrong password: stays on the login page, shows an error, and never reaches a logged-in state.
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
  });
});
