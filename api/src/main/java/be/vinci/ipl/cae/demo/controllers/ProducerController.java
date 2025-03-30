package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.BatchDto;
import be.vinci.ipl.cae.demo.models.dtos.ProductDto;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.services.BatchService;
import be.vinci.ipl.cae.demo.services.ProductService;
import java.util.ArrayList;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for managing producer-related operations.
 */
@RestController
@RequestMapping("/producer")
public class ProducerController {

  private BatchService batchService;
  private ProductService productService;

  public ProducerController(BatchService batchService, ProductService productService) {
    this.batchService = batchService;
    this.productService = productService;
  }

  /**
   * Adds a new batch.
   *
   * @param batchDto the batch data transfer object
   */
  @PostMapping("/addbatch")
  public void addBatch(@RequestBody BatchDto batchDto) {
    batchService.addBatch(
        batchDto.getProducerId(),
        batchDto.getProductId(),
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
   */
  @PostMapping("/modbatchphoto")
  public void modifyBatchPhoto(@RequestParam Long batchId, @RequestParam String photoUrl) {
    batchService.modifyBatchPhoto(batchId, photoUrl);
  }

  /**
   * Adds a new product.
   *
   * @param productDto the product data transfer object
   */
  @PostMapping("/addproduct")
  public void addProduct(@RequestBody ProductDto productDto) {
    productService.addProduct(
        productDto.getType(),
        productDto.getName(),
        productDto.getDescription(),
        productDto.getPhoto());
  }

  /**
   * Retrieves notifications for a producer.
   *
   * @param producerId the ID of the producer
   * @return a list of notifications
   */
  @GetMapping("/notifications")
  public List<Notification> getNotifications(@RequestParam Long producerId) {
    // TODO
    return new ArrayList<>();
  }

  /**
   * Adds a photo to a product.
   *
   * @param productId the ID of the product
   * @param photoUrl the photo URL
   */
  @PostMapping("/addphoto")
  public void addPhoto(@RequestParam Long productId, @RequestParam String photoUrl) {
    // TODO productService.addPhoto(productId, photoUrl);
  }
}
