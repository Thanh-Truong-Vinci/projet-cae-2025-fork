package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/** Service class for managing product types. */
@Service
public class ProductTypeService {

  private final ProductTypeRepository productTypeRepository;

  /**
   * Constructs a new ProductTypeService with the specified repository.
   *
   * @param productTypeRepository the repository for product types
   */
  public ProductTypeService(ProductTypeRepository productTypeRepository) {
    this.productTypeRepository = productTypeRepository;
  }

  /**
   * Adds a new product type with the specified title.
   *
   * @param title the title of the product type
   */
  public void addProductType(String title) {
    if (productTypeRepository.findByTitle(title) != null) {
      throw new IllegalArgumentException("Product type already exists");
    }
    createProductType(title);
  }

  /**
   * Deletes the product type with the specified ID.
   *
   * @param id the ID of the product type
   */
  public void deleteProductType(Long id) {
    if (!productTypeRepository.existsById(id)) {
      throw new IllegalArgumentException("Product type not found");
    }
    productTypeRepository.deleteById(id);
  }

  public List<ProductType> getAllProductTypes() {
    return (List<ProductType>) productTypeRepository.findAll();
  }

  /**
   * Creates a new product type with the specified title.
   *
   * @param title the title of the product type
   */
  public void createProductType(String title) {
    ProductType productType = new ProductType();
    productType.setTitle(title);
    productTypeRepository.save(productType);
  }
}
