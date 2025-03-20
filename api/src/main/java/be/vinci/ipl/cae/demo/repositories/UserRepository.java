package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * User repository.
 */
@Repository
public interface UserRepository extends CrudRepository<User, Long> {
}
