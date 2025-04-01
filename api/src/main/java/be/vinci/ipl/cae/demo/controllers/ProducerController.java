package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.BatchDto;
import be.vinci.ipl.cae.demo.models.dtos.ProductDto;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.services.AuthsService;
import be.vinci.ipl.cae.demo.services.BatchService;
import be.vinci.ipl.cae.demo.services.NotificationService;
import be.vinci.ipl.cae.demo.services.ProductService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Controller for managing producer-related operations. */
@RestController
@RequestMapping("/producer")
public class ProducerController {

  private final BatchService batchService;
  private final ProductService productService;
  private final AuthsService authsService;
  private final NotificationService notificationService;

  /**
   * Constructor for ProducerController.
   *
   * @param batchService the batch service
   * @param productService the product service
   * @param authsService the authentication service
   * @param notificationService the notification service
   */
  public ProducerController(
      BatchService batchService,
      ProductService productService,
      AuthsService authsService,
      NotificationService notificationService) {
    this.batchService = batchService;
    this.productService = productService;
    this.authsService = authsService;
    this.notificationService = notificationService;
  }

  /**
   * Retrieves a list of products based on search criteria and type.
   *
   * @param token the authorization token from the request header.
   * @return a list of products matching the criteria.
   * @throws ResponseStatusException if the token is invalid or expired.
   */
  @PostMapping("/products")
  public List<Product> getProducts(@RequestHeader("Authorization") String token) {
    if (authsService.isValidClientToken(token) == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Token not valid, expired or user is not client");
    }
    return productService.getProducts();
  }

  /**
   * Adds a new batch.
   *
   * @param batchDto the batch data transfer object
   * @param token the authorization token from the request header
   */
  @PostMapping("/addbatch")
  public void addBatch(
      @RequestBody BatchDto batchDto, @RequestHeader("Authorization") String token) {
    Producer producer = authsService.isValidProducerToken(token);
    if (producer == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Token not valid, expired or user is not producer");
    }
    if (batchDto.getProduct() == null || batchDto.getProduct().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product name is required");
    }
    if (batchDto.getProductType() == null || batchDto.getProductType().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product type is required");
    }
    if (batchDto.getDescription() == null || batchDto.getDescription().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product description is required");
    }
    if (batchDto.getPhoto() == null || batchDto.getPhoto().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photo URL is required");
    }
    if (batchDto.getAvailabilityDate() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Availability date is required");
    }
    if (batchDto.getUnitPrice() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unit price is required");
    }
    if (batchDto.getSaleUnit() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sale unit is required");
    }
    if (batchDto.getAvailableQuantity() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Available quantity is required");
    }
    batchService.addBatch(
        producer.getId(),
        batchDto.getProduct(),
        batchDto.getProductType(),
        batchDto.getDescription(),
        batchDto.getPhoto(),
        batchDto.getAvailabilityDate(),
        batchDto.getUnitPrice(),
        batchDto.getSaleUnit(),
        batchDto.getAvailableQuantity());
  }

  /**
   * Modifies the photo of a batch.
   *
   * @param batchId the ID of the batch
   * @param photoUrl the new photo URL
   * @param token the authorization token from the request header
   */
  @PostMapping("/modbatchphoto")
  public void modifyBatchPhoto(
      @RequestParam Long batchId,
      @RequestParam String photoUrl,
      @RequestHeader("Authorization") String token) {
    Producer producer = authsService.isValidProducerToken(token);
    if (producer == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Token not valid, expired or user is not producer");
    }
    if (batchId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Batch ID is required");
    }
    batchService.modifyBatchPhoto(batchId, photoUrl);
  }

  /**
   * Adds a new product.
   *
   * @param productDto the product data transfer object
   * @param token the authorization token from the request header
   */
  @PostMapping("/addproduct")
  public void addProduct(
      @RequestBody ProductDto productDto, @RequestHeader("Authorization") String token) {
    Producer producer = authsService.isValidProducerToken(token);
    if (producer == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Token not valid, expired or user is not producer");
    }
    if (productDto.getType() == null || productDto.getType().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product type is required");
    }
    if (productDto.getName() == null || productDto.getName().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product name is required");
    }
    if (productDto.getDescription() == null || productDto.getDescription().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product description is required");
    }
    if (productDto.getPhoto() == null || productDto.getPhoto().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product photo URL is required");
    }

    productService.addProduct(
        productDto.getType(),
        productDto.getName(),
        productDto.getDescription(),
        productDto.getPhoto());
  }

  /**
   * Retrieves notifications for a producer.
   *
   * @param token the authorization token from the request header
   * @return a list of notifications
   */
  @GetMapping("/notifications")
  public List<Notification> getNotifications(@RequestHeader("Authorization") String token) {
    Producer producer = authsService.isValidProducerToken(token);
    if (producer == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Token not valid, expired or user is not producer");
    }
    return notificationService.getNotifications(producer);
  }
}
