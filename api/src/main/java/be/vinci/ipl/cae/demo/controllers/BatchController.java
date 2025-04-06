package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NewBatch;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.services.AuthsService.SecurityConstants;
import be.vinci.ipl.cae.demo.services.BatchService;

import java.util.List;

import be.vinci.ipl.cae.demo.services.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.server.ResponseStatusException;

/** Controller pour gérer les opérations sur les lots. */
@RestController
@RequestMapping("/batches")
public class BatchController {

  private final BatchService batchService;
  private final ProductService productService;

  /**
   * Constructeur du controller.
   *
   * @param batchService le service de gestion des lots injecté
   */
  public BatchController(BatchService batchService, ProductService productService) {
    this.batchService = batchService;
    this.productService = productService;
  }

  /**
   * Crée un nouveau lot.
   *
   * @param newBatch les informations du lot à créer
   * @return le lot créé
   */
  @PostMapping({"", "/"})
  @PreAuthorize(SecurityConstants.HAS_ROLE_PRODUCER)
  public Batch createBatch(@RequestBody NewBatch newBatch) {
    if (newBatch == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Données du lot invalides");
    }

    // TODO call addBatch, not createBatch
    return batchService.createBatch(newBatch);
  }

  /**
   * Crée un nouveau lot avec un produit et une photo associée.
   *
   * @param newBatchJson les informations du lot à créer (au format JSON)
   * @param productName le nom du produit
   * @param productType le type du produit
   * @param productDescription la description du produit
   * @param image l'image du produit
   * @return le lot créé
   */
  @PostMapping(value = {"", "/"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @PreAuthorize(SecurityConstants.HAS_ROLE_PRODUCER)
  public Batch createBatch(@RequestPart("batch") NewBatch newBatchJson,
                           @RequestPart("productName") String productName,
                           @RequestPart("productType") String productType,
                           @RequestPart("productDescription") String productDescription,
                           @RequestPart("image") MultipartFile image) {
      
      if (newBatchJson == null || productName == null || productType == null || image == null) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Données invalides");
      }

      try {
          // 1. Upload the photo and create a Photo entity
          Photo photo = photoService.createPhoto(productName, image);
          
          // 2. Create the product with the photo
          productService.createProduct(productName, productType, productDescription, photo.getId());
          
          // 3. Create the batch with the product info
          newBatchJson.setProductName(productName);
          return batchService.createBatch(newBatchJson);
      } catch (Exception e) {
          throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                                          "Erreur lors de la création du lot: " + e.getMessage());
      }
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
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot non trouvé");
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
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  public Batch acceptBatch(@PathVariable long id) {
    // TODO verify token if is a manager
    Batch batch = batchService.acceptBatch(id);
    // TODO remove verification
    if (batch == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot non trouvé");
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
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot non trouvé");
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
    try {
      return batchService.receiveBatch(id);
    } catch (RuntimeException e) {
      if ("Batch not found".equals(e.getMessage())) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot non trouvé", e);
      } else {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
      }
    }
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
}
