package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NewBatch;
import be.vinci.ipl.cae.demo.models.dtos.views.BatchView;
import be.vinci.ipl.cae.demo.models.dtos.views.ProductBatchView;
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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

  /**
   * Récupère tous les lots ayant le statut RECEIVED et une quantité disponible supérieure à 0,
   * fusionnés par produit/prix/unité/photo et triés par date de production.
   *
   * @return la liste des BatchView fusionnés avec quantités additionnées
   */
  public List<ProductBatchView> getReceivedBatchesWithAvailableQuantity() {
    // Récupérer les lots RECEIVED avec quantité > 0
    List<Batch> batches =
        batchRepository.findByStatusAndAvailableQuantityGreaterThan(BatchStatus.RECEIVED, 0);

    // Map pour regrouper les lots par productId + unitPrice + saleUnit + photoId + companyName
    Map<String, ProductBatchView> batchViewMap = new HashMap<>();

    for (Batch batch : batches) {
      // Clé composite pour regroupement incluant l'ID de la photo et le nom d'entreprise
      String photoIdentifier =
          batch.getPhoto() != null ? String.valueOf(batch.getPhoto().getId()) : "null";
      String companyName =
          batch.getProducer().getCompany() != null ? batch.getProducer().getCompany() : "unknown";

      String key =
          batch.getProduct().getId()
              + "_"
              + batch.getUnitPrice()
              + "_"
              + batch.getSaleUnit()
              + "_"
              + photoIdentifier
              + "_"
              + companyName; // MODIFIÉ: Utilisation du nom d'entreprise au lieu de l'ID

      if (batchViewMap.containsKey(key)) {
        // Lot similaire trouvé, fusionner
        ProductBatchView existingView = batchViewMap.get(key);
        existingView.setTotalQuantity(
            existingView.getTotalQuantity() + batch.getAvailableQuantity());
        existingView.getBatchIds().add(batch.getId());
        existingView.getBatchQuantities().add(batch.getAvailableQuantity());

        // Garder la date la plus ancienne pour le tri FIFO
        if (batch.getProductionDate().isBefore(existingView.getEarliestProductionDate())) {
          existingView.setEarliestProductionDate(batch.getProductionDate());
        }
      } else {
        // Nouveau groupe, créer un BatchView
        ProductBatchView batchView = new ProductBatchView();
        batchView.setProductId(batch.getProduct().getId());
        batchView.setProductName(batch.getProduct().getName());
        batchView.setProductType(batch.getProduct().getType().getTitle());
        batchView.setDescription(batch.getProduct().getDescription());
        batchView.setUnitPrice(batch.getUnitPrice());
        batchView.setSaleUnit(batch.getSaleUnit());
        batchView.setTotalQuantity(batch.getAvailableQuantity());
        batchView.setImageLocation(
            batch.getPhoto() != null ? batch.getPhoto().getImageLocation() : null);
        batchView.setCompanyName(batch.getProducer().getCompany());
        batchView.setEarliestProductionDate(batch.getProductionDate());
        batchView.getBatchIds().add(batch.getId());
        batchView.getBatchQuantities().add(batch.getAvailableQuantity());

        batchViewMap.put(key, batchView);
      }
    }

    // Convertir la map en liste et trier par date de production
    List<ProductBatchView> result = new ArrayList<>(batchViewMap.values());
    result.sort(Comparator.comparing(ProductBatchView::getEarliestProductionDate));

    return result;
  }

  /**
   * Récupère tous les lots ayant le statut RECEIVED et les convertit en DTO BatchView.
   *
   * @return la liste des lots reçus au format BatchView
   */
  public List<BatchView> getReceivedBatches() {
    List<Batch> batches = batchRepository.findByStatus(BatchStatus.RECEIVED);
    List<BatchView> batchViews = new ArrayList<>();

    for (Batch batch : batches) {
      BatchView view = new BatchView();
      // Informations de base du lot
      view.setId(batch.getId());
      view.setAvailabilityDate(batch.getAvailabilityDate());
      view.setAvailableQuantity(batch.getAvailableQuantity());
      view.setUnitPrice(batch.getUnitPrice());
      view.setUnitType(batch.getSaleUnit());
      view.setStatus(batch.getStatus().toString());
      view.setCreatedAt(batch.getProductionDate());

      // Informations du produit
      if (batch.getProduct() != null) {
        view.setProductName(batch.getProduct().getName());
        if (batch.getProduct().getType() != null) {
          view.setProductType(batch.getProduct().getType().getTitle());
        }
      }

      // Informations de l'image
      if (batch.getPhoto() != null) {
        view.setImageUrl(batch.getPhoto().getImageLocation());
      }

      // Informations du producteur
      if (batch.getProducer() != null) {
        view.setProducerId(batch.getProducer().getId());
        view.setProducerName(batch.getProducer().getCompany());
      }

      // Informations de rejet si présent
      if (batch.getNotificationId() != null) {
        Notification notification =
            notificationRepository.findById(batch.getNotificationId()).orElse(null);
        if (notification != null) {
          view.setRejectionReason(notification.getMessage());
        }
      }

      batchViews.add(view);
    }

    return batchViews;
  }
}
