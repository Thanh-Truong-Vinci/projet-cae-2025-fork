package be.vinci.ipl.cae.demo.models.entities;

import java.time.LocalDate;

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
 * Reservation entity representing client reservations.
 */
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
  private Long client;
}
