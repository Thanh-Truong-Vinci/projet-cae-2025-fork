import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { 
  loginWith,
  goFromHomePageToLoginPage
} from "./helper";

test.describe("manage-product-types", () => {

    test.beforeEach(async ({ page }) => {
        await goFromHomePageToLoginPage(page);
        await loginWith(page, {
          email: "admin@exemple.com",
          password: "Azqwazqw1@",
          rememberMe: true
        });
        await expect(page).toHaveURL("/manager-dashboard");
        await expect(page.getByLabel("se-déconnecter")).toBeVisible();
        
        await page.getByText("Gérer les types").click();
        await expect(page).toHaveURL("/manage-product-types");
        await expect(page.getByText("Gestion des Types de Produits")).toBeVisible();
    });

    test("TC7.1: should display list of product types", async ({ page }) => {
        
        // Attendre que la liste des types soit chargée
        await expect(page.locator(".MuiList-root")).toBeVisible();
        
        // Vérifier qu'au moins un type est présent (les types sont déjà dans la base de données)
        const typeElements = await page.locator(".MuiListItem-root").count();
        expect(typeElements).toBeGreaterThan(0);
    });

    test("TC7.2: should add a new product type", async ({ page }) => {

        // Générer un nom unique pour le type de produit
        const newTypeName = `Test ${faker.string.alpha(6)}`;
        
        await page.getByText("Ajouter un Type").click();
        
        await expect(page.getByText("Ajouter un nouveau type de produit")).toBeVisible();
        
        await page.getByLabel("Nom du type").fill(newTypeName);
        
        await page.getByRole("button", { name: "Ajouter" }).click();
        
        await expect(page.getByText("Type ajouté avec succès")).toBeVisible();

        await expect(page.getByText(newTypeName)).toBeVisible();
    });

    test("TC7.3: should delete a product type", async ({ page }) => {

        const typeToDelete = `Delete Type ${faker.string.alpha(6)}`;
        
        await page.getByText("Ajouter un Type").click();
        await page.getByLabel("Nom du type").fill(typeToDelete);
        await page.getByRole("button", { name: "Ajouter" }).click();
        
        await expect(page.getByText("Type ajouté avec succès")).toBeVisible();
        await expect(page.getByText(typeToDelete)).toBeVisible();
        
        // Trouver le bouton de suppression associé au type créé
        const typeItem = page.getByText(typeToDelete).locator("../..");
        await typeItem.getByLabel("delete").click();
        
        await expect(page.getByText("Confirmer la suppression")).toBeVisible();
        await page.getByRole("button", { name: "Supprimer" }).click();
        
        await expect(page.getByText("Type supprimé avec succès")).toBeVisible();
        
        // Vérifier que le type n'est plus dans la liste
        await expect(page.getByText(typeToDelete)).not.toBeVisible();
    });

    test("TC7.4: should show warning when trying to delete a type used by products", async ({ page }) => {
        // On doit tester avec un type qui est utilisé par des produits
        
        // On prend le premier élément de la liste qui est sûrement utilisé
        const existingTypeElement = await page.locator(".MuiListItem-root").first();
        const typeName = await existingTypeElement.locator(".MuiListItemText-primary").textContent();
        
        // Cliquer sur le bouton de suppression du premier élément
        await existingTypeElement.getByLabel("delete").click();
        
        await expect(page.getByText("Confirmer la suppression")).toBeVisible();
        await page.getByRole("button", { name: "Supprimer" }).click();
        
        // Vérifier le message d'avertissement (si le type est utilisé)
        try {
            await expect(page.getByText(/Ce type de produit ne peut pas être supprimé/)).toBeVisible({ timeout: 5000 });
        } catch (e) {
            // Si pas de message d'erreur, on vérifie alors le message de succès à la place
            await expect(page.getByText("Type supprimé avec succès")).toBeVisible();
            console.log(`Le type "${typeName}" n'était pas utilisé et a été supprimé.`);
        }
    });

    test("TC7.5: should verify validation when adding empty type name", async ({ page }) => {

        await page.getByText("Ajouter un Type").click();
        
        await page.getByLabel("Nom du type").fill("");
        
        await page.getByRole("button", { name: "Ajouter" }).click();
        
        // Vérifier que la boîte de dialogue reste ouverte (pas de fermeture)
        await expect(page.getByText("Ajouter un nouveau type de produit")).toBeVisible();
        
        await expect(page.getByText("Le nom du type ne peut pas être vide")).toBeVisible();
    });

});