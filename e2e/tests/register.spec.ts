import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { 
  goFromHomePageToRegisterPage, 
  registerWith
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
    phoneNumber: faker.phone.number(),
    email: faker.internet.email(),
    password: "test1234",
    confirmPassword: "test1234"
  };

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

  test("TC1.3: should not register a new user when passwords do not match", async ({ page }) => {
    // Modifier le mot de passe dans confirmPassword pour qu'il ne soit pas identique
    const userWithMismatchedPasswords = {
      ...testUser,
      confirmPassword: "differentPassword"
    };
    
    await registerWith(page, userWithMismatchedPasswords);
    
    await expect(page).toHaveURL("http://localhost:5173/register");
    
    await expect(page.getByText("Les mots de passe ne correspondent pas")).toBeVisible();
  });

  test("TC1.4: should show validation errors when submitting an empty form", async ({ page }) => {

    await page.getByRole("button", { name: "S'inscrire" }).click();
    
    
    await expect(page).toHaveURL("http://localhost:5173/register");
    
   
    await expect(page.getByText("Veuillez remplir tous les champs obligatoires.")).toBeVisible();
    
    const requiredFields = [
      "name-input",
      "firstname-input", 
      "civility-input",
      "street-input",
      "number-input",
      "postalCode-input",
      "city-input", 
      "country-input",
      "phoneNumber-input",
      "email-input",
      "password-input",
      "confirmPassword-input"
    ];
    
    // On fait une boucle for pour vérifier chaque champs individuellement (si elle affiche bien une erreur)
    for (const fieldId of requiredFields) {
      const fieldContainer = page.locator(`[data-testid="${fieldId}"]`);
      await expect(fieldContainer).toContainText("Ce champ est requis");
    }
  });

  test("TC1.5: should show validation errors for empty fields even when some fields are filled", async ({ page }) => {

    await page.locator('[data-testid="name-input"] input').fill("Dupont");
    await page.locator('[data-testid="firstname-input"] input').fill("Jean");
    await page.locator('[data-testid="civility-input"]').click();
    await page.getByRole("option", { name: "Monsieur" }).click();
    
    await page.getByRole("button", { name: "S'inscrire" }).click();
    
    await expect(page).toHaveURL("http://localhost:5173/register");
    
    await expect(page.getByText("Veuillez remplir tous les champs obligatoires.")).toBeVisible();
    
    const emptyFields = [
      "street-input",
      "number-input",
      "postalCode-input",
      "city-input", 
      "country-input",
      "phoneNumber-input",
      "email-input",
      "password-input",
      "confirmPassword-input"
    ];
    
    for (const fieldId of emptyFields) {
      const fieldContainer = page.locator(`[data-testid="${fieldId}"]`);
      await expect(fieldContainer).toContainText("Ce champ est requis");
    }
    
    const filledFields = [
      "name-input",
      "firstname-input",
      "civility-input"
    ];
    
    for (const fieldId of filledFields) {
      const fieldContainer = page.locator(`[data-testid="${fieldId}"]`);
      await expect(fieldContainer).not.toContainText("Ce champ est requis");
    }
  });

  test("TC1.6: should show error for a single missing field and succeed when filled", async ({ page }) => {
    // Créer un utilisateur avec tous les champs sauf l'email
    const userWithMissingEmail = {
      ...testUser,
      email: "",
    };
    
    // Remplir le formulaire avec tous les champs sauf l'email
    await page.locator('[data-testid="name-input"] input').fill(userWithMissingEmail.name);
    await page.locator('[data-testid="firstname-input"] input').fill(userWithMissingEmail.firstname);
    await page.locator('[data-testid="civility-input"]').click();
    await page.getByRole("option", { name: userWithMissingEmail.civility }).click();
    await page.locator('[data-testid="street-input"] input').fill(userWithMissingEmail.street);
    await page.locator('[data-testid="number-input"] input').fill(userWithMissingEmail.number);
    await page.locator('[data-testid="box-input"] input').fill(userWithMissingEmail.box);
    await page.locator('[data-testid="postalCode-input"] input').fill(userWithMissingEmail.postalCode);
    await page.locator('[data-testid="city-input"] input').fill(userWithMissingEmail.city);
    await page.locator('[data-testid="country-input"] input').fill(userWithMissingEmail.country);
    await page.locator('[data-testid="phoneNumber-input"] input').fill(userWithMissingEmail.phoneNumber);
    await page.locator('[data-testid="password-input"] input').fill(userWithMissingEmail.password);
    await page.locator('[data-testid="confirmPassword-input"] input').fill(userWithMissingEmail.confirmPassword);
    
    await page.getByRole("button", { name: "S'inscrire" }).click();
    
    await expect(page).toHaveURL("http://localhost:5173/register");
    
    await expect(page.getByText("Veuillez remplir tous les champs obligatoires.")).toBeVisible();
    
    await expect(page.locator('[data-testid="email-input"]')).toContainText("Ce champ est requis");
    
    // Vérifier qu'aucun autre champ n'affiche de message d'erreur
    const otherFields = [
      "name-input",
      "firstname-input", 
      "civility-input",
      "street-input",
      "number-input",
      "postalCode-input",
      "city-input", 
      "country-input",
      "phoneNumber-input",
      "password-input",
      "confirmPassword-input"
    ];
    
    for (const fieldId of otherFields) {
      const fieldContainer = page.locator(`[data-testid="${fieldId}"]`);
      await expect(fieldContainer).not.toContainText("Ce champ est requis");
    }
    
    const uniqueEmail = faker.internet.email();
    await page.locator('[data-testid="email-input"] input').fill(uniqueEmail);
    await expect(page.locator('[data-testid="email-input"]')).not.toContainText("Ce champ est requis");
    
    await page.getByRole("button", { name: "S'inscrire" }).click();
    
    await expect(page).toHaveURL("http://localhost:5173/login");
    
    await expect(page.getByText("Se connecter")).toBeVisible();
  });
});