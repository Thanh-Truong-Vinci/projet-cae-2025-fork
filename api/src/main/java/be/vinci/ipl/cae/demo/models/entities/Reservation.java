package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
public class Reservation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_reservation")
  private Long id;

  @Column(nullable = false)
  private Double price;

  @Column(nullable = false)
  private String status; // e.g., "pending", "retrieved", "canceled"

  @Column(name = "reservation_date", nullable = false)
  private LocalDate reservationDate;

  @Column(name = "sale_date", nullable = true)
  private LocalDate saleDate;

  @ManyToOne
  @JoinColumn(name = "client_id", nullable = false)
  private Client client;

  @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL)
  private List<ReservationLine> reservationLines;
}
