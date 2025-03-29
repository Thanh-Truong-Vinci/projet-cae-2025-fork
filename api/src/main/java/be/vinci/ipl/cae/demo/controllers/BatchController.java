package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NewBatch;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.services.BatchService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller pour gérer les opérations sur les lots.
 */
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
   * Récupère tous les lots.
   *
   * @return la liste des lots
   */
  @GetMapping({"", "/"})
  public Iterable<Batch> getAllBatches() {
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
    Batch batch = batchService.getBatchById(id);
    if (batch == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot non trouvé");
    }
    return batch;
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
    if (newBatch == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Données du lot invalides");
    }
    
    return batchService.createBatch(newBatch);
  }

  /**
   * Met à jour un lot existant.
   *
   * @param id l'identifiant du lot à mettre à jour
   * @param newBatch les nouvelles informations du lot
   * @return le lot mis à jour
   */
  @PatchMapping("/{id}")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  public Batch updateBatch(@PathVariable long id, @RequestBody NewBatch newBatch) {
    if (newBatch == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Données du lot invalides");
    }
    
    Batch batch = batchService.updateBatch(id, newBatch);
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
    Batch batch = batchService.acceptBatch(id);
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
    Batch batch = batchService.rejectBatch(id, message);
    if (batch == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot non trouvé");
    }
    return batch;
  }
}