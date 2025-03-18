package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ProductType entity.
 */
@Entity
@Table(name = "product_types")
@Data
@NoArgsConstructor
public class ProductType {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_product_type")
  private Long id;

  @Column(nullable = false)
  private String title;
}
