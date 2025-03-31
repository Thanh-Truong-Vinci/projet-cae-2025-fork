package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NewProduct;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.services.ProductService;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * ProductController to handle Product requests.
 */
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
  public Iterable<Product> getProducts(@RequestParam(required = true) String order) {
    return productService.readAllProducts(order);
  }

  /**
   * Get detailed information about a Product.
   *
   * @param id the Product id.
   * @return the Product details.
   */
  @GetMapping("/details/{id}")
  public Product showProductDetails(@PathVariable long id) {
    Product product = productService.showProductDetails(id);
    if (product == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
    }
    return product;
  }

  /**
   * Get a Product by id.
   *
   * @param id the Product id.
   * @return the Product.
   */
  @GetMapping("/{id}")
  public Product getProduct(@PathVariable long id) {
    Product product = productService.readProductById(id);
    if (product == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
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
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  public Product addProduct(@RequestBody NewProduct newProduct) {
    if (newProduct == null
        || newProduct.getName() == null
        || newProduct.getName().isBlank()
        || newProduct.getDescription() == null
        || newProduct.getDescription().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid product data");
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
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  public Product deleteProduct(@PathVariable long id) {
    Product product = productService.deleteProduct(id);
    if (product == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
    }
    return product;
  }

  /**
   * Update a Product.
   *
   * @param id         the Product id.
   * @param newProduct the new Product data.
   * @return the updated Product.
   */
  @PatchMapping("/{id}")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  public Product updateProduct(@PathVariable long id, @RequestBody NewProduct newProduct) {
    if (newProduct == null
        || (newProduct.getName() != null && newProduct.getName().isBlank())
        || (newProduct.getDescription() != null && newProduct.getDescription().isBlank())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid product data");
    }

    Product product = productService.updateProduct(id, newProduct);
    if (product == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
    }
    return product;
  }
}
