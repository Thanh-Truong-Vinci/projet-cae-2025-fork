import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { 
  loginWith,
  goFromHomePageToLoginPage
} from "./helper";

test.describe("register-manager", () => {

    test.beforeEach(async ({ page }) => {
        await goFromHomePageToLoginPage(page);
        await loginWith(page, {
          email: "admin@example.com",
          password: "Azqwazqw1@",
          rememberMe: true
        });
        await expect(page).toHaveURL("/manager-dashboard");
        await expect(page.getByLabel("se-déconnecter")).toBeVisible();
    });

    test("TC5.1: should register a new manager successfully", async ({ page }) => {
        const managerData = {
            name: faker.person.lastName(),
            firstname: faker.person.firstName(),
            email: faker.internet.email(),
            password: "Password123!",
            confirmPassword: "Password123!"
        };
        
        await page.getByText("Nouveau gestionnaire").click();
        
        await expect(page).toHaveURL("/register-manager");
        await expect(page.getByText("Inscrire un gestionnaire")).toBeVisible();
        
        // Remplir le formulaire
        await page.locator('[data-testid="name-input"] input').fill(managerData.name);
        await page.locator('[data-testid="firstname-input"] input').fill(managerData.firstname);
        await page.locator('[data-testid="email-input"] input').fill(managerData.email);
        await page.locator('[data-testid="password-input"] input').fill(managerData.password);
        await page.locator('[data-testid="confirm-password-input"] input').fill(managerData.confirmPassword);
        
        await page.getByTestId("submit-button").click();
        
        await expect(page.getByText("Inscription réussie !")).toBeVisible();
        await expect(page.getByText("Le compte gestionnaire a été créé avec succès.")).toBeVisible();
        await expect(page.getByText("Vous allez être redirigé vers la page de connexion dans quelques instants...")).toBeVisible();
        
        await expect(page.locator("circle")).toBeVisible();
        
        await expect(page).toHaveURL("/manager-dashboard");
    });
    
    test("TC5.2: should show error when email is already in use", async ({ page }) => {
        // Utiliser un email qui existe déjà dans le système
        const managerData = {
            name: faker.person.lastName(),
            firstname: faker.person.firstName(),
            email: "admin@example.com", // Email déjà utilisé
            password: "Password123!",
            confirmPassword: "Password123!"
        };
        
        await page.getByText("Nouveau gestionnaire").click();
        await expect(page).toHaveURL("/register-manager");
        
        await page.locator('[data-testid="name-input"] input').fill(managerData.name);
        await page.locator('[data-testid="firstname-input"] input').fill(managerData.firstname);
        await page.locator('[data-testid="email-input"] input').fill(managerData.email);
        await page.locator('[data-testid="password-input"] input').fill(managerData.password);
        await page.locator('[data-testid="confirm-password-input"] input').fill(managerData.confirmPassword);
        
        await page.getByTestId("submit-button").click();
        
        await expect(page.getByText("Cette adresse email est déjà utilisée.")).toBeVisible();
        
        await expect(page).toHaveURL("/register-manager");
    });
    
    test("TC5.3: should show error when password is too weak", async ({ page }) => {
        const managerData = {
            name: faker.person.lastName(),
            firstname: faker.person.firstName(),
            email: faker.internet.email(),
            password: "password", // Mot de passe trop faible
            confirmPassword: "password"
        };
        
        await page.getByText("Nouveau gestionnaire").click();
        await expect(page).toHaveURL("/register-manager");
        
        await page.locator('[data-testid="name-input"] input').fill(managerData.name);
        await page.locator('[data-testid="firstname-input"] input').fill(managerData.firstname);
        await page.locator('[data-testid="email-input"] input').fill(managerData.email);
        await page.locator('[data-testid="password-input"] input').fill(managerData.password);
        await page.locator('[data-testid="confirm-password-input"] input').fill(managerData.confirmPassword);
        
        await page.getByTestId("submit-button").click();
        
        await expect(page.getByText("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.")).toBeVisible();
        
        await expect(page).toHaveURL("/register-manager");
    });
    
    test("TC5.4: should show error when passwords do not match", async ({ page }) => {
        const managerData = {
            name: faker.person.lastName(),
            firstname: faker.person.firstName(),
            email: faker.internet.email(),
            password: "Password123!", // Mot de passe fort
            confirmPassword: "DifferentPassword123!" // Password de confirmation différent du password
        };
        
        await page.getByText("Nouveau gestionnaire").click();
        await expect(page).toHaveURL("/register-manager");
        
        await page.locator('[data-testid="name-input"] input').fill(managerData.name);
        await page.locator('[data-testid="firstname-input"] input').fill(managerData.firstname);
        await page.locator('[data-testid="email-input"] input').fill(managerData.email);
        await page.locator('[data-testid="password-input"] input').fill(managerData.password);
        await page.locator('[data-testid="confirm-password-input"] input').fill(managerData.confirmPassword);
        
        await page.getByTestId("submit-button").click();
        
        await expect(page.getByText("Les mots de passe ne correspondent pas.")).toBeVisible();
        
        await expect(page).toHaveURL("/register-manager");
    });
});