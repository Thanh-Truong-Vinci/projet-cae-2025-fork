package be.vinci.ipl.cae.demo.models.entities;

import java.time.LocalDate;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a reservation made by a client.
 */
@Data
@NoArgsConstructor
public class Reservation {
  private Long id;
  private Client client;
  private String status;
  private LocalDate reservationDate;
  private LocalDate saleDate;
  private Double price;
  private List<ReservationLine> reservationLines;
}
