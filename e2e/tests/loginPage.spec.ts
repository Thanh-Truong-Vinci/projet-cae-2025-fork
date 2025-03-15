import { test, expect } from "@playwright/test";
import { goFromHomePageToLoginPage, loginWith } from "./helper";

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await goFromHomePageToLoginPage(page);
  });

  test("TC1.1: should login a user when valid data is provided", async ({ page }) => {
    const formData = {
      email: "testuser@gmail.com",
      password: "password",
      rememberMe: true,
    };

    await loginWith(page, formData);
  });

  test("TC2.1: should not login a user when the password is incorrect", async ({ page }) => {
    const formData = {
      email: "testuser@gmail.com",
      password: "wrongpassword",
      rememberMe: true,
    };

    await loginWith(page, formData);

    const message = await page.waitForEvent(
      "console",
      (msg) => msg.type() === "error"
    );

    expect(message.text()).toContain("401");
  });
});