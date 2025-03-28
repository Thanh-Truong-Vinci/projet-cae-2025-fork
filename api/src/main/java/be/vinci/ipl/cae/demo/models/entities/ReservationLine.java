package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ReservationLine entity representing individual items in a reservation.
 */
@Entity
@Table(name = "reservation_lines")
@Data
@NoArgsConstructor
public class ReservationLine {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_reservation_line")
  private Long id;

  @Column(nullable = false)
  private Integer quantity;

  @ManyToOne
  @JoinColumn(name = "reservation_id", nullable = false)
  private Long reservation;

  @ManyToOne
  @JoinColumn(name = "lot_id", nullable = false)
  private Long lot;
}
