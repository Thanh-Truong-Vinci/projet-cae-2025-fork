package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "photos")
@Data
@NoArgsConstructor
public class Photo {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_photo")
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String url;
}
