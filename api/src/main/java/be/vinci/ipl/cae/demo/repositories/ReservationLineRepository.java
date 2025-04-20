package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.Product;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/** Repository interface for ReservationLine entities. */
@Repository
public interface ReservationLineRepository extends CrudRepository<ReservationLine, Long> {
    List<ReservationLine> findByReservationAndProductOrderByBatchProductionDateAsc(
        Reservation reservation, Product product);
}
