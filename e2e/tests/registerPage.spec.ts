import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { goFromHomePageToRegisterPage, registerWith } from "./helper";

test.describe("Register", () => {
  test.beforeEach(async ({ page }) => {
    await goFromHomePageToRegisterPage(page);
  });

  test("TC1.1: should register a new user when valid data is provided", async ({ page }) => {
    const formData = {
      name: faker.person.lastName(),
      firstname: faker.person.firstName(),
      street: faker.location.streetAddress(),
      number: faker.location.buildingNumber(),
      box: faker.location.secondaryAddress(),
      postalCode: faker.location.zipCode(),
      city: faker.location.city(),
      country: faker.location.country(),
      phoneNumber: faker.phone.number(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    await registerWith(page, formData);
  });

  test("TC2.1: should not register a new user when existing email is used", async ({ page }) => {
    
    const formData = {
      name: faker.person.lastName(),
      firstname: faker.person.firstName(),
      street: faker.location.streetAddress(),
      number: faker.location.buildingNumber(),
      box: faker.location.secondaryAddress(),
      postalCode: faker.location.zipCode(),
      city: faker.location.city(),
      country: faker.location.country(),
      phoneNumber: faker.phone.number(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    await registerWith(page, formData);
    
    await expect(page.getByText("Se déconnecter")).toBeVisible();
    
    await page.getByText("Se déconnecter").click();

    await goFromHomePageToRegisterPage(page);

    await registerWith(page, formData);

    const message = await page.waitForEvent(
      "console",
      (msg) => msg.type() === "error"
    );

    expect(message.text()).toContain("409");
  });
});