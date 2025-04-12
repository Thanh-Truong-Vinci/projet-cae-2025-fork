package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NewBatch;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.BatchStatus;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.Photo;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.ProducerRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/** Service class for managing batches. */
@Service
public class BatchService {

  private final BatchRepository batchRepository;
  private final ProducerRepository producerRepository;
  private final NotificationRepository notificationRepository;

  /** Constructeur du service. */
  public BatchService(
      BatchRepository batchRepository,
      ProducerRepository producerRepository,
      NotificationRepository notificationRepository) {
    this.batchRepository = batchRepository;
    this.producerRepository = producerRepository;
    this.notificationRepository = notificationRepository;
  }

  /**
   * Crée un nouveau lot de 0.
   *
   * @param newBatch les données du lot à créer
   * @return le lot créé
   */
  public Batch createBatch(NewBatch newBatch, Product product, Photo photo) {
    Producer producer = producerRepository.findByEmail(newBatch.getEmail());

    Batch batch = new Batch();
    batch.setProducer(producer);
    batch.setProduct(product);
    batch.setPhoto(photo);
    batch.setAvailabilityDate(newBatch.getAvailabilityDate());
    batch.setUnitPrice(newBatch.getUnitPrice());
    batch.setSaleUnit(newBatch.getSaleUnit());
    batch.setAvailableQuantity(newBatch.getAvailableQuantity());
    batch.setStatus(BatchStatus.PENDING);
    batch.setProductionDate(LocalDate.now());

    return batchRepository.save(batch);
  }

  /**
   * Récupère tous les lots.
   *
   * @return la liste de tous les lots
   */
  public Iterable<Batch> getAllBatches() {
    return batchRepository.findAll();
  }

  /**
   * Récupère un lot par son ID.
   *
   * @param id l'ID du lot
   * @return le lot ou null si non trouvé
   */
  public Batch getBatchById(long id) {
    return batchRepository.findById(id).orElse(null);
  }

  /**
   * Accepte un lot.
   *
   * @param id l'ID du lot à accepter
   * @return le lot accepté ou null si non trouvé
   */
  public Batch acceptBatch(long id) {
    Batch batch = batchRepository.findById(id).orElse(null);
    if (batch == null) {
      return null;
    }

    batch.setStatus(BatchStatus.APPROVED);
    return batchRepository.save(batch);
  }

  /**
   * Rejette un lot avec un message.
   *
   * @param id l'ID du lot à rejeter
   * @param message le message de rejet
   * @return le lot rejeté ou null si non trouvé
   */
  public Batch rejectBatch(long id, String message) {
    Batch batch = batchRepository.findById(id).orElse(null);
    if (batch == null) {
      return null;
    }

    batch.setStatus(BatchStatus.REJECTED);

    // Création de la notification
    Notification notification = new Notification();
    notification.setIsRead(false);
    notification.setMessage(message);

    Producer producer = producerRepository.findById(batch.getProducer().getId()).orElse(null);
    if (producer == null) {
      return null;
    }

    notification.setProducer(producer);
    notification = notificationRepository.save(notification);

    batch.setNotificationId(notification.getId());
    return batchRepository.save(batch);
  }

  /**
   * Marque un lot comme reçu.
   *
   * @param id l'ID du lot à marquer comme reçu
   * @return le lot mis à jour ou null si non trouvé ou status incorrect
   */
  public Batch receiveBatch(long id) {
    Batch batch = batchRepository.findById(id).orElse(null);
    if (batch == null) {
      return null;
    }

    if (batch.getStatus() != BatchStatus.APPROVED) {
      return null;
    }

    batch.setStatus(BatchStatus.RECEIVED);
    return batchRepository.save(batch);
  }

  /**
   * Récupère tous les lots ayant le statut APPROVED.
   *
   * @return la liste des lots approuvés
   */
  public List<Batch> getApprovedBatches() {
    return batchRepository.findByStatus(BatchStatus.APPROVED);
  }

  /**
   * Récupère tous les lots ayant le statut RECEIVED.
   *
   * @return la liste des lots reçus
   */
  public List<Batch> getReceivedBatches() {
    return batchRepository.findByStatus(BatchStatus.RECEIVED);
  }

  /**
   * Récupère tous les lots ayant le statut APPROVED.
   *
   * @param producerId le producteur qui fait la requête
   * @return la liste des lots d'un producteur ayant une quantité supérieur à 0
   */
  public Iterable<Batch> getBatchesByProducer(Long producerId) {

    return batchRepository.findByProducerIdAndAvailableQuantityGreaterThanOrderByProductionDateAsc(
        producerId, 0);
  }

  /**
   * Updates the photo of a batch with a new uploaded image.
   *
   * @param batchId the ID of the batch to update
   * @param photo the new photo entity
   * @return the updated batch or null if the batch was not found
   */
  public Batch updateBatchPhoto(long batchId, Photo photo) {
    Batch batch = batchRepository.findById(batchId).orElse(null);
    if (batch == null) {
      return null;
    }

    batch.setPhoto(photo);
    return batchRepository.save(batch);
  }
}
