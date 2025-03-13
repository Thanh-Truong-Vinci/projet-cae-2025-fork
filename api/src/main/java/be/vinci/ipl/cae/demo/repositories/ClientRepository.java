package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Client;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Client repository.
 */
@Repository
public interface ClientRepository extends CrudRepository<Client, Long> {

  /**
   * Find a client by its email.
   *
   * @param email the email
   * @return the client
   */
  Client findByEmail(String email);
}
