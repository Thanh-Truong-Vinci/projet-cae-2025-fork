package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.repositories.ProducerRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

/**
 * Service class for managing producers.
 */
@Service
public class ProducerService {

  private final ProducerRepository producerRepository;
  private final UserRepository userRepository;

  /**
   * Constructs a ProducerService with the specified repositories.
   *
   * @param producerRepository the repository for managing producers
   * @param userRepository the repository for managing users
   */
  public ProducerService(ProducerRepository producerRepository, UserRepository userRepository) {
    this.producerRepository = producerRepository;
    this.userRepository = userRepository;
  }

  /**
   * Registers a new producer.
   *
   * @param name the name of the producer
   * @param firstname the first name of the producer
   * @param email the email of the producer
   * @param password the password of the producer
   * @param street the street address of the producer
   * @param number the street number of the producer
   * @param postalCode the postal code of the producer
   * @param city the city of the producer
   * @param country the country of the producer
   * @param phoneNumber the phone number of the producer
   * @param company the company of the producer
   * @return true if registration is successful, false otherwise
   */
  public boolean register(
      String name,
      String firstname,
      String email,
      String password,
      String street,
      String number,
      String postalCode,
      String city,
      String country,
      String phoneNumber,
      String company) {
    if (userRepository.findByEmail(email) != null) {
      return false;
    }

    createOne(name,
        firstname,
        email,
        password,
        street,
        number,
        postalCode,
        city,
        country,
        phoneNumber,
        company);
    return true;
  }

  /**
   * Creates a new producer.
   *
   * @param name the name of the producer
   * @param firstname the first name of the producer
   * @param email the email of the producer
   * @param password the password of the producer
   * @param street the street address of the producer
   * @param number the street number of the producer
   * @param postalCode the postal code of the producer
   * @param city the city of the producer
   * @param country the country of the producer
   * @param phoneNumber the phone number of the producer
   * @param company the company of the producer
   */
  public void createOne(String name,
                        String firstname,
                        String email,
                        String password,
                        String street,
                        String number,
                        String postalCode,
                        String city,
                        String country,
                        String phoneNumber,
                        String company) {

    Producer producer = new Producer();
    producer.setName(name);
    producer.setFirstname(firstname);
    producer.setEmail(email);
    producer.setPassword(password);
    producer.setStreet(street);
    producer.setNumber(number);
    producer.setPostalCode(postalCode);
    producer.setCity(city);
    producer.setCountry(country);
    producer.setPhoneNumber(phoneNumber);
    producer.setCompany(company);
    producer.setDateInscription(LocalDate.now());

    producerRepository.save(producer);
  }
}
