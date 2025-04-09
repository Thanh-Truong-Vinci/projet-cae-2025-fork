package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.BatchStatus;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Batch entities.
 */
@Repository
public interface BatchRepository extends CrudRepository<Batch, Long> {

  /**
   * Finds batches by product and available quantity greater than the specified quantity.
   *
   * @param productId the product id
   * @param quantity  the minimum available quantity
   * @return the list of batches
   */
  List<Batch> findByProductIdAndAvailableQuantityGreaterThan(Long productId, int quantity);

  /**
   * Finds batches by status.
   *
   * @param status the status of the batches
   * @return the list of batches
   */
  List<Batch> findByStatus(BatchStatus status);
}
