package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

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
  private Reservation reservation;

  @ManyToOne
  @JoinColumn(name = "lot_id", nullable = false)
  private Lot lot;
}
