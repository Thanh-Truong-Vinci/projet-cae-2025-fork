package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Manager;
import be.vinci.ipl.cae.demo.repositories.ManagerRepository;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

/** Manager Service. */
@Service
public class ManagerService {

  private final ManagerRepository managerRepository;

  /**
   * Constructor.
   *
   * @param managerRepository the manager repository
   */
  public ManagerService(ManagerRepository managerRepository) {
    this.managerRepository = managerRepository;
  }

  /**
   * Register a new manager.
   *
   * @param name the last name
   * @param firstname the first name
   * @param email the email
   * @param password the password
   * @return true if the registration is successful, false otherwise
   */
  public boolean register(String name, String firstname, String email, String password) {
    if (managerRepository.findByEmail(email) != null) {
      return false;
    }
    createManager(name, firstname, email, password);
    return true;
  }

  /**
   * Create a new Manager.
   *
   * @param name the last name
   * @param firstname the first name
   * @param email the email
   * @param password the password
   */
  public void createManager(String name, String firstname, String email, String password) {

    Manager manager = new Manager();
    manager.setName(name);
    manager.setFirstname(firstname);
    manager.setEmail(email);
    manager.setPassword(password);
    manager.setDateInscription(LocalDate.now());

    managerRepository.save(manager);
  }

  /**
   * Get the manager's ID.
   *
   * @param email the email of the manager
   */
  public Manager getManagerId(String email) {
    return managerRepository.findByEmail(email).getManager();
  }
}
