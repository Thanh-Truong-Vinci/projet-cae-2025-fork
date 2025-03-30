package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.ProductAvailability;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.BatchStatus;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
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
  private final BatchRepository batchRepository;

  /**
   * Constructs a new ProductService with the specified repositories.
   *
   * @param productRepository the repository for products
   * @param productTypeRepository the repository for product types
   * @param batchRepository the repository for batches
   */
  public ProductService(
      ProductRepository productRepository,
      ProductTypeRepository productTypeRepository,
      BatchRepository batchRepository) {
    this.productRepository = productRepository;
    this.productTypeRepository = productTypeRepository;
    this.batchRepository = batchRepository;
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
   * Retrieves a list of available products based on search criteria and type.
   *
   * @param search the search term for product name or description
   * @param type the type of product
   * @return a list of available products matching the criteria
   */
  public List<ProductAvailability> getAvailableProducts(String search, String type) {
    return StreamSupport.stream(productRepository.findAll().spliterator(), false)
        .filter(
            product ->
                (search == null
                        || product.getName().contains(search)
                        || product.getDescription().contains(search))
                    && (type == null || product.getType().getTitle().equalsIgnoreCase(type))
                    && batchRepository
                        .findByProductAndAvailableQuantityGreaterThan(product, 0)
                        .stream()
                        .anyMatch(batch -> BatchStatus.APPROVED.equals(batch.getStatut())))
        .map(
            product -> {
              ProductAvailability dto = new ProductAvailability();
              dto.setType(product.getType().getTitle());
              dto.setName(product.getName());
              dto.setDescription(product.getDescription());
              dto.setPhoto(product.getPhoto());
              dto.setQuantity(
                  batchRepository.findByProductAndAvailableQuantityGreaterThan(product, 0).stream()
                      .filter(batch -> BatchStatus.APPROVED.equals(batch.getStatut()))
                      .mapToInt(Batch::getAvailableQuantity)
                      .sum());
              return dto;
            })
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
    return productRepository
        .findById(productId)
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
  public Product createProduct(String name, String type, String description, String photo) {
    ProductType productType = productTypeRepository.findByTitle(type);
    Product product = new Product();
    product.setName(name);
    product.setType(productType);
    product.setDescription(description);
    product.setPhoto(photo);
    productRepository.save(product);
    return product;
  }
}
