package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service class for managing reservations.
 */
@Service
public class ReservationService {

  private final ReservationRepository reservationRepository;
  private final BatchRepository batchRepository;
  private final ReservationLineService reservationLineService;
  private final ProductService productService;

  /**
   * Constructs a new ReservationService with the specified repositories and services.
   *
   * @param reservationRepository  the repository for reservations
   * @param batchRepository        the repository for batches
   * @param reservationLineService the service for reservation lines
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
   * Creates a new reservation for a client with the specified product and quantity.
   *
   * @param client   the client making the reservation
   * @param product  the product to reserve
   * @param quantity the quantity of the product to reserve
   * @return the created reservation
   */
  public Reservation createReservation(Client client, Product product, int quantity) {
    Reservation reservation = new Reservation();
    reservation.setClient(client);
    reservation.setPrice(0.0);
    reservation.setStatus("pending");
    reservation.setReservationDate(LocalDate.now());
    reservationLineService.addProduct(reservation, product, quantity);
    reservationRepository.save(reservation);
    return reservation;
  }

  /**
   * Reserves a product for a client with the specified quantity.
   *
   * @param client    the client making the reservation
   * @param productId the ID of the product to reserve
   * @param quantity  the quantity of the product to reserve
   */
  public void reserveProduct(Client client, Long productId, int quantity) {
    Product product = productService.getProductById(productId);
    if (product == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
    }
    Reservation reservation =
        reservationRepository
            .findByClientAndStatus(client, "pending")
            .orElseGet(() -> createReservation(client, product, quantity));

    reservationLineService.addProduct(reservation, product, quantity);
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
   * Completes a reservation.
   *
   * @param reservationId the ID of reservation to complete
   */
  public void completeReservation(Long reservationId) {
    Reservation reservation =
        reservationRepository
            .findById(reservationId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));
    reservation.setStatus("completed");
    reservation.setSaleDate(LocalDate.now());
    reservationRepository.save(reservation);
  }

  /**
   * Cancels a reservation for a client by reservation ID.
   *
   * @param client        the client who made the reservation.
   * @param reservationId the ID of the reservation to cancel.
   */
  public void cancelReservation(Client client, Long reservationId) {
    Reservation reservation =
        reservationRepository
            .findById(reservationId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));
    if (!reservation.getClient().equals(client)) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Reservation does not belong to the client");
    }
    reservation.setStatus("canceled");
    for (ReservationLine line : reservation.getReservationLines()) {
      Batch batch = line.getBatch();
      batch.setAvailableQuantity(batch.getAvailableQuantity() + line.getQuantity());
      batchRepository.save(batch);
    }
    reservationRepository.save(reservation);
  }
}
