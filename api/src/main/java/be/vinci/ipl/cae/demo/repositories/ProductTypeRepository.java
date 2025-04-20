package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.ProductType;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/** Repository interface for ProductType entities. */
@Repository
public interface ProductTypeRepository extends CrudRepository<ProductType, Long> {

  /**
   * Finds a ProductType by its title.
   *
   * @param title the title of the product type
   * @return the ProductType with the specified title
   */
  ProductType findByTitle(String title);
}
