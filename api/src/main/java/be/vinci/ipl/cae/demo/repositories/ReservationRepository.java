package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationStatus;

import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/** Repository interface for Reservation entities. */
@Repository
public interface ReservationRepository extends CrudRepository<Reservation, Long> {

  /**
   * Finds reservations by client.
   *
   * @param client the client associated with the reservations
   * @return a list of reservations for the specified client
   */
  List<Reservation> findByClient(Client client);

  /**
   * Finds a reservation by client and status.
   *
   * @param client the client associated with the reservation
   * @param status the status of the reservation
   * @return an optional containing the reservation if found
   */
  Optional<Reservation> findByClientAndStatus(Client client, String status);

  /**
   * Finds reservations by status.
   *
   * @param status the status of the reservations
   * @return a list of reservations with the specified status
   */
  List<Reservation> findByStatus(ReservationStatus status);
}
