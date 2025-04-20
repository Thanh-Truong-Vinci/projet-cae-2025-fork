package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for ReservationLine entities.
 */
@Repository
public interface ReservationLineRepository extends CrudRepository<ReservationLine, Long> {

  /**
   * Recherche les lignes de réservation par réservation et produit, triées par date de production
   * du lot en ordre croissant.
   *
   * @param reservation La réservation à rechercher
   * @param product     Le produit à rechercher
   * @return Une liste de lignes de réservation correspondant à la réservation et au produit
   *     spécifiés, triées par date de production du lot en ordre croissant
   */
  List<ReservationLine> findByReservationAndBatchProductOrderByBatchProductionDateAsc(
      Reservation reservation, Product product);
}
