package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the availability of a product, including the quantity available.
 */
@Data
@NoArgsConstructor
public class ProductDiponibility extends ProductDto {
  private int quantity;
}
