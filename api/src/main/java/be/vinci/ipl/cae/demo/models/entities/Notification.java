package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_proposition")
  private Long id;

  @Column(name = "est_lu", nullable = false)
  private Boolean isRead;

  @Column(nullable = true)
  private String message;
}
