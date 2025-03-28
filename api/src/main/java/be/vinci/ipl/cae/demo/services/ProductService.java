package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.models.entities.Photo;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
import be.vinci.ipl.cae.demo.repositories.PhotoRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class ProductService {

  private final ProductRepository productRepository;
  private final ProductTypeRepository productTypeRepository;
  private final PhotoRepository photoRepository;

  public ProductService(ProductRepository productRepository, ProductTypeRepository productTypeRepository, PhotoRepository photoRepository) {
    this.productRepository = productRepository;
    this.productTypeRepository = productTypeRepository;
    this.photoRepository = photoRepository;
  }

  public Product createProduct(String name, String description, Long typeId, Long photoId) {
    if (name == null || name.isBlank() || description == null || description.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name and description cannot be null or empty");
    }

    Product product = new Product();
    product.setName(name);
    product.setDescription(description);
    product.setType(fetchProductTypeById(typeId));
    product.setPhoto(fetchPhotoById(photoId));

    return productRepository.save(product);
  }

  private ProductType fetchProductTypeById(Long typeId) {
    return productTypeRepository.findById(typeId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ProductType not found"));
  }

  private Photo fetchPhotoById(Long photoId) {
    return photoRepository.findById(photoId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found"));
  }
}