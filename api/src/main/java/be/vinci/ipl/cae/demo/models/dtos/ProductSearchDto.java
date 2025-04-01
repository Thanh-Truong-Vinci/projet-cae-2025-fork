package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/** Data Transfer Object for Product Search. */
@Data
@NoArgsConstructor
public class ProductSearchDto {
  private String search;
  private String type;
}
