package be.vinci.ipl.cae.demo.models.dtos.views;

import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Data;

/**
 * Data Transfer Object (DTO) representing a reservation view. This class is used to present
 * reservation data to clients in a structured format, containing only the necessary information for
 * display purposes.
 */
@Data
public class ReservationView {

  private Long id;
  private Long clientId;
  private ReservationStatus status;
  private LocalDate reservationDate;
  private LocalDate saleDate;
  private Double price;
  private List<ReservationLineView> reservationLines;
  private Long version; // Added for optimistic locking

  /**
   * Constructor for ReservationView. Creates a reservation view from a Reservation entity.
   *
   * @param reservation the Reservation entity to convert
   */
  public ReservationView(Reservation reservation) {
    this.id = reservation.getId();
    this.clientId = reservation.getClient() != null ? reservation.getClient().getId() : null;
    this.status = reservation.getStatus();
    this.reservationDate = reservation.getReservationDate();
    this.saleDate = reservation.getSaleDate();
    this.price = reservation.getPrice();
    this.reservationLines =
        reservation.getReservationLines().stream()
            .map(ReservationLineView::new)
            .collect(Collectors.toList());
    this.version = reservation.getVersion(); // Initialize the version field
  }
}
