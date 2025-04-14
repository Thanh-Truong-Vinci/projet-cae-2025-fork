package be.vinci.ipl.cae.demo.models.dtos.views;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/** DTO représentant les informations d'un lot pour l'affichage. */
@Data
@NoArgsConstructor
public class BatchView {
  private Long id;
  private String productName;
  private String productType;
  private String imageUrl;
  private LocalDate availabilityDate;
  private Integer availableQuantity;
  private Double unitPrice;
  private String unitType;
  private Long producerId;
  private String producerName;
  private LocalDate createdAt;
  private String status;
  private String rejectionReason;
}
