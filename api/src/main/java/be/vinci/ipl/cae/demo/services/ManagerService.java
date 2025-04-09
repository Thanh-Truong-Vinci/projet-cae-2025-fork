package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Manager;
import be.vinci.ipl.cae.demo.repositories.ManagerRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.time.LocalDate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service class for managing managers.
 */
@Service
public class ManagerService {

  private final ManagerRepository managerRepository;
  private final BCryptPasswordEncoder passwordEncoder;
  private final UserRepository userRepository;

  /**
   * Constructor.
   *
   * @param managerRepository the manager repository
   */
  public ManagerService(
      ManagerRepository managerRepository,
      BCryptPasswordEncoder passwordEncoder,
      UserRepository userRepository) {
    this.managerRepository = managerRepository;
    this.passwordEncoder = passwordEncoder;
    this.userRepository = userRepository;
  }

  /**
   * Create a new Manager.
   *
   * @param name      the last name
   * @param firstname the first name
   * @param email     the email
   * @param password  the password
   */
  public void createManager(
      String name, String firstname, String email, String password, String requesterEmail) {

    Manager manager = new Manager();
    manager.setName(name);
    manager.setFirstname(firstname);
    manager.setEmail(email);
    manager.setPassword(passwordEncoder.encode(password));
    manager.setManager(managerRepository.findByEmail(requesterEmail));
    manager.setDateInscription(LocalDate.now());

    managerRepository.save(manager);
  }

  /**
   * Register a new manager.
   *
   * @param name      the last name
   * @param firstname the first name
   * @param email     the email
   * @param password  the password
   * @return true if the registration is successful, false otherwise
   */
  public boolean register(
      String name, String firstname, String email, String password, String requesterEmail) {
    if (userRepository.findByEmail(email) != null) {
      return false;
    }
    createManager(name, firstname, email, password, requesterEmail);
    return true;
  }
}
