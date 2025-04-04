package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Photo entity representing product photos. */
@Entity
@Table(name = "photos")
@Data
@NoArgsConstructor
public class Photo {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_photo")
  private Long id;

  @Column(name = "product_name", nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'default_product'")
  private String productName;

  @Column(name = "url") private String imageLocation;
}
