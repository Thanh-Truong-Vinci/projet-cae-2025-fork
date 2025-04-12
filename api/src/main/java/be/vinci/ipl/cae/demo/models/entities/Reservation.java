package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Represents a reservation made by a client. */
@Entity
@Data
@NoArgsConstructor
public class Reservation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_reservation")
  private Long id;

  @ManyToOne
  @JoinColumn(name = "client", nullable = true)
  private Client client;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private ReservationStatus status;

  @Column(name = "reservation_date", nullable = false)
  private LocalDate reservationDate;

  @Column(name = "sale_date")
  private LocalDate saleDate;

  @Column(name = "price", nullable = false)
  private Double price;

  @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  private List<ReservationLine> reservationLines;
}
