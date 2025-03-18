package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Product entity.
 */
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
public class Product {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_product")
  private Long id;

  @ManyToOne
  @JoinColumn(name = "id_product_type", nullable = false)
  private ProductType type;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String description;
}
