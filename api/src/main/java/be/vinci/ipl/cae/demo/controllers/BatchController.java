package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NewBatch;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.services.BatchService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Controller pour gérer les opérations sur les lots. */
@RestController
@RequestMapping("/batches")
public class BatchController {

  private final BatchService batchService;

  /**
   * Constructeur du controller.
   *
   * @param batchService le service de gestion des lots injecté
   */
  public BatchController(BatchService batchService) {
    this.batchService = batchService;
  }

  /**
   * Crée un nouveau lot.
   *
   * @param newBatch les informations du lot à créer
   * @return le lot créé
   */
  @PostMapping({"", "/"})
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  public Batch createBatch(@RequestBody NewBatch newBatch) {
    // TODO verify token if is a producer
    if (newBatch == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Données du lot invalides");
    }

    // TODO call addBatch, not createBatch
    return batchService.createBatch(newBatch);
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
}
