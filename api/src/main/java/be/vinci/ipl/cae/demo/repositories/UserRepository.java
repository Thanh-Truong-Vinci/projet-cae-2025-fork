package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
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

  /**
   * Find a user by its email.
   *
   * @param password the new password
   * @param email the email
   * @return the user
   */
  @Modifying
  @Transactional
  @Query("UPDATE User u SET u.password = :password WHERE u.email = :email")
  int updatePassword(@Param("password") String password, @Param("email") String email);
}
