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
  @Column(name = "id_notification")
  private Long id;

  @Column(name = "is_read", nullable = false)
  private Boolean isRead;

  @Column(nullable = true)
  private String message;
}
