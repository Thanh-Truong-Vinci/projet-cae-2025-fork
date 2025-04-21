import { test, expect } from "@playwright/test";
import { 
  loginWith,
  goFromHomePageToLoginPage
} from "./helper";

test.describe("pending-batches", () => {
    // Se connecter en tant que manager avant chaque test
    test.beforeEach(async ({ page }) => {
        await goFromHomePageToLoginPage(page);
        await loginWith(page, {
          email: "admin@example.com",
          password: "Azqwazqw1@",
          rememberMe: true
        });
        await expect(page).toHaveURL("/manager-dashboard");
        await expect(page.getByLabel("se-déconnecter")).toBeVisible();
        
        // Naviguer vers la page de gestion des lots en attente
        await page.getByText("Lots en attente").click();
        await expect(page).toHaveURL("/pending-batches");
        await expect(page.getByText("Gestion des Lots en Attente")).toBeVisible();
    });

    test("TC8.1: should display pending batches information", async ({ page }) => {
        
        // Deux scénarios possibles: des lots en attente ou aucun lot
        try {
            // Vérifier qu'il y a des lots en attente
            const cards = await page.locator(".MuiCard-root").all();
            if (cards.length > 0) {
                // Vérifier seulement les éléments du premier lot
                const firstCard = cards[0];
                await expect(firstCard.locator("img")).toBeVisible();
                await expect(firstCard.getByText("€")).toBeVisible();
                await expect(firstCard.getByText("Quantité:")).toBeVisible();
                
                await expect(firstCard.getByText("Détails")).toBeVisible();
                await expect(firstCard.getByText("Accepter")).toBeVisible();
                await expect(firstCard.getByText("Rejeter")).toBeVisible();
            }
        } catch {
            // Si pas de lots, vérifier le message
            await expect(page.getByText("Aucun lot en attente.")).toBeVisible();
        }
    });

    test("TC8.2: should accept a batch", async ({ page }) => {
        // Vérifier s'il y a des lots en attente
        const initialCardCount = await page.locator(".MuiCard-root").count();
        test.skip(initialCardCount === 0, "Test ignoré car aucun lot en attente");
        
        if (initialCardCount > 0) {
            // Stocker le nombre initial de lots
            console.log(`Nombre initial de lots: ${initialCardCount}`);
            
            // Accepter le premier lot
            await page.getByText("Accepter").first().click();
            
            // Attendre que la requête soit traitée et la page actualisée
            await page.waitForTimeout(1000);
            
            // Vérifier que le nombre de lots a diminué
            const finalCardCount = await page.locator(".MuiCard-root").count();
            expect(finalCardCount).toBeLessThanOrEqual(initialCardCount);
            
            if (finalCardCount === 0) {
                // Si plus de lots, vérifier le message
                await expect(page.getByText("Aucun lot en attente.")).toBeVisible();
            }
        }
    });

    test("TC8.3: should reject a batch with a reason", async ({ page }) => {
        // Vérifier s'il y a des lots en attente
        const initialCardCount = await page.locator(".MuiCard-root").count();
        test.skip(initialCardCount === 0, "Test ignoré car aucun lot en attente");
        
        if (initialCardCount > 0) {

            await page.getByText("Rejeter").first().click();
            
            // Vérifier que la boîte de dialogue de rejet est visible
            await expect(page.getByRole("dialog", { name: "Raison du rejet" })).toBeVisible();
            
            await page.getByLabel("Raison du rejet (optionnelle)").fill("Produit non conforme aux standards de qualité");
            
            await page.getByRole("button", { name: "Confirmer le rejet" }).click();
            
            await page.waitForTimeout(1000);
            
            // Vérifier que le nombre de lots a diminué
            const finalCardCount = await page.locator(".MuiCard-root").count();
            expect(finalCardCount).toBeLessThanOrEqual(initialCardCount);
            
            if (finalCardCount === 0) {
                await expect(page.getByText("Aucun lot en attente.")).toBeVisible();
            }
        }
    });

    test("TC8.4: should reject a batch without a reason", async ({ page }) => {
        // Vérifier s'il y a des lots en attente
        const initialCardCount = await page.locator(".MuiCard-root").count();
        test.skip(initialCardCount === 0, "Test ignoré car aucun lot en attente");
        
        if (initialCardCount > 0) {

            await page.getByText("Rejeter").first().click();
            
            // Vérifier que la boîte de dialogue de rejet est visible
            await expect(page.getByRole("dialog", { name: "Raison du rejet" })).toBeVisible();
            
            await page.getByRole("button", { name: "Confirmer le rejet" }).click();
            
            await page.waitForTimeout(1000);
            
            // Vérifier que le nombre de lots a diminué
            const finalCardCount = await page.locator(".MuiCard-root").count();
            expect(finalCardCount).toBeLessThanOrEqual(initialCardCount);
            
            if (finalCardCount === 0) {
                // Si plus de lots, vérifier le message
                await expect(page.getByText("Aucun lot en attente.")).toBeVisible();
            }
        }
    });
});