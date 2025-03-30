package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Data Transfer Object for Batch. */
@Data
@NoArgsConstructor
public class BatchDto {
  private String product;
  private String productType;
  private String description;
  private String photo;
  private LocalDate availabilityDate;
  private Double unitPrice;
  private String saleUnit;
  private Integer availableQuantity;
}
