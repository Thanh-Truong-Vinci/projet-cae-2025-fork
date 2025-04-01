package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.BatchStatus;
import be.vinci.ipl.cae.demo.models.entities.Product;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/** Repository interface for Batch entities. */
@Repository
public interface BatchRepository extends CrudRepository<Batch, Long> {

  /**
   * Finds batches by product and available quantity greater than the specified quantity.
   *
   * @param product the product
   * @param quantity the minimum available quantity
   * @return the list of batches
   */
  List<Batch> findByProductAndAvailableQuantityGreaterThan(Product product, int quantity);

  /**
   * Finds batches by status.
   *
   * @param statut the status of the batches
   * @return the list of batches
   */
  List<Batch> findByStatut(BatchStatus statut);
}
