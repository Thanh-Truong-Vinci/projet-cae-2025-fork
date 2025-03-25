package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Notification entity representing user notifications.
 */
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
