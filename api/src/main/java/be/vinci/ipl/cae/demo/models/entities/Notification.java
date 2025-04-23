package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Notification entity.
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idNotification;

  @Column(nullable = false)
  private String message;

  @Column(nullable = false)
  private boolean read;

  @Column(nullable = false)
  private LocalDate date;

  @Column(nullable = true)
  private String reasonOfReject;

  @ManyToOne
  private User producer;

  @OneToOne
  private Batch batch;
  
  // Méthodes supplémentaires pour compatibilité avec BatchService
  
  /**
   * Alias pour getIdNotification() pour compatibilité.
   * @return l'id de la notification
   */
  public Long getId() {
    return this.idNotification;
  }
  
  /**
   * Alias pour setRead() pour compatibilité.
   * @param value la valeur à définir
   */
  public void setIsRead(boolean value) {
    this.read = value;
  }
}