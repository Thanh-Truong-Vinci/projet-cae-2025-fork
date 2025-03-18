package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Manager;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Manager repository.
 */
@Repository
public interface ManagerRepository extends CrudRepository<Manager, Long> {
}
