package be.vinci.ipl.cae.demo.models.dtos.views;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO représentant les informations d'un lot en attente pour la page de gestion des gestionnaires.
 * Contient toutes les données nécessaires pour la vue HandleManagerBatchesPage.
 */
@Data
@NoArgsConstructor
public class ManagerBatchView {
  private Long id;
  private String productName;
  private String productType;
  private String imageUrl;
  private String description; // Description du produit
  private LocalDate availabilityDate;
  private Integer availableQuantity;
  private Double unitPrice;
  private String unitType;
  private Long producerId;
  private String producerName;
  private LocalDate createdAt;
  private String rejectionReason;
  private String status;
}
