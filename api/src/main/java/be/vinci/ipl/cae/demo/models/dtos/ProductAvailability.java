package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Represents the availability of a product, including the quantity available.
 */
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class ProductAvailability extends ProductDto {
  private int quantity;
}
