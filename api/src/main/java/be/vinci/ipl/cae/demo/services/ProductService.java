package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Photo;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.repositories.PhotoRepository;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.springframework.stereotype.Service;

/**
 * Service class for managing products.
 */
@Service
public class ProductService {

  private final ProductRepository productRepository;
  private final ProductTypeRepository productTypeRepository;
  private final PhotoRepository photoRepository;

  /**
   * Constructs a new ProductService with the specified repositories.
   *
   * @param productRepository the repository for products
   * @param productTypeRepository the repository for product types
   * @param photoRepository the repository for photos
   */
  public ProductService(ProductRepository productRepository,
                        ProductTypeRepository productTypeRepository,
                        PhotoRepository photoRepository) {
    this.productRepository = productRepository;
    this.productTypeRepository = productTypeRepository;
    this.photoRepository = photoRepository;
  }

  /**
   * Retrieves a list of products based on search criteria and type.
   *
   * @param search the search term for product name or description
   * @param type the type of product
   * @return a list of products matching the criteria
   */
  public List<Product> getProducts(String search, String type) {
    return StreamSupport.stream(productRepository.findAll().spliterator(), false)
        .filter(product -> (search == null || product.getName().contains(search) 
                            || product.getDescription().contains(search))
                           && (type == null || product.getType().getTitle().equalsIgnoreCase(type)))
        .collect(Collectors.toList());
  }

  /**
   * Creates a new product with the specified details.
   *
   * @param name the name of the product
   * @param type the type of the product
   * @param description the description of the product
   * @param photoId the ID of the photo associated with the product
   */
  public void createOne(String name, String type, String description, Long photoId) {
    ProductType productType = productTypeRepository.findByTitle(type);
    Photo photo = photoId != null ? photoRepository.findById(photoId).orElse(null) : null;
    Product product = new Product();
    product.setName(name);
    product.setType(productType);
    product.setDescription(description);
    product.setPhoto(photo);
  }

  /**
   * Creates a new product with the specified details and photo.
   *
   * @param name the name of the product
   * @param type the type of the product
   * @param description the description of the product
   * @param photo the photo associated with the product
   */
  public void createOne(String name, String type, String description, Photo photo) {
    // TODO implement createOne Product with Photo
  }
}
