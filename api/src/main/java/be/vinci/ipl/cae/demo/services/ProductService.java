package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Photo;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
import be.vinci.ipl.cae.demo.repositories.PhotoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

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

  public List<Product> getProducts(String search, String type) {
    return StreamSupport.stream(productRepository.findAll().spliterator(), false)
        .filter(product -> (search == null || product.getName().contains(search) || product.getDescription().contains(search)) &&
                           (type == null || product.getType().getTitle().equalsIgnoreCase(type)))
        .collect(Collectors.toList());
  }

  public void createOne(String name, String type, String description, Long photoId) {
    ProductType productType = productTypeRepository.findByTitle(type);
    Photo photo = photoId != null ? photoRepository.findById(photoId).orElse(null) : null;
    Product product = new Product();
    product.setName(name);
    product.setType(productType);
    product.setDescription(description);
    product.setPhoto(photo);
  }

  public void createOne(String name, String type, String description, Photo photo) {
    // TODO implement createOne Product with Photo
  }
}
