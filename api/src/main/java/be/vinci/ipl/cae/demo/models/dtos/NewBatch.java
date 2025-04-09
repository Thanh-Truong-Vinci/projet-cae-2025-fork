package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/** DTO pour la création des lots. */
@Data
@NoArgsConstructor
public class NewBatch {
  // Informations du producteur
  private String email;

  // Informations du produit
  private String productName;
  private String productType;

  // Informations du lot
  private LocalDate availabilityDate;
  private Double unitPrice;
  private String saleUnit;
  private Integer availableQuantity;
  private String productDescription;
}
