package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/** DTO pour la création et modification des types de produits. */
@Data
@NoArgsConstructor
public class NewProductType {
  private String title;
}
