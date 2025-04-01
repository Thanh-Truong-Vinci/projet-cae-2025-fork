package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/** Data Transfer Object for Product. */
@Data
@NoArgsConstructor
public class ProductDto {
  private String type;
  private String name;
  private String description;
  private String photo;
}
