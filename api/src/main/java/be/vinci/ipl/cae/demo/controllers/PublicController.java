package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.services.ProductTypeService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Controller for managing public operations. */
@RestController
@RequestMapping("/public")
public class PublicController {

  private final ProductTypeService productTypeService;

  /**
   * Constructs a PublicController with the specified ProductTypeService.
   *
   * @param productTypeService the product type service.
   */
  public PublicController(ProductTypeService productTypeService) {
    this.productTypeService = productTypeService;
  }

  /**
   * Retrieves all product types.
   *
   * @return a list of all product types.
   */
  @GetMapping("/producttypes")
  public List<ProductType> getAllProductTypes() {
    return productTypeService.getAllProductTypes();
  }
}
