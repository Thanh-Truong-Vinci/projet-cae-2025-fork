import { test, expect } from "@playwright/test";
import { 
  goToHomePage,
} from "./helper";

test.describe("HomePage", () => {

  test("TC1.1: should display products on home page", async ({ page }) => {
    await goToHomePage(page);

    // Vérifier que toutes les cartes de produits sont bien affichées
    const cards = await page.locator(".MuiCard-root").all();
    for (const card of cards) {
        await expect(card).toBeVisible();
    }
    
    // Vérifier que toutes les images des produits sont présentes
    for (const card of cards) {
        await expect(card.locator("img")).toBeVisible();
    }

    // Vérifier que le carrousel des produits les plus vendus est présent
    await expect(page.getByText("Produits les plus récents")).toBeVisible();
  });

  test("TC1.2: should filter products by type", async ({ page }) => {
    await goToHomePage(page);
    
    await page.locator("text=Filtrer par type").click();
    
    await page.getByRole("option", { name: "Légumes" }).click();
    
    await page.getByRole("button", { name: "CONFIRMER" }).click();

    // Vérifier individuellement chaque produit
    const cards = await page.locator(".MuiCard-root").all();
    for (const card of cards) {
      await expect(card.locator("text=/Légumes?/")).toBeVisible();
    }
  });

  test("TC1.3: should filter products by name using search bar", async ({ page }) => {
    await goToHomePage(page);
    
    await page.locator('input[placeholder="Nom du produit"]').fill("ca");
    
    await page.getByRole("button", { name: "CONFIRMER" }).click();
    
    // Vérifier que chaque produit affiché contient "ca" dans son nom
    const cards = await page.locator(".MuiCard-root").all();
    for (const card of cards) {
      // Utiliser une expression insensible à la casse pour trouver "ca" n'importe où dans le nom des produits (grâce au i)
      await expect(card.locator("text=/ca/i")).toBeVisible();
    }
  });
});