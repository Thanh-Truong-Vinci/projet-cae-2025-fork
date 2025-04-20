package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Producer;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/** Producer repository. */
@Repository
public interface ProducerRepository extends CrudRepository<Producer, Long> {

  /**
   * Find a producer by its email.
   *
   * @param email the email
   * @return the producer
   */
  Producer findByEmail(String email);
}
