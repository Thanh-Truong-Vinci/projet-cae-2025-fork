package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Notification entity. */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idNotification;

  @Version
  private Long version;

  @Column(nullable = false)
  private String message;

  @Column(nullable = false)
  private boolean read = false; // Valeur par défaut

  @Column(nullable = false)
  private LocalDate date;

  @Column(nullable = true)
  private String reasonOfReject;

  @ManyToOne
  @JoinColumn(name = "producer_id", nullable = false)
  private User producer;

  @OneToOne
  @JoinColumn(name = "batch_id", nullable = false)
  private Batch batch;

  /** Initialise les valeurs par défaut avant la persistance. */
  @PrePersist
  public void prePersist() {
    if (date == null) {
      date = LocalDate.now();
    }
  }

  /**
   * Alias pour getIdNotification() pour compatibilité.
   *
   * @return l'id de la notification
   */
  public Long getId() {
    return this.idNotification;
  }

  /**
   * Alias pour setIdNotification() pour compatibilité.
   *
   * @param id l'id à définir
   */
  public void setId(Long id) {
    this.idNotification = id;
  }

  /**
   * Alias pour setRead() pour compatibilité.
   *
   * @param value la valeur à définir
   */
  public void setIsRead(boolean value) {
    this.read = value;
  }
}
