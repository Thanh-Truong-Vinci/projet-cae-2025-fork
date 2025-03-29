package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Manager;
import be.vinci.ipl.cae.demo.repositories.ManagerRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

/**
 * Service class for managing managers.
 */
@Service
public class ManagerService {

  private final ManagerRepository managerRepository;
  private final UserRepository userRepository;

  /**
   * Constructs a ManagerService with the specified repositories.
   *
   * @param managerRepository the repository for managing managers
   * @param userRepository the repository for managing users
   */
  public ManagerService(ManagerRepository managerRepository, UserRepository userRepository) {
    this.managerRepository = managerRepository;
    this.userRepository = userRepository;
  }

  /**
   * Registers a new manager.
   *
   * @param name the name of the manager
   * @param firstname the first name of the manager
   * @param email the email of the manager
   * @param password the password of the manager
   * @return true if registration is successful, false otherwise
   */
  public boolean register(
      String name,
      String firstname,
      String email,
      String password) {
    if (userRepository.findByEmail(email) != null) {
      return false;
    }

    createOne(name,
        firstname,
        email,
        password);
    return true;
  }

  /**
   * Creates a new manager.
   *
   * @param name the name of the manager
   * @param firstname the first name of the manager
   * @param email the email of the manager
   * @param password the password of the manager
   */
  public void createOne(String name,
                        String firstname,
                        String email,
                        String password) {

    Manager manager = new Manager();
    manager.setName(name);
    manager.setFirstname(firstname);
    manager.setEmail(email);
    manager.setPassword(password);
    manager.setDateInscription(LocalDate.now());

    managerRepository.save(manager);
  }
}

