package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ReservationRepository extends CrudRepository<Reservation, Long> {
  Optional<Reservation> findByClientAndStatus(Client client, String status);
  List<Reservation> findByClient(Client client);
}

