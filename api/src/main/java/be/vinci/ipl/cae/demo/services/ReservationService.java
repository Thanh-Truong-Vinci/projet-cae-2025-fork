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
import org.springframework.stereotype.Service;

/**
 * Service class for managing reservations.
 */
@Service
public class ReservationService {

  private final ReservationRepository reservationRepository;
  private final BatchRepository batchRepository;
  private final ReservationLineService reservationLineService;

  /**
   * Constructs a new ReservationService with the specified repositories and services.
   *
   * @param reservationRepository the repository for reservations
   * @param batchRepository the repository for batches
   * @param reservationLineService the service for reservation lines
   */
  public ReservationService(ReservationRepository reservationRepository,
                            BatchRepository batchRepository,
                            ReservationLineService reservationLineService) {
    this.reservationRepository = reservationRepository;
    this.batchRepository = batchRepository;
    this.reservationLineService = reservationLineService;
  }

  /**
   * Reserves a product for a client with the specified quantity.
   *
   * @param client the client making the reservation
   * @param product the product to reserve
   * @param quantity the quantity of the product to reserve
   */
  public void reserveProduct(Client client, Product product, int quantity) {
    Reservation reservation = reservationRepository.findByClientAndStatus(client, "pending")
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
   * @param reservation the reservation to complete
   */
  public void completeReservation(Reservation reservation) {
    reservation.setStatus("completed");
    reservation.setSaleDate(LocalDate.now());
    reservationRepository.save(reservation);
  }

  /**
   * Cancels a reservation.
   *
   * @param reservation the reservation to cancel
   */
  public void cancelReservation(Reservation reservation) {
    reservation.setStatus("canceled");
    for (ReservationLine line : reservation.getReservationLines()) {
      Batch batch = line.getBatch();
      batch.setAvailableQuantity(batch.getAvailableQuantity() + line.getQuantity());
      batchRepository.save(batch);
    }
    reservationRepository.save(reservation);
  }

  /**
   * Creates a new reservation for a client with the specified product and quantity.
   *
   * @param client the client making the reservation
   * @param product the product to reserve
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
}
