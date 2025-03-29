package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Product;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for `Product` entities.
 */
@Repository
public interface ProductRepository extends CrudRepository<Product, Long> {
}
