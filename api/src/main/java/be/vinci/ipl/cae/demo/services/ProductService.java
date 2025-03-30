package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.springframework.stereotype.Service;

/** Service class for managing products. */
@Service
public class ProductService {

  private final ProductRepository productRepository;
  private final ProductTypeRepository productTypeRepository;

  /**
   * Constructs a new ProductService with the specified repositories.
   *
   * @param productRepository the repository for products
   * @param productTypeRepository the repository for product types
   */
  public ProductService(
      ProductRepository productRepository,
      ProductTypeRepository productTypeRepository) {
    this.productRepository = productRepository;
    this.productTypeRepository = productTypeRepository;
  }

  /**
   * Adds a new product to the repository.
   *
   * @param type the type of the product
   * @param name the name of the product
   * @param description the description of the product
   * @param photo the url of the photo associated with the product
   */
  public void addProduct(String type, String name, String description, String photo) {
    ProductType productType = productTypeRepository.findByTitle(type);
    if (productType == null) {
      throw new IllegalArgumentException("Product type not found");
    }
    if (productRepository.findByName(name) != null) {
      throw new IllegalArgumentException("Product with the same name already exists");
    }
    createProduct(name, productType.getTitle(), description, photo);
  }

  /**
   * Retrieves a list of products based on search criteria and type.
   *
   * @return a list of products matching the criteria
   */
  public List<Product> getProducts() {
    return (List<Product>) productRepository.findAll();
  }

  /**
   * TODO return only dispo products
   * Retrieves a list of available products based on search criteria and type.
   *
   * @param search the search term for product name or description
   * @param type the type of product
   * @return a list of available products matching the criteria
   */
  public List<Product> getDispoProducts(String search, String type) {
    return StreamSupport.stream(productRepository.findAll().spliterator(), false)
        .filter(
            product ->
                (search == null
                    || product.getName().contains(search)
                    || product.getDescription().contains(search))
                    && (type == null || product.getType().getTitle().equalsIgnoreCase(type)))
        .collect(Collectors.toList());
  }

  /**
   * Finds a product by its ID.
   *
   * @param productId the ID of the product
   * @return the product if found
   * @throws IllegalArgumentException if the product is not found
   */
  public Product findProductById(Long productId) {
    return productRepository.findById(productId)
        .orElseThrow(() -> new IllegalArgumentException("Product not found"));
  }

  /**
   * Creates a new product with the specified details.
   *
   * @param name the name of the product
   * @param type the type of the product
   * @param description the description of the product
   * @param photo the url of the photo associated with the product
   */
  public void createProduct(String name, String type, String description, String photo) {
    ProductType productType = productTypeRepository.findByTitle(type);
    Product product = new Product();
    product.setName(name);
    product.setType(productType);
    product.setDescription(description);
    product.setPhoto(photo);
    productRepository.save(product);
  }
}
