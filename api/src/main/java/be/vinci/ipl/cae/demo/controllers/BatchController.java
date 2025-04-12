package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.NewBatch;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Photo;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
import be.vinci.ipl.cae.demo.services.AuthsService;
import be.vinci.ipl.cae.demo.services.AuthsService.SecurityConstants;
import be.vinci.ipl.cae.demo.services.BatchService;
import be.vinci.ipl.cae.demo.services.PhotoService;
import be.vinci.ipl.cae.demo.services.ProductService;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** Controller pour gérer les opérations sur les lots. */
@RestController
@RequestMapping("/batches")
public class BatchController {

  private final AuthsService authsService;
  private final BatchService batchService;
  private final ProductService productService;
  private final PhotoService photoService;
  private final ProductTypeRepository productTypeRepository;

  /**
   * Constructeur du controller.
   *
   * @param batchService le service de gestion des lots injecté
   * @param productService le service de gestion des photos injecté
   * @param photoService le service de gestion des photos injecté
   * @param productTypeRepository le repository de gestion des types de produits injecté
   */
  public BatchController(
      BatchService batchService,
      ProductService productService,
      PhotoService photoService,
      ProductTypeRepository productTypeRepository,
      AuthsService authsService) {
    this.authsService = authsService;
    this.batchService = batchService;
    this.productService = productService;
    this.photoService = photoService;
    this.productTypeRepository = productTypeRepository;
  }

  /**
   * Crée un nouveau lot avec un produit et une photo associée.
   *
   * @param newBatch les informations du lot à créer (au format JSON)
   * @param image le fichier image du produit
   * @return le lot créé
   */
  @PostMapping("/createbatch")
  @PreAuthorize(SecurityConstants.HAS_ROLE_PRODUCER)
  public Batch createBatch(
      @RequestPart("batch") NewBatch newBatch, @RequestPart("image") MultipartFile image) {

    System.out.println("=== DÉBUT TRAITEMENT IMAGE ===");
    System.out.println("Image reçue: " + image.getOriginalFilename());
    System.out.println("Type de contenu: " + image.getContentType());
    System.out.println("Taille: " + image.getSize() + " octets");
    System.out.println("=== FIN TRAITEMENT IMAGE ===");

    System.out.println(
        "createBatch called"
            + newBatch.getProductName()
            + " "
            + newBatch.getProductType()
            + " "
            + newBatch.getProductDescription()
            + " "
            + newBatch.getAvailabilityDate()
            + " "
            + newBatch.getUnitPrice()
            + " "
            + newBatch.getSaleUnit()
            + " "
            + newBatch.getAvailableQuantity());

    if (newBatch == null || image == null) {
      throw new ConflictException("Données invalides");
    }

    // 1. Upload the photo and get its ID
    Photo photo = photoService.createPhoto(newBatch.getProductName(), image);
    if (photo == null) {
      throw new ConflictException("Échec de la création de la photo");
    }

    // 2. Get or create the product type and get its ID
    ProductType productType = productTypeRepository.findByTitle(newBatch.getProductType());
    if (productType == null) {
      throw new ConflictException("Type de produit non trouvé: " + newBatch.getProductType());
    }
    System.out.println(" 1");

    // 3. Create the product and get its ID
    Product product =
        productService.createProduct(
            newBatch.getProductName(), productType, newBatch.getProductDescription(), photo);
    if (product == null) {
      throw new ConflictException("Échec de la création du produit");
    }
    System.out.println(" 2");

    // 4. Create the batch with the IDs
    Batch batch = batchService.createBatch(newBatch, product, photo);
    if (batch == null) {
      throw new ConflictException("Échec de la création du lot");
    }

    return batch;
  }

  /**
   * Affiche les lots d'un producteur dont la quantité est supérieur à 0.
   *
   * @param token le toke du producteur
   * @return une liste des lots trouvés
   */
  @GetMapping("/mybatches")
  @PreAuthorize(SecurityConstants.HAS_ROLE_PRODUCER)
  public Iterable<Batch> myBatches(@RequestHeader("Authorization") String token) {
    Producer producer = authsService.isValidProducerToken(token);
    return batchService.getBatchesByProducer(producer.getId());
  }

  /**
   * Récupère tous les lots.
   *
   * @return la liste des lots
   */
  @GetMapping({"", "/"})
  public Iterable<Batch> getAllBatches() {
    // TODO verify token if is a manager
    return batchService.getAllBatches();
  }

  /**
   * Récupère un lot par son id.
   *
   * @param id l'identifiant du lot
   * @return le lot correspondant
   */
  @GetMapping("/{id}")
  public Batch getBatchById(@PathVariable long id) {
    // TODO verify token if is a manager or owner of the batch producer
    Batch batch = batchService.getBatchById(id);
    if (batch == null) {
      throw new ResourceNotFoundException("Lot non trouvé");
    }
    return batch;
  }

  /**
   * Accepte un lot.
   *
   * @param id l'identifiant du lot à accepter
   * @return le lot accepté
   */
  @PatchMapping("/{id}/accept")
  @PreAuthorize(SecurityConstants.HAS_ROLE_MANAGER)
  public Batch acceptBatch(@PathVariable long id) {
    // TODO verify token if is a manager
    Batch batch = batchService.acceptBatch(id);
    // TODO remove verification
    if (batch == null) {
      throw new ResourceNotFoundException("Lot non trouvé");
    }
    return batch;
  }

  /**
   * Rejette un lot avec un message de notification.
   *
   * @param id l'identifiant du lot à rejeter
   * @param message le message expliquant le rejet
   * @return le lot rejeté
   */
  @PatchMapping("/{id}/reject")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  public Batch rejectBatch(@PathVariable long id, @RequestParam String message) {
    // TODO verify token if is a manager
    Batch batch = batchService.rejectBatch(id, message);
    // TODO remove verification
    if (batch == null) {
      throw new ResourceNotFoundException("Lot non trouvé");
    }
    return batch;
  }

  /**
   * Marque un lot comme reçu.
   *
   * @param id l'identifiant du lot à marquer comme reçu
   * @return le lot mis à jour
   */
  @PatchMapping("/{id}/receive")
  @PreAuthorize(SecurityConstants.HAS_ROLE_VOLUNTEER)
  public Batch receiveBatch(@PathVariable long id, @RequestHeader("Authorization") String token) {
    Batch batch = batchService.getBatchById(id);

    if (batch == null) {
      throw new ResourceNotFoundException("Lot non trouvé");
    }

    // Attempt to mark the batch as received
    batch = batchService.receiveBatch(id);
    if (batch == null) {
      throw new ConflictException("Impossible de marquer le lot comme reçu");
    }

    return batch;
  }

  /**
   * Met à jour l'image d'un lot avec une nouvelle image téléchargée.
   *
   * @param id l'identifiant du lot à mettre à jour
   * @param image le fichier image à utiliser
   * @return le lot mis à jour
   */
  @PatchMapping("/{id}/updateImage")
  @PreAuthorize(SecurityConstants.HAS_ROLE_PRODUCER)
  public Batch updateBatchImage(
      @PathVariable long id,
      @RequestPart("image") MultipartFile image,
      @RequestHeader("Authorization") String token) {

    // Mettre à jour la photo
    Batch batch = verifyBatchOwnership(id, token);
    String productName = batch.getProduct().getName();

    Photo photo = photoService.createPhoto(productName, image);
    if (photo == null) {
      throw new ConflictException("Échec de la mise à jour de la photo");
    }

    return updateBatchWithPhoto(id, photo);
  }

  /**
   * Met à jour l'image d'un lot avec une image existante par ID.
   *
   * @param id l'identifiant du lot à mettre à jour
   * @param requestBody contient l'identifiant de l'image à utiliser
   * @return le lot mis à jour
   */
  @PatchMapping("/{id}/updateImageById")
  @PreAuthorize(SecurityConstants.HAS_ROLE_PRODUCER)
  public Batch updateBatchImageById(
      @PathVariable long id,
      @RequestBody Map<String, Long> requestBody,
      @RequestHeader("Authorization") String token) {

    // Extraire l'imageId du corps de la requête
    Long imageId = requestBody.get("imageId");
    if (imageId == null) {
      throw new ConflictException("L'identifiant de l'image est requis");
    }

    // Verify ownership
    verifyBatchOwnership(id, token);

    // Récupérer la photo existante par ID
    Photo photo = photoService.getPhotoById(imageId);
    if (photo == null) {
      throw new ResourceNotFoundException("Image non trouvée");
    }

    return updateBatchWithPhoto(id, photo);
  }

  /**
   * Vérifie que le producteur est propriétaire du lot.
   *
   * @param batchId l'identifiant du lot
   * @param token le token d'authentification
   * @return le lot si l'utilisateur est autorisé
   * @throws ResourceNotFoundException si le lot n'existe pas
   * @throws ConflictException si l'utilisateur n'est pas autorisé
   */
  private Batch verifyBatchOwnership(long batchId, String token) {
    // Vérifier que l'utilisateur est le producteur du lot
    Producer producer = authsService.isValidProducerToken(token);
    Batch batch = batchService.getBatchById(batchId);

    if (batch == null) {
      throw new ResourceNotFoundException("Lot non trouvé");
    }

    if (!batch.getProducer().getId().equals(producer.getId())) {
      throw new ConflictException("Vous n'êtes pas autorisé à modifier ce lot");
    }

    return batch;
  }

  /**
   * Met à jour un lot avec une nouvelle photo.
   *
   * @param batchId l'identifiant du lot
   * @param photo la photo à associer
   * @return le lot mis à jour
   * @throws ConflictException si la mise à jour échoue
   */
  private Batch updateBatchWithPhoto(long batchId, Photo photo) {
    // Mettre à jour le lot avec la photo
    Batch batch = batchService.updateBatchPhoto(batchId, photo);
    if (batch == null) {
      throw new ConflictException("Échec de la mise à jour du lot");
    }

    return batch;
  }

  /**
   * Récupère tous les lots approuvés.
   *
   * @return la liste des lots avec le statut APPROVED
   */
  @GetMapping("/approved")
  public List<Batch> getApprovedBatches() {
    return batchService.getApprovedBatches();
  }

  /**
   * Récupère tous les lots reçus.
   *
   * @return la liste des lots avec le statut RECEIVED
   */
  @GetMapping("/received")
  public List<Batch> getReceivedBatches() {
    return batchService.getReceivedBatches();
  }
}
