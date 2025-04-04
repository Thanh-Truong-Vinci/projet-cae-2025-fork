package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/** DTO pour la création et modification des produits. */
@Data
@NoArgsConstructor
public class NewProduct {
  private String name;
  private Long typeId;
  private String description;
  private Long photoId;
}
