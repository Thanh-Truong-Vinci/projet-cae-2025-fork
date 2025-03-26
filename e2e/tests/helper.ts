import { Page, expect } from "@playwright/test";

const goFromHomePageToRegisterPage = async (page: Page) => {
  await page.goto("/");
  await page.getByText("Inscription").click();
  await expect(page).toHaveURL("/register");
};

const registerWith = async (page: Page, formData: { 
  name: string;
  firstname: string;
  civility: string;
  street: string;
  number: string;
  box: string;
  postalCode: string;
  city: string;
  country: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  await page.locator('[data-testid="name-input"] input').fill(formData.name);
  await page.locator('[data-testid="firstname-input"] input').fill(formData.firstname);
  await page.locator('[data-testid="civility-input"]').click();
  await page.getByRole("option", { name: formData.civility }).click();
  await page.locator('[data-testid="street-input"] input').fill(formData.street);
  await page.locator('[data-testid="number-input"] input').fill(formData.number);
  await page.locator('[data-testid="box-input"] input').fill(formData.box);
  await page.locator('[data-testid="postalCode-input"] input').fill(formData.postalCode);
  await page.locator('[data-testid="city-input"] input').fill(formData.city);
  await page.locator('[data-testid="country-input"] input').fill(formData.country);
  await page.locator('[data-testid="phoneNumber-input"] input').fill(formData.phoneNumber);
  await page.locator('[data-testid="email-input"] input').fill(formData.email);
  await page.locator('[data-testid="password-input"] input').fill(formData.password);
  await page.locator('[data-testid="confirmPassword-input"] input').fill(formData.confirmPassword);
  await page.getByRole("button", { name: "S'inscrire" }).click();
};

const goFromHomePageToLoginPage = async (page: Page) => {
  await page.goto("/");
  await page.getByText("Connexion").click();
  await expect(page).toHaveURL("/login");
};

const loginWith = async (page: Page, formData: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) => {
  await page.getByRole("textbox", { name: "Email ou Login" }).fill(formData.email);
  await page.getByRole("textbox", { name: "Mot de passe" }).fill(formData.password);
  if (formData.rememberMe) {
    await page.getByRole("checkbox", { name: "Se souvenir de moi" }).check();
    await page.getByRole("checkbox", { name: "Se souvenir de moi" }).isChecked();
  }
  await page.getByRole("button", { name: "S'authentifier" }).click();
};

export { registerWith, goFromHomePageToRegisterPage, loginWith, goFromHomePageToLoginPage };