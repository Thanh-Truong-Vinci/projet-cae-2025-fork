import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { 
  loginWith,
  goFromHomePageToLoginPage
} from "./helper";

test.describe("register-producer", () => {

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

    test("TC6.1: should register a new producer successfully", async ({ page }) => {
        const producerData = {
            name: faker.person.lastName(),
            firstname: faker.person.firstName(),
            company: faker.company.name(),
            street: faker.location.street(),
            number: faker.number.int({ min: 1, max: 999 }).toString(),
            box: faker.location.secondaryAddress(),
            postalCode: faker.location.zipCode(),
            city: faker.location.city(),
            country: "Belgique",
            phoneNumber: "+324" + faker.string.numeric(8),
            email: faker.internet.email(),
            password: "Password123!",
            confirmPassword: "Password123!"
        };
        
        await page.getByText("Nouveau producteur").click();
        
        await expect(page).toHaveURL("/register-producer");
        await expect(page.getByText("Inscrire un producteur")).toBeVisible();
        
        await page.locator('[data-testid="name-input"] input').fill(producerData.name);
        await page.locator('[data-testid="firstname-input"] input').fill(producerData.firstname);
        await page.locator('[data-testid="company-input"] input').fill(producerData.company);
        await page.locator('[data-testid="street-input"] input').fill(producerData.street);
        await page.locator('[data-testid="number-input"] input').fill(producerData.number);
        await page.locator('[data-testid="box-input"] input').fill(producerData.box);
        await page.locator('[data-testid="postalCode-input"] input').fill(producerData.postalCode);
        await page.locator('[data-testid="city-input"] input').fill(producerData.city);
        await page.locator('[data-testid="country-input"] input').fill(producerData.country);
        await page.locator('[data-testid="phoneNumber-input"] input').fill(producerData.phoneNumber);
        await page.locator('[data-testid="email-input"] input').fill(producerData.email);
        await page.locator('[data-testid="password-input"] input').fill(producerData.password);
        await page.locator('[data-testid="confirm-password-input"] input').fill(producerData.confirmPassword);
        
        await page.getByTestId("submit-button").click();
        
        await expect(page.getByText("Inscription réussie !")).toBeVisible();
        await expect(page.getByText("Le compte producteur a été créé avec succès.")).toBeVisible();
        await expect(page.getByText("Vous allez être redirigé vers la page de connexion dans quelques instants...")).toBeVisible();
        
        await expect(page.locator("circle")).toBeVisible();
    });
    
    test("TC6.2: should show error when email is already in use", async ({ page }) => {
        const producerData = {
            name: faker.person.lastName(),
            firstname: faker.person.firstName(),
            company: faker.company.name(),
            street: faker.location.street(),
            number: faker.number.int({ min: 1, max: 999 }).toString(),
            box: faker.location.secondaryAddress(),
            postalCode: faker.location.zipCode(),
            city: faker.location.city(),
            country: "Belgique",
            phoneNumber: "+324" + faker.string.numeric(6),
            email: "admin@example.com",
            password: "Password123!",
            confirmPassword: "Password123!"
        };
        
        await page.getByText("Nouveau producteur").click();
        await expect(page).toHaveURL("/register-producer");
        
        await page.locator('[data-testid="name-input"] input').fill(producerData.name);
        await page.locator('[data-testid="firstname-input"] input').fill(producerData.firstname);
        await page.locator('[data-testid="company-input"] input').fill(producerData.company);
        await page.locator('[data-testid="street-input"] input').fill(producerData.street);
        await page.locator('[data-testid="number-input"] input').fill(producerData.number);
        await page.locator('[data-testid="box-input"] input').fill(producerData.box);
        await page.locator('[data-testid="postalCode-input"] input').fill(producerData.postalCode);
        await page.locator('[data-testid="city-input"] input').fill(producerData.city);
        await page.locator('[data-testid="country-input"] input').fill(producerData.country);
        await page.locator('[data-testid="phoneNumber-input"] input').fill(producerData.phoneNumber);
        await page.locator('[data-testid="email-input"] input').fill(producerData.email);
        await page.locator('[data-testid="password-input"] input').fill(producerData.password);
        await page.locator('[data-testid="confirm-password-input"] input').fill(producerData.confirmPassword);
        
        await page.getByTestId("submit-button").click();
        
        await expect(page.getByText("Cette adresse email est déjà utilisée.")).toBeVisible();
        await expect(page).toHaveURL("/register-producer");
    });
    
    test("TC6.3: should show error when password is too weak", async ({ page }) => {
        const producerData = {
            name: faker.person.lastName(),
            firstname: faker.person.firstName(),
            company: faker.company.name(),
            street: faker.location.street(),
            number: faker.number.int({ min: 1, max: 999 }).toString(),
            box: faker.location.secondaryAddress(),
            postalCode: faker.location.zipCode(),
            city: faker.location.city(),
            country: "Belgique",
            phoneNumber: "+324" + faker.string.numeric(6),
            email: faker.internet.email(),
            password: "password", // Mot de passe trop faible
            confirmPassword: "password"
        };
        
        await page.getByText("Nouveau producteur").click();
        await expect(page).toHaveURL("/register-producer");
        
        await page.locator('[data-testid="name-input"] input').fill(producerData.name);
        await page.locator('[data-testid="firstname-input"] input').fill(producerData.firstname);
        await page.locator('[data-testid="company-input"] input').fill(producerData.company);
        await page.locator('[data-testid="street-input"] input').fill(producerData.street);
        await page.locator('[data-testid="number-input"] input').fill(producerData.number);
        await page.locator('[data-testid="box-input"] input').fill(producerData.box);
        await page.locator('[data-testid="postalCode-input"] input').fill(producerData.postalCode);
        await page.locator('[data-testid="city-input"] input').fill(producerData.city);
        await page.locator('[data-testid="country-input"] input').fill(producerData.country);
        await page.locator('[data-testid="phoneNumber-input"] input').fill(producerData.phoneNumber);
        await page.locator('[data-testid="email-input"] input').fill(producerData.email);
        await page.locator('[data-testid="password-input"] input').fill(producerData.password);
        await page.locator('[data-testid="confirm-password-input"] input').fill(producerData.confirmPassword);
        
        await page.getByTestId("submit-button").click();
        
        await expect(page.getByText("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.")).toBeVisible();
        await expect(page).toHaveURL("/register-producer");
    });
    
    test("TC6.4: should show error when passwords do not match", async ({ page }) => {
        const producerData = {
            name: faker.person.lastName(),
            firstname: faker.person.firstName(),
            company: faker.company.name(),
            street: faker.location.street(),
            number: faker.number.int({ min: 1, max: 999 }).toString(),
            box: faker.location.secondaryAddress(),
            postalCode: faker.location.zipCode(),
            city: faker.location.city(),
            country: "Belgique",
            phoneNumber: "+324" + faker.string.numeric(6),
            email: faker.internet.email(),
            password: "Password123!",
            confirmPassword: "DifferentPassword123!"
        };
        
        await page.getByText("Nouveau producteur").click();
        await expect(page).toHaveURL("/register-producer");
        
        await page.locator('[data-testid="name-input"] input').fill(producerData.name);
        await page.locator('[data-testid="firstname-input"] input').fill(producerData.firstname);
        await page.locator('[data-testid="company-input"] input').fill(producerData.company);
        await page.locator('[data-testid="street-input"] input').fill(producerData.street);
        await page.locator('[data-testid="number-input"] input').fill(producerData.number);
        await page.locator('[data-testid="box-input"] input').fill(producerData.box);
        await page.locator('[data-testid="postalCode-input"] input').fill(producerData.postalCode);
        await page.locator('[data-testid="city-input"] input').fill(producerData.city);
        await page.locator('[data-testid="country-input"] input').fill(producerData.country);
        await page.locator('[data-testid="phoneNumber-input"] input').fill(producerData.phoneNumber);
        await page.locator('[data-testid="email-input"] input').fill(producerData.email);
        await page.locator('[data-testid="password-input"] input').fill(producerData.password);
        await page.locator('[data-testid="confirm-password-input"] input').fill(producerData.confirmPassword);
        
        await page.getByTestId("submit-button").click();
        
        await expect(page.getByText("Les mots de passe ne correspondent pas.")).toBeVisible();
        await expect(page).toHaveURL("/register-producer");
    });
    
    test("TC6.5: should show error when number field contains non-digit characters", async ({ page }) => {
        const producerData = {
            name: faker.person.lastName(),
            firstname: faker.person.firstName(),
            company: faker.company.name(),
            street: faker.location.street(),
            number: "123A", // Contient une lettre
            box: faker.location.secondaryAddress(),
            postalCode: faker.location.zipCode(),
            city: faker.location.city(),
            country: "Belgique",
            phoneNumber: "+324" + faker.string.numeric(6),
            email: faker.internet.email(),
            password: "Password123!",
            confirmPassword: "Password123!"
        };
        
        await page.getByText("Nouveau producteur").click();
        
        await page.locator('[data-testid="name-input"] input').fill(producerData.name);
        await page.locator('[data-testid="firstname-input"] input').fill(producerData.firstname);
        await page.locator('[data-testid="company-input"] input').fill(producerData.company);
        await page.locator('[data-testid="street-input"] input').fill(producerData.street);
        await page.locator('[data-testid="number-input"] input').fill(producerData.number);
        await page.locator('[data-testid="box-input"] input').fill(producerData.box);
        await page.locator('[data-testid="postalCode-input"] input').fill(producerData.postalCode);
        await page.locator('[data-testid="city-input"] input').fill(producerData.city);
        await page.locator('[data-testid="country-input"] input').fill(producerData.country);
        await page.locator('[data-testid="phoneNumber-input"] input').fill(producerData.phoneNumber);
        await page.locator('[data-testid="email-input"] input').fill(producerData.email);
        await page.locator('[data-testid="password-input"] input').fill(producerData.password);
        await page.locator('[data-testid="confirm-password-input"] input').fill(producerData.confirmPassword);
        
        await page.getByTestId("submit-button").click();
        
        await expect(page.getByText("Le numéro doit contenir uniquement des chiffres")).toBeVisible();
        await expect(page).toHaveURL("/register-producer");
    });
    
    test("TC6.6: should show error when phone number has invalid format", async ({ page }) => {
        const producerData = {
            name: faker.person.lastName(),
            firstname: faker.person.firstName(),
            company: faker.company.name(),
            street: faker.location.street(),
            number: faker.number.int({ min: 1, max: 999 }).toString(),
            box: faker.location.secondaryAddress(),
            postalCode: faker.location.zipCode(),
            city: faker.location.city(),
            country: "Belgique",
            phoneNumber: "abcdefghij", // Format invalide
            email: faker.internet.email(),
            password: "Password123!",
            confirmPassword: "Password123!"
        };
        
        await page.getByText("Nouveau producteur").click();
        
        await page.locator('[data-testid="name-input"] input').fill(producerData.name);
        await page.locator('[data-testid="firstname-input"] input').fill(producerData.firstname);
        await page.locator('[data-testid="company-input"] input').fill(producerData.company);
        await page.locator('[data-testid="street-input"] input').fill(producerData.street);
        await page.locator('[data-testid="number-input"] input').fill(producerData.number);
        await page.locator('[data-testid="box-input"] input').fill(producerData.box);
        await page.locator('[data-testid="postalCode-input"] input').fill(producerData.postalCode);
        await page.locator('[data-testid="city-input"] input').fill(producerData.city);
        await page.locator('[data-testid="country-input"] input').fill(producerData.country);
        await page.locator('[data-testid="phoneNumber-input"] input').fill(producerData.phoneNumber);
        await page.locator('[data-testid="email-input"] input').fill(producerData.email);
        await page.locator('[data-testid="password-input"] input').fill(producerData.password);
        await page.locator('[data-testid="confirm-password-input"] input').fill(producerData.confirmPassword);
        
        await page.getByTestId("submit-button").click();
        
        await expect(page.getByText("Le numéro de téléphone doit commencer par + ou 0 et avoir 6-14 chiffres en plus")).toBeVisible();
        await expect(page).toHaveURL("/register-producer");
    });
});