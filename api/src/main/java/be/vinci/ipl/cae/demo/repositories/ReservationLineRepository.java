package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for ReservationLine entities.
 */
@Repository
public interface ReservationLineRepository extends CrudRepository<ReservationLine, Long> {

}
