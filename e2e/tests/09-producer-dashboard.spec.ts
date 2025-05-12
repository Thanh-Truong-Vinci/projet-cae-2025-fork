import { test, expect } from "@playwright/test";
import { 
  goFromHomePageToLoginPage,
  loginWith
} from "./helper";

test.describe("producer-dashboard", () => {
    test.beforeEach(async ({ page }) => {
        await goFromHomePageToLoginPage(page);

        await loginWith(page, {
          email: "producteur@exemple.com",
          password: "Azqwazqw1@",
          rememberMe: true
        });
        await expect(page).toHaveURL("/producer-dashboard");
        await expect(page.getByLabel("se-déconnecter")).toBeVisible();
    });

    test("TC9.1: should display producer dashboard with batch information", async ({ page }) => {

        await expect(page.getByRole("heading", { name: "Tableau de bord producteur" })).toBeVisible();

        await expect(page.getByRole("button", { name: "Ajouter un lot" })).toBeVisible();
        
        // Vérifier que les onglets de filtrage sont présents
        await expect(page.getByRole("tab", { name: "Tous" })).toBeVisible();
        await expect(page.getByRole("tab", { name: "Accepté" })).toBeVisible();
        await expect(page.getByRole("tab", { name: "En attente" })).toBeVisible();
        await expect(page.getByRole("tab", { name: "Refusé" })).toBeVisible();
        await expect(page.getByRole("tab", { name: "En vente" })).toBeVisible();
        await expect(page.getByRole("tab", { name: "Épuisé" })).toBeVisible();
        
        await expect(page.getByRole("heading", { name: "Statistiques" })).toBeVisible();
    });

    test("TC9.2: should navigate through batch status tabs", async ({ page }) => {
        // Cliquer sur chaque onglet et vérifier qu'il est bien sélectionné
        
        // Onglet "En attente"
        await page.getByRole("tab", { name: "En attente" }).click();
        await expect(page.getByRole("tab", { name: "En attente" })).toHaveAttribute("aria-selected", "true");
        
        // Onglet "Accepté"
        await page.getByRole("tab", { name: "Accepté" }).click();
        await expect(page.getByRole("tab", { name: "Accepté" })).toHaveAttribute("aria-selected", "true");
        
        // Onglet "Refusé"
        await page.getByRole("tab", { name: "Refusé" }).click();
        await expect(page.getByRole("tab", { name: "Refusé" })).toHaveAttribute("aria-selected", "true");
        
        // Onglet "Reçu"
        await page.getByRole("tab", { name: "En vente" }).click();
        await expect(page.getByRole("tab", { name: "En vente" })).toHaveAttribute("aria-selected", "true");
        
        // Onglet "Épuisé"
        await page.getByRole("tab", { name: "Épuisé" }).click();
        await expect(page.getByRole("tab", { name: "Épuisé" })).toHaveAttribute("aria-selected", "true");
        
        // Retour à "Tous"
        await page.getByRole("tab", { name: "Tous" }).click();
        await expect(page.getByRole("tab", { name: "Tous" })).toHaveAttribute("aria-selected", "true");
    });

    test("TC9.3: should navigate to add batch page", async ({ page }) => {
        // Cliquer sur le bouton d'ajout de lot
        await page.getByRole("button", { name: "Ajouter un lot" }).click();
        
        // Vérifier que la navigation vers la page d'ajout de lot a fonctionné
        await expect(page).toHaveURL("/add-batch");
    });

    test("TC9.4: should display statistics correctly", async ({ page }) => {
        // Vérifier que les statistiques sont affichées
        const statisticsSection = page.getByRole("heading", { name: "Statistiques" }).locator("..");
        await expect(statisticsSection).toBeVisible();
        
        // Vérifier les trois statistiques principales
        await expect(page.getByText("Total des lots")).toBeVisible();
        await expect(page.getByText("Lots acceptés")).toBeVisible();
    });
});