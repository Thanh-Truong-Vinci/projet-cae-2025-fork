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
    street: faker.location.streetAddress(),
    number: faker.location.buildingNumber(),
    box: faker.location.secondaryAddress(),
    postalCode: faker.location.zipCode(),
    city: faker.location.city(),
    country: faker.location.country(),
    phoneNumber: faker.phone.number(),
    email: faker.internet.email(),
    password: "test123",
    confirmPassword: "test123"
  };

test.describe("Authentication", () => {
  // Tests d'inscription
  test.describe("Register", () => {
    test.beforeEach(async ({ page }) => {
      await goFromHomePageToRegisterPage(page);
    });

    test("TC1.1: should register a new user when valid data is provided", async ({ page }) => {

      await registerWith(page, testUser);

      await expect(page).toHaveURL("http://localhost:5173/login");
      await expect(page.getByText("Se connecter")).toBeVisible();
    });

    test("TC1.2: should not register a new user when existing email is used", async ({ page }) => {
      // Première inscription avec testUser
      await registerWith(page, testUser);
      
      await expect(page).toHaveURL("http://localhost:5173/login");
      
      await goFromHomePageToRegisterPage(page);
      
      // Tenter de s'inscrire à nouveau avec le même email
      await registerWith(page, testUser);
      
      await expect(page.getByText("Cette adresse email est déjà utilisée.")).toBeVisible();
    });
  });

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

      await expect(page).toHaveURL("http://localhost:5173/");

      const welcomeMessage = await page.getByText(`Hello dear ${testUser.email}`);
      await expect(welcomeMessage).toBeVisible();
    });

    test("TC2.2: should successfully logout when user clicks on logout button", async ({ page }) => {
        const formData = {
          email: testUser.email,
          password: testUser.password,
          rememberMe: true,
        };
  
        await loginWith(page, formData);
  
        await expect(page).toHaveURL("http://localhost:5173/");
  
        const welcomeMessage = await page.getByText(`Hello dear ${testUser.email}`);
        await expect(welcomeMessage).toBeVisible();

        await expect(page.getByText("Se déconnecter")).toBeVisible();
        await page.getByText("Se déconnecter").click();

        await expect(page).toHaveURL("http://localhost:5173/")
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
});