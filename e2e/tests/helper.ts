import { Page, expect } from "@playwright/test";

const goFromHomePageToRegisterPage = async (page: Page) => {
  await page.goto("http://localhost:5173/");
  await page.getByText("S'inscrire").click();
  await expect(page).toHaveURL("http://localhost:5173/register");
};

const registerWith = async (page: Page, formData: { 
  name: string;
  firstname: string;
  street: string;
  number: string;
  box: string;
  postalCode: string;
  city: string;
  country: string;
  phoneNumber: string;
  email: string;
  password: string;
}) => {
  await page.getByRole("textbox", { name: "Name" }).fill(formData.name);
  await page.getByRole("textbox", { name: "First Name" }).fill(formData.firstname);
  await page.getByRole("textbox", { name: "Street" }).fill(formData.street);
  await page.getByRole("textbox", { name: "Number" }).fill(formData.number);
  await page.getByRole("textbox", { name: "Box" }).fill(formData.box);
  await page.getByRole("textbox", { name: "Postal Code" }).fill(formData.postalCode);
  await page.getByRole("textbox", { name: "City" }).fill(formData.city);
  await page.getByRole("textbox", { name: "Country" }).fill(formData.country);
  await page.getByRole("textbox", { name: "Phone Number" }).fill(formData.phoneNumber);
  await page.getByRole("textbox", { name: "Email" }).fill(formData.email);
  await page.getByRole("textbox", { name: "Password" }).fill(formData.password);
  await page.getByRole("button", { name: "S'inscrire" }).click();
};

const goFromHomePageToLoginPage = async (page: Page) => {
  await page.goto("http://localhost:5173/");
  await page.getByText("Se connecter").click();
  await expect(page).toHaveURL("http://localhost:5173/login");
};

const loginWith = async (page: Page, formData: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) => {
  await page.getByRole("textbox", { name: "Email or Login" }).fill(formData.email);
  await page.getByRole("textbox", { name: "Password" }).fill(formData.password);
  if (formData.rememberMe) {
    await page.getByRole("checkbox", { name: "Se souvenir de moi" }).check();
  }
  await page.getByRole("button", { name: "S'authentifier" }).click();
};

export { registerWith, goFromHomePageToRegisterPage, loginWith, goFromHomePageToLoginPage };