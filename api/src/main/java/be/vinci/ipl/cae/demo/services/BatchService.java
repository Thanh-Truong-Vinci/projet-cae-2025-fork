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
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.ProducerRepository;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
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
  private final ProductRepository productRepository;
  private final ProductTypeRepository productTypeRepository;
  private final PhotoService photoService;
  private final ProductService productService;

  /** Constructeur du service. */
  public BatchService(
      BatchRepository batchRepository,
      ProducerRepository producerRepository,
      NotificationRepository notificationRepository,
      ProductRepository productRepository,
      ProductTypeRepository productTypeRepository,
      PhotoService photoService,
      ProductService productService) {
    this.batchRepository = batchRepository;
    this.producerRepository = producerRepository;
    this.notificationRepository = notificationRepository;
    this.productRepository = productRepository;
    this.productTypeRepository = productTypeRepository;
    this.photoService = photoService;
    this.productService = productService;
  }

  /**
   * Crée un nouveau lot de 0.
   *
   * @param newBatch les données du lot à créer
   * @return le lot créé
   */
  public Batch createBatch(NewBatch newBatch, Product product, Photo photo) {
    Producer producer = producerRepository.findByEmail(newBatch.getEmail());
    return createBatchInternal(producer, product, photo, newBatch);
  }

  /**
   * Creates a new batch using an existing product.
   *
   * @param newBatch the batch data
   * @param productId the ID of the existing product
   * @return the created batch
   */
  public Batch createBatchWithExistingProduct(NewBatch newBatch, Long productId) {
    Producer producer = producerRepository.findByEmail(newBatch.getEmail());

    // Find the existing product
    Product product = productRepository.findById(productId).orElse(null);

    if (product == null) {
      return null;
    }

    // Use the product's existing photo
    Photo photo = product.getPhoto();

    return createBatchInternal(producer, product, photo, newBatch);
  }

  /**
   * Creates a new batch using an existing image from the database.
   *
   * @param newBatch the batch data
   * @param photoId the ID of the existing photo to use
   * @return the created batch
   */
  public Batch createBatchWithExistingImage(NewBatch newBatch, Long photoId) {
    // Find the existing photo
    Photo photo = photoService.getPhotoById(photoId);
    if (photo == null) {
      return null;
    }

    // Get the product type
    ProductType productType = productTypeRepository.findByTitle(newBatch.getProductType());
    if (productType == null) {
      return null;
    }

    // Create a new product with the existing photo
    Product product =
        productService.createProduct(
            newBatch.getProductName(), productType, newBatch.getProductDescription(), photo);

    if (product == null) {
      return null;
    }

    // Get producer information only when needed
    Producer producer = producerRepository.findByEmail(newBatch.getEmail());

    return createBatchInternal(producer, product, photo, newBatch);
  }

  /**
   * Internal helper method to create a batch with given producer, product, photo and batch data.
   * This eliminates code duplication between the public batch creation methods.
   *
   * @param producer the producer creating the batch
   * @param product the product being used
   * @param photo the photo associated with the product
   * @param newBatch the batch data
   * @return the created batch
   */
  private Batch createBatchInternal(
      Producer producer, Product product, Photo photo, NewBatch newBatch) {
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
   * Rejette un lot avec un message de notification optionnel.
   *
   * @param id l'identifiant du lot à rejeter
   * @param message le message expliquant le rejet (peut être null ou vide)
   * @return le lot rejeté ou null si non trouvé
   */
  public Batch rejectBatch(long id, String message) {
    Batch batch = batchRepository.findById(id).orElse(null);
    if (batch == null) {
      return null;
    }

    batch.setStatus(BatchStatus.REJECTED);

    // Création de la notification seulement si un message est fourni
    if (message != null && !message.trim().isEmpty()) {
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
    }

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
      BatchView batchView = new BatchView();
      batchView.setId(batch.getId());
      batchView.setStatus(batch.getStatus().toString());
      batchView.setCreatedAt(batch.getProductionDate());
      batchView.setProductName(batch.getProduct().getName());
      batchView.setProductType(batch.getProduct().getType().getTitle());
      batchView.setUnitPrice(batch.getUnitPrice());
      batchView.setUnitType(batch.getSaleUnit());
      batchView.setImageUrl(batch.getPhoto() != null ? batch.getPhoto().getImageLocation() : null);
      batchView.setAvailabilityDate(batch.getAvailabilityDate());
      batchView.setAvailableQuantity(batch.getAvailableQuantity());
      batchView.setProducerId(batch.getProducer().getId());
      batchView.setProducerName(batch.getProducer().getCompany());
      batchViews.add(batchView);
    }

    return batchViews;
  }

  /**
   * Récupère tous les lots ayant le statut PENDING et les convertit en DTO ManagerBatchView, triés
   * par date de création.
   *
   * @return la liste des lots en attente au format ManagerBatchView, triés par date de création
   */
  public List<ManagerBatchView> getPendingBatches() {
    // Récupérer les lots avec statut PENDING
    List<Batch> batches = batchRepository.findByStatus(BatchStatus.PENDING);
    List<ManagerBatchView> managerBatchViews = new ArrayList<>();

    // Convertir chaque lot en ManagerBatchView
    for (Batch batch : batches) {
      ManagerBatchView view = new ManagerBatchView();
      view.setId(batch.getId());
      view.setCreatedAt(batch.getProductionDate());
      view.setProductName(batch.getProduct().getName());
      view.setProductType(batch.getProduct().getType().getTitle());
      view.setUnitPrice(batch.getUnitPrice());
      view.setUnitType(batch.getSaleUnit());
      view.setImageLocation(batch.getPhoto() != null ? batch.getPhoto().getImageLocation() : null);
      view.setAvailabilityDate(batch.getAvailabilityDate());
      view.setAvailableQuantity(batch.getAvailableQuantity());
      view.setProducerId(batch.getProducer().getId());
      view.setProducerName(batch.getProducer().getCompany());

      // Champ spécifique à ManagerBatchView
      view.setDescription(batch.getProduct().getDescription());
      managerBatchViews.add(view);
    }

    // Trier la liste par date de création (productionDate)
    managerBatchViews.sort(Comparator.comparing(ManagerBatchView::getCreatedAt));

    return managerBatchViews;
  }
}
