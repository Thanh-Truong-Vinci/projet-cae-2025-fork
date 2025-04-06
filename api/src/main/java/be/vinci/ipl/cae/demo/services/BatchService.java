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
    batch.setDepositDate(LocalDate.now());

    return batchRepository.save(batch);
  }

  // TODO addBatch

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
    Batch batch =
        batchRepository.findById(id).orElseThrow(() -> new RuntimeException("Batch not found"));

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
    Batch batch =
        batchRepository.findById(id).orElseThrow(() -> new RuntimeException("Batch not found"));
    batch.setStatus(BatchStatus.REJECTED);

    // Création de la notification
    Notification notification = new Notification();
    notification.setIsRead(false);
    notification.setMessage(message);
    notification.setProducer(batch.getProducer());
    notification = notificationRepository.save(notification);

    batch.setNotification(notification);

    return batchRepository.save(batch);
  }

  /**
   * Marque un lot comme reçu.
   *
   * @param id l'ID du lot à marquer comme reçu
   * @return le lot mis à jour ou null si non trouvé
   * @throws RuntimeException si le lot n'est pas dans le statut APPROVED
   */
  public Batch receiveBatch(long id) {
    Batch batch =
        batchRepository.findById(id).orElseThrow(() -> new RuntimeException("Batch not found"));

    if (batch.getStatus() != BatchStatus.APPROVED) {
      throw new RuntimeException("Only approved batches can be marked as received");
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
}
