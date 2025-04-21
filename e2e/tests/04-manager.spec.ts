import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { 
  loginWith,
  goFromHomePageToLoginPage
} from "./helper";

test.describe("manager-dashboard", () => {

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

    test("TC4.1: should display stock information and access sales dashboard", async ({ page }) => {
      await expect(page.getByText("Produits en stock")).toBeVisible();
      await expect(page.getByText("Produits reçus en Stock")).toBeVisible();
      
      await expect(page.getByText("Statistiques des ventes")).toBeVisible();
      await page.getByText("Statistiques des ventes").click();
      
      await expect(page.getByText("Tableau de bord des ventes")).toBeVisible();

      await expect(page.getByText("Récapitulatif par Type de Produit")).toBeVisible();

      await expect(page.getByText("Détails par Produit")).toBeVisible();
    });
});