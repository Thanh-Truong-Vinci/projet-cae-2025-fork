package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/** User repository. */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

  /**
   * Find a user by its email.
   *
   * @param email the email
   * @return the user
   */
  User findByEmail(String email);
}
