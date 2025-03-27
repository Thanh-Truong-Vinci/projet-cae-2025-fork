import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { 
  goFromHomePageToRegisterPage, 
  registerWith, 
  goFromHomePageToLoginPage, 
  loginWith 
} from "./helper";

const testUser = {
  name: faker.person.lastName(),
  firstname: faker.person.firstName(),
  civility: "Monsieur",
  street: faker.location.streetAddress(),
  number: faker.location.buildingNumber(),
  box: faker.location.secondaryAddress(),
  postalCode: faker.location.zipCode(),
  city: faker.location.city(),
  country: faker.location.country(),
  phoneNumber: "+32496385684",
  email: faker.internet.email(),
  password: "Test1234!",
  confirmPassword: "Test1234!"
};

// Tests de connexion
test.describe("Login", () => {
  // Créer l'utilisateur avant les tests de connexion (pour qu'elle soit disponible pour tous les tests)
  test.beforeAll(async ({ browser }) => {

    const page = await browser.newPage();
    
    await goFromHomePageToRegisterPage(page);
    await registerWith(page, testUser);
    
    await page.close();
  });
  
  test.beforeEach(async ({ page }) => {
    await goFromHomePageToLoginPage(page);
  });

  test("TC2.1: should login a user when valid data is provided", async ({ page }) => {

    const formData = {
      email: testUser.email,
      password: testUser.password,
      rememberMe: true,
    };

    await loginWith(page, formData);

    await expect(page).toHaveURL("/")

    const welcomeMessage = await page.getByText(`Bonjour ${testUser.name} ${testUser.firstname}`);
    await expect(welcomeMessage).toBeVisible();
  });

  test("TC2.2: should successfully logout when user clicks on logout button", async ({ page }) => {
      const formData = {
        email: testUser.email,
        password: testUser.password,
        rememberMe: true,
      };

      await loginWith(page, formData);

      await expect(page).toHaveURL("/");

      const welcomeMessage = await page.getByText(`Bonjour ${testUser.name} ${testUser.firstname}`);
      await expect(welcomeMessage).toBeVisible();

      await expect(page.getByText("Se déconnecter")).toBeVisible();
      await page.getByText("Se déconnecter").click();

      await expect(page).toHaveURL("/")
      await expect(page.getByText("Inscription")).toBeVisible();
    });

  test("TC2.3: should not login a user when the password is incorrect", async ({ page }) => {
    const formData = {
      email: testUser.email,
      password: "wrongpassword",
      rememberMe: true,
    };

    await loginWith(page, formData);

    await expect(page.getByText("Email ou mot de passe incorrect.")).toBeVisible();
  });

  test("TC2.4: should not login a user when the email doesn't exist", async ({ page }) => {
      const formData = {
        email: "notexist" + faker.internet.email(),
        password: "test123",
        rememberMe: true,
      };

      await loginWith(page, formData);

      await expect(page.getByText("Email ou mot de passe incorrect.")).toBeVisible();
    });
});