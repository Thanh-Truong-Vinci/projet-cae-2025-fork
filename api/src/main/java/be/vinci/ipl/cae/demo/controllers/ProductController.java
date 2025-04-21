package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.NewProduct;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.services.AuthsService.SecurityConstants;
import be.vinci.ipl.cae.demo.services.ProductService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** ProductController to handle Product requests. */
@RestController
@RequestMapping("/products")
public class ProductController {

  private final ProductService productService;

  /**
   * Constructor for ProductController.
   *
   * @param productService the injected ProductService.
   */
  public ProductController(ProductService productService) {
    this.productService = productService;
  }

  /**
   * Get all Products.
   *
   * @param order the order (optional).
   * @return the list of Products.
   */
  @GetMapping({"", "/"})
  public Iterable<Product> getProducts(@RequestParam(required = false) String order) {
    return productService.getAllProducts(order);
  }

  /**
   * Get a Product by id.
   *
   * @param id the Product id.
   * @return the Product.
   */
  @GetMapping("/{id}")
  public Product getProduct(@PathVariable long id) {
    Product product = productService.getProductById(id);
    if (product == null) {
      throw new ResourceNotFoundException("Product not found");
    }
    return product;
  }

  /**
   * Add a Product.
   *
   * @param newProduct the new Product.
   * @return the created Product.
   */
  @PostMapping({"", "/"})
  @PreAuthorize(SecurityConstants.HAS_ROLE_MANAGER)
  public Product addProduct(@RequestBody NewProduct newProduct) {
    if (newProduct == null
        || newProduct.getName() == null
        || newProduct.getName().isBlank()
        || newProduct.getDescription() == null
        || newProduct.getDescription().isBlank()) {
      throw new ConflictException("Invalid product data");
    }
    return productService.createProduct(newProduct);
  }

  /**
   * Delete a Product by id.
   *
   * @param id the Product id.
   * @return the deleted Product.
   */
  @DeleteMapping("/{id}")
  @PreAuthorize(SecurityConstants.HAS_ROLE_MANAGER)
  public Product deleteProduct(@PathVariable long id) {
    Product product = productService.deleteProduct(id);
    if (product == null) {
      throw new ResourceNotFoundException("Product not found");
    }
    return product;
  }

  /**
   * Update a Product.
   *
   * @param id the Product id.
   * @param newProduct the new Product data.
   * @return the updated Product.
   */
  @PatchMapping("/{id}")
  @PreAuthorize(SecurityConstants.HAS_ROLE_MANAGER)
  public Product updateProduct(@PathVariable long id, @RequestBody NewProduct newProduct) {
    if (newProduct == null
        || (newProduct.getName() != null && newProduct.getName().isBlank())
        || (newProduct.getDescription() != null && newProduct.getDescription().isBlank())) {
      throw new ConflictException("Invalid product data");
    }

    Product product = productService.updateProduct(id, newProduct);
    if (product == null) {
      throw new ResourceNotFoundException("Product not found");
    }
    return product;
  }
}
