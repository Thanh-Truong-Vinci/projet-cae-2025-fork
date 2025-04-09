package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.NewProductType;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.services.AuthsService.SecurityConstants;
import be.vinci.ipl.cae.demo.services.ProductTypeService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller pour gérer les opérations sur les types de produits.
 */
@RestController
@RequestMapping("/product-types")
public class ProductTypeController {

  private final ProductTypeService productTypeService;

  /**
   * Constructeur du controller.
   *
   * @param productTypeService le service de gestion des types de produits injecté
   */
  public ProductTypeController(ProductTypeService productTypeService) {
    this.productTypeService = productTypeService;
  }

  /**
   * Récupère tous les types de produits.
   *
   * @return la liste des types de produits
   */
  @GetMapping({"", "/"})
  public Iterable<ProductType> getAllProductTypes() {
    return productTypeService.getAllProductTypes();
  }

  /**
   * Récupère un type de produit par son id.
   *
   * @param id l'identifiant du type de produit
   * @return le type de produit correspondant
   */
  // TODO is realy necessary, we can do it by title
  @GetMapping("/{id}")
  public ProductType getProductTypeById(@PathVariable long id) {
    ProductType productType = productTypeService.getProductTypeById(id);
    if (productType == null) {
      throw new ResourceNotFoundException("Type de produit non trouvé");
    }
    return productType;
  }

  /**
   * Crée un nouveau type de produit.
   *
   * @param newProductType les informations du type de produit à créer
   * @return le type de produit créé
   */
  @PostMapping({"", "/"})
  @PreAuthorize(SecurityConstants.HAS_ROLE_MANAGER)
  public ProductType createProductType(@RequestBody NewProductType newProductType) {
    // TODO verify token if is a manager
    if (newProductType == null
        || newProductType.getTitle() == null
        || newProductType.getTitle().isBlank()) {
      throw new ConflictException("Données du type de produit invalides");
    }

    // No try-catch, directly returning the service call result
    return productTypeService.createProductType(newProductType.getTitle());
  }

  /**
   * Supprime un type de produit.
   *
   * @param id l'identifiant du type de produit à supprimer
   */
  @DeleteMapping("/{id}")
  @PreAuthorize(SecurityConstants.HAS_ROLE_MANAGER)
  public void deleteProductType(@PathVariable long id) {
    // TODO verify token if is a manager
    
    // Check if product type exists before deletion
    ProductType productType = productTypeService.getProductTypeById(id);
    if (productType == null) {
      throw new ResourceNotFoundException("Type de produit non trouvé");
    }
    
    // No try-catch, directly calling the service method
    productTypeService.deleteProductType(id);
  }
}
