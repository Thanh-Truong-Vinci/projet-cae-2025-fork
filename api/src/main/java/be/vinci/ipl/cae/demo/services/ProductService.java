package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NewProduct;
import be.vinci.ipl.cae.demo.models.entities.Photo;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.repositories.PhotoRepository;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
import java.util.Collections;
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
   * @param productRepository     the repository for products
   * @param productTypeRepository the repository for product types
   * @param photoRepository       the repository for photos
   */
  public ProductService(
      ProductRepository productRepository,
      ProductTypeRepository productTypeRepository,
      PhotoRepository photoRepository) {
    this.productRepository = productRepository;
    this.productTypeRepository = productTypeRepository;
    this.photoRepository = photoRepository;
  }

  /**
   * Creates a new product with the specified details.
   *
   * @param name        the name of the product
   * @param type        the type of the product
   * @param description the description of the product
   * @param photo       the photo associated with the product
   */
  public Product createProduct(String name, ProductType type, String description, Photo photo) {
    Product product = new Product();
    product.setName(name);
    product.setType(type);
    product.setDescription(description);
    product.setPhoto(photo);

    return productRepository.save(product);
  }

  /**
   * Crée un nouveau produit à partir des informations fournies.
   *
   * @param newProduct les informations du nouveau produit
   * @return le produit créé et sauvegardé
   */
  // TODO review this methode
  public Product createProduct(NewProduct newProduct) {
    Product product = new Product();
    product.setName(newProduct.getName());

    // Récupérer le type de produit
    ProductType productType = null;
    if (newProduct.getTypeId() != null) {
      productType = productTypeRepository.findById(newProduct.getTypeId()).orElse(null);
    }
    product.setType(productType);

    product.setDescription(newProduct.getDescription());

    // Récupérer la photo si elle existe
    Photo photo = null;
    if (newProduct.getPhotoId() != null) {
      photo = photoRepository.findById(newProduct.getPhotoId()).orElse(null);
    }
    product.setPhoto(photo);

    return productRepository.save(product);
  }

  // TODO addProduct

  /**
   * Retrieves a list of products based on search criteria and type.
   *
   * @param search the search term for product name or description
   * @param type   the type of product
   * @return a list of products matching the criteria
   */
  public List<Product> getProducts(String search, String type) {
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
   * Récupère tous les produits avec un ordre optionnel.
   *
   * @param order l'ordre de tri ("desc" pour descendant, null ou autre pour ascendant)
   * @return un itérable de tous les produits dans l'ordre spécifié
   */
  public Iterable<Product> getAllProducts(String order) {
    Iterable<Product> products = productRepository.findAll();

    // Si l'ordre est descendant, convertissez l'itérable en liste et inversez-la
    // Corriger cette ligne (inverser l'ordre des comparaisons)
    if ("desc".equalsIgnoreCase(order)) {
      List<Product> productList =
          StreamSupport.stream(products.spliterator(), false).collect(Collectors.toList());
      Collections.reverse(productList);
      return productList;
    }

    return products;
  }

  /**
   * Récupère un produit par son identifiant.
   *
   * @param id l'identifiant du produit recherché
   * @return le produit trouvé ou null si aucun produit ne correspond
   */
  public Product getProductById(long id) {
    return productRepository.findById(id).orElse(null);
  }

  /**
   * Supprime un produit par son identifiant.
   *
   * @param id l'identifiant du produit à supprimer
   * @return le produit supprimé ou null si aucun produit ne correspond
   */
  public Product deleteProduct(long id) {
    Product product = getProductById(id);
    if (product != null) {
      productRepository.delete(product);
    }
    return product;
  }

  /**
   * Updates an existing product.
   *
   * @param id         the ID of the product to update
   * @param newProduct the DTO containing updated product information
   * @return the updated product if found, null otherwise
   */
  public Product updateProduct(long id, NewProduct newProduct) {
    Product existingProduct = getProductById(id);
    if (existingProduct != null) {
      if (newProduct.getName() != null) {
        existingProduct.setName(newProduct.getName());
      }

      if (newProduct.getTypeId() != null) {
        productTypeRepository.findById(newProduct.getTypeId()).ifPresent(existingProduct::setType);
      }

      if (newProduct.getDescription() != null) {
        existingProduct.setDescription(newProduct.getDescription());
      }

      if (newProduct.getPhotoId() != null) {
        Photo photo = photoRepository.findById(newProduct.getPhotoId()).orElse(null);
        existingProduct.setPhoto(photo);
      }

      return productRepository.save(existingProduct);
    }
    return null;
  }
}
