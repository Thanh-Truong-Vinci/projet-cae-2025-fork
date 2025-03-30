package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ManagerRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.ProducerRepository;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/** Service class for managing batches. */
@Service
public class BatchService {

  private final BatchRepository batchRepository;
  private final ProducerRepository producerRepository;
  private final ProductRepository productRepository;
  private final ManagerRepository managerRepository;
  private final NotificationRepository notificationRepository;

  /**
   * Constructor for BatchService.
   *
   * @param batchRepository the batch repository
   * @param producerRepository the producer repository
   * @param productRepository the product repository
   * @param managerRepository the manager repository
   * @param notificationRepository the notification repository
   */
  public BatchService(
      BatchRepository batchRepository,
      ProducerRepository producerRepository,
      ProductRepository productRepository,
      ManagerRepository managerRepository,
      NotificationRepository notificationRepository) {
    this.batchRepository = batchRepository;
    this.producerRepository = producerRepository;
    this.productRepository = productRepository;
    this.managerRepository = managerRepository;
    this.notificationRepository = notificationRepository;
  }

  /**
   * Adds a new batch.
   *
   * @param producerId the ID of the producer
   * @param productId the ID of the product
   * @param photo the photo URL
   * @param availabilityDate the availability date
   * @param unitPrice the unit price
   * @param saleUnit the sale unit
   * @param availableQuantity the available quantity
   */
  public void addBatch(
      Long producerId,
      Long productId,
      String photo,
      LocalDate availabilityDate,
      Double unitPrice,
      String saleUnit,
      Integer availableQuantity) {
    Producer producer =
        producerRepository
            .findById(producerId)
            .orElseThrow(() -> new IllegalArgumentException("Producer not found"));
    Product product =
        productRepository
            .findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    // TODO verify if photo exist, if not, create it ???
    createBatch(producer, product, photo, availabilityDate, unitPrice, saleUnit, availableQuantity);
  }

  /**
   * Retrieves the batch history.
   *
   * @param batchId the ID of the batch
   * @return the list of batches
   */
  public List<Batch> getBatchHistory(Long batchId) {
    return List.of(); // Return an empty list instead of null
  }

  /**
   * Modifies the photo of a batch.
   *
   * @param batchId the ID of the batch
   * @param photoUrl the new photo URL
   */
  public void modifyBatchPhoto(Long batchId, String photoUrl) {
    Batch batch =
        batchRepository
            .findById(batchId)
            .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
    batch.setPhoto(photoUrl);
    batchRepository.save(batch);
  }

  /**
   * Accepts a batch.
   *
   * @param batchId the ID of the batch
   * @param managerId the ID of the manager
   */
  public void acceptBatch(Long batchId, Long managerId) {
    Batch batch =
        batchRepository
            .findById(batchId)
            .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
    batch.setStatut("approuvé");
    batch.setManager(
        managerRepository
            .findById(managerId)
            .orElseThrow(() -> new IllegalArgumentException("Manager not found")));
    batchRepository.save(batch);
  }

  /**
   * Rejects a batch and sends a notification.
   *
   * @param batchId the ID of the batch
   * @param managerId the ID of the manager
   * @param notificationMessage the notification message
   */
  public void rejectBatch(Long batchId, Long managerId, String notificationMessage) {
    Batch batch =
        batchRepository
            .findById(batchId)
            .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
    batch.setStatut("refusé");
    batch.setManager(
        managerRepository
            .findById(managerId)
            .orElseThrow(() -> new IllegalArgumentException("Manager not found")));
    Notification notification = new Notification();
    notification.setMessage(notificationMessage);
    notification.setProducer(batch.getProducer());
    notificationRepository.save(notification);
    batch.setNotification(notification);
    batchRepository.save(batch);
  }

  /**
   * Creates a new batch.
   *
   * @param producer the producer
   * @param product the product
   * @param photo the photo URL
   * @param availabilityDate the availability date
   * @param unitPrice the unit price
   * @param saleUnit the sale unit
   * @param availableQuantity the available quantity
   */
  public void createBatch(
      Producer producer,
      Product product,
      String photo,
      LocalDate availabilityDate,
      Double unitPrice,
      String saleUnit,
      Integer availableQuantity) {
    Batch batch = new Batch();
    batch.setProducer(producer);
    batch.setProduct(product);
    batch.setPhoto(photo);
    batch.setAvailabilityDate(availabilityDate);
    batch.setUnitPrice(unitPrice);
    batch.setSaleUnit(saleUnit);
    batch.setAvailableQuantity(availableQuantity);
    batch.setStatut("en attente");
    batch.setNotification(null);
    batch.setDepositDate(LocalDate.now());
    batch.setManager(null);
    batchRepository.save(batch);
  }
}
