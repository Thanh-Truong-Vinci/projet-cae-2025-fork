package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.BatchStatus;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/** Repository interface for Batch entities. */
@Repository
public interface BatchRepository extends CrudRepository<Batch, Long> {

  /**
   * Finds batches by product and available quantity greater than the specified quantity.
   *
   * @param productId the product id
   * @param quantity the minimum available quantity
   * @return the list of batches
   */
  List<Batch> findByProductIdAndAvailableQuantityGreaterThan(Long productId, int quantity);

  /**
   * Finds batches by product id and available quantity greater than the specified quantity, ordered
   * by production date ascending.
   *
   * @param productId the product id
   * @param quantity the minimum available quantity
   * @return the list of batches sorted by production date
   */
  List<Batch> findByProductIdAndAvailableQuantityGreaterThanOrderByProductionDateAsc(
      Long productId, int quantity);

  /**
   * Finds batches by status.
   *
   * @param status the status of the batches
   * @return the list of batches
   */
  List<Batch> findByStatus(BatchStatus status);

  /**
   * Finds batches by producer, sorted by production date, with available quantity greater than
   * zero.
   *
   * @param producerId the producer id
   * @return the list of batches sorted by production date
   */
  List<Batch> findByProducerIdAndAvailableQuantityGreaterThanOrderByProductionDateAsc(
      Long producerId, int quantity);

  /**
   * Finds batches with RECEIVED status and available quantity greater than zero, sorted by
   * production date in ascending order.
   *
   * @param status the RECEIVED status
   * @param quantity minimum quantity (0)
   * @return the list of received batches with available quantity, sorted by production date
   */
  List<Batch> findByStatusAndAvailableQuantityGreaterThan(BatchStatus status, int quantity);

    /**
     * Finds batches by product id
     *
     * @return the batch
     */
  Batch getBatchById(Long id);
}
