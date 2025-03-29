package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/** DTO pour la création et modification des lots. */
@Data
@NoArgsConstructor
public class NewBatch {
  private Long managerId;
  private Long producerId;
  private Long productId;
  private String photo;
  private LocalDate availabilityDate;
  private Double unitPrice;
  private String saleUnit;
  private Integer availableQuantity;
}
