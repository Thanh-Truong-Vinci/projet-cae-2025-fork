package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.models.entities.ReservationStatus;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/** Service class for managing reservations. */
@Service
public class ReservationService {

  private final ReservationRepository reservationRepository;
  private final BatchRepository batchRepository;
  private final ReservationLineService reservationLineService;
  private final ProductService productService;

  /**
   * Constructs a new ReservationService with the specified repositories and services.
   *
   * @param reservationRepository the repository for reservations
   * @param batchRepository the repository for batches
   * @param reservationLineService the service for reservation lines
   * @param productService the service for products
   */
  public ReservationService(
      ReservationRepository reservationRepository,
      BatchRepository batchRepository,
      ReservationLineService reservationLineService,
      ProductService productService) {
    this.reservationRepository = reservationRepository;
    this.batchRepository = batchRepository;
    this.reservationLineService = reservationLineService;
    this.productService = productService;
  }

  /**
   * Reserves a product for a client with the specified quantity.
   *
   * @param client the client making the reservation
   * @param batch the batch to reserve
   * @param quantity the quantity of the product to reserve
   */
  public void reserveProduct(Client client, Batch batch, int quantity) {
    Reservation reservation =
        reservationRepository
            .findByClientAndStatus(client, ReservationStatus.BUILDING)
            .orElseGet(
                () -> {
                  Reservation newReservation = new Reservation();
                  newReservation.setClient(client);
                  newReservation.setPrice(0.0);
                  newReservation.setStatus(ReservationStatus.BUILDING);
                  newReservation.setReservationDate(LocalDate.now());
                  return reservationRepository.save(newReservation);
                });

    reservationLineService.addProduct(reservation, batch, quantity);
    reservationRepository.save(reservation);
  }

  /**
   * Retrieves the reservations for a client.
   *
   * @param client the client whose reservations are to be retrieved
   * @return a list of reservations for the specified client
   */
  public List<Reservation> getReservations(Client client) {
    return reservationRepository.findByClient(client);
  }

  /**
   * Retrieves all reservations regardless of the client.
   *
   * @return a list of all reservations.
   */
  public List<Reservation> getAllReservations() {
    return reservationRepository.findAll();
  }

  /**
   * Changes the status of a reservation.
   *
   * @param reservationId the ID of the reservation to update
   * @param newStatus the new status for the reservation
   * @return the updated reservation
   */
  public Reservation changeStatus(Long reservationId, ReservationStatus newStatus) {
    Reservation reservation = reservationRepository.findById(reservationId).orElse(null);
    if (reservation == null) {
      return null;
    }

    // If changing to CANCELLED status, return items to stock
    if (newStatus == ReservationStatus.CANCELLED
        && reservation.getStatus() != ReservationStatus.CANCELLED) {
      for (ReservationLine line : reservation.getReservationLines()) {
        Batch batch = line.getBatch();
        batch.setAvailableQuantity(batch.getAvailableQuantity() + line.getQuantity());
        batchRepository.save(batch);
      }
    }

    // If confirming a reservation, set the sale date
    if (newStatus == ReservationStatus.CONFIRMED) {
      double price = 0;
      for (ReservationLine line : reservation.getReservationLines()) {
        price += line.getQuantity() * line.getBatch().getUnitPrice();
      }
      reservation.setPrice(price);
      reservation.setSaleDate(LocalDate.now());
    }

    reservation.setStatus(newStatus);
    return reservationRepository.save(reservation);
  }

  /**
   * Gets a reservation by its ID.
   *
   * @param reservationId the ID of the reservation to get
   * @return the reservation or null if not found
   */
  public Reservation getReservationById(Long reservationId) {
    return reservationRepository.findById(reservationId).orElse(null);
  }

  /**
   * Deletes a reservation and its associated lines.
   *
   * @param reservation the reservation to delete
   * @return the deleted reservation
   */
  public Reservation deleteReservation(Reservation reservation) {
    for (ReservationLine line : reservation.getReservationLines()) {
      reservationLineService.deleteReservationLine(line);
    }
    reservationRepository.delete(reservation);
    return reservation;
  }
}
