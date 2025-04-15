package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NewBatch;
import be.vinci.ipl.cae.demo.models.dtos.views.BatchView;
import be.vinci.ipl.cae.demo.models.dtos.views.ManagerBatchView;
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
@SuppressWarnings("PMD")
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
      fillBasicBatchInfo(batch, view);
      fillProductInfo(batch, view);
      fillImageInfo(batch, view);
      fillProducerInfo(batch, view);
      fillNotificationInfo(batch, view);

      batchViews.add(view);
    }

    return batchViews;
  }

  /**
   * Récupère tous les lots ayant le statut PENDING, APPROVED ou REJECTED et les convertit en DTO
   * PendingBatchView.
   *
   * @return la liste des lots pour le gestionnaire (en attente, acceptés, rejetés) au format
   *     PendingBatchView
   */
  public List<ManagerBatchView> getManagerBatches() {
    // Récupérer tous les lots avec les statuts pertinents pour le gestionnaire
    List<Batch> pendingBatches = batchRepository.findByStatus(BatchStatus.PENDING);
    List<Batch> approvedBatches = batchRepository.findByStatus(BatchStatus.APPROVED);
    List<Batch> rejectedBatches = batchRepository.findByStatus(BatchStatus.REJECTED);

    // Combiner les listes
    List<Batch> allBatches = new ArrayList<>();
    allBatches.addAll(pendingBatches);
    allBatches.addAll(approvedBatches);
    allBatches.addAll(rejectedBatches);

    List<ManagerBatchView> pendingBatchViews = new ArrayList<>();

    for (Batch batch : allBatches) {
      ManagerBatchView view = new ManagerBatchView();
      fillBasicBatchInfo(batch, view);
      fillProductInfo(batch, view);
      fillImageInfo(batch, view);
      fillProducerInfo(batch, view);
      fillNotificationInfo(batch, view);

      pendingBatchViews.add(view);
    }

    // Tri par date de création (du plus récent au plus ancien)
    pendingBatchViews.sort(Comparator.comparing(ManagerBatchView::getCreatedAt).reversed());

    return pendingBatchViews;
  }

  /** Remplit les informations de base communes à partir d'un batch. */
  private void fillBasicBatchInfo(Batch batch, Object view) {
    if (view instanceof BatchView batchView) {
      batchView.setId(batch.getId());
      batchView.setAvailabilityDate(batch.getAvailabilityDate());
      batchView.setAvailableQuantity(batch.getAvailableQuantity());
      batchView.setUnitPrice(batch.getUnitPrice());
      batchView.setUnitType(batch.getSaleUnit());
      batchView.setStatus(batch.getStatus().toString());
      batchView.setCreatedAt(batch.getProductionDate());
    } else if (view instanceof ManagerBatchView managerView) {
      managerView.setId(batch.getId());
      managerView.setAvailabilityDate(batch.getAvailabilityDate());
      managerView.setAvailableQuantity(batch.getAvailableQuantity());
      managerView.setUnitPrice(batch.getUnitPrice());
      managerView.setUnitType(batch.getSaleUnit());
      managerView.setStatus(batch.getStatus().toString());
      managerView.setCreatedAt(batch.getProductionDate());
    }
  }

  /** Remplit les informations du produit. */
  private void fillProductInfo(Batch batch, Object view) {
    if (batch.getProduct() == null) {
      return;
    }

    if (view instanceof BatchView batchView) {
      batchView.setProductName(batch.getProduct().getName());
      if (batch.getProduct().getType() != null) {
        batchView.setProductType(batch.getProduct().getType().getTitle());
      }
    } else if (view instanceof ManagerBatchView managerView) {
      managerView.setProductName(batch.getProduct().getName());
      managerView.setDescription(batch.getProduct().getDescription());
      if (batch.getProduct().getType() != null) {
        managerView.setProductType(batch.getProduct().getType().getTitle());
      }
    }
  }

  /**
   * Gère les informations d'image pour les vues de lots.
   */
  private void fillImageInfo(Batch batch, Object view) {
    if (batch.getPhoto() == null) return;
    
    if (view instanceof BatchView batchView) {
      batchView.setImageUrl(batch.getPhoto().getImageLocation());
    } else if (view instanceof ManagerBatchView managerView) {
      managerView.setImageUrl(batch.getPhoto().getImageLocation());
    }
  }

  /**
   * Gère les informations de producteur pour les vues de lots.
   */
  private void fillProducerInfo(Batch batch, Object view) {
    if (batch.getProducer() == null) return;
    
    if (view instanceof BatchView batchView) {
      batchView.setProducerId(batch.getProducer().getId());
      batchView.setProducerName(batch.getProducer().getCompany());
    } else if (view instanceof ManagerBatchView managerView) {
      managerView.setProducerId(batch.getProducer().getId());
      managerView.setProducerName(batch.getProducer().getCompany());
    }
  }

  /**
   * Gère les informations de notification/rejet pour les vues de lots.
   */
  private void fillNotificationInfo(Batch batch, Object view) {
    if (batch.getNotificationId() == null) return;
    
    Notification notification = notificationRepository.findById(batch.getNotificationId()).orElse(null);
    if (notification == null) return;
    
    if (view instanceof BatchView batchView) {
      batchView.setRejectionReason(notification.getMessage());
    } else if (view instanceof ManagerBatchView managerView) {
      managerView.setRejectionReason(notification.getMessage());
    }
  }
}
