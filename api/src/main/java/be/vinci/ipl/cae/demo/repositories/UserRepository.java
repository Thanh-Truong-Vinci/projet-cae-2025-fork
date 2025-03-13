package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Client;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * User repository.
 */
@Repository
public interface UserRepository extends CrudRepository<Client, Long> {

  /**
   * Find a user by its email.
   *
   * @param email the email
   * @return the user
   */
  Client findByEmail(String email);
}
