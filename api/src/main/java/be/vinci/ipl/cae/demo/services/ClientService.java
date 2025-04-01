package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.repositories.ClientRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.time.LocalDate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Client service. */
@Service
public class ClientService {

  private final ClientRepository clientRepository;
  private final UserRepository userRepository;
  private final BCryptPasswordEncoder passwordEncoder;

  /**
   * Constructor.
   *
   * @param clientRepository the client repository
   * @param userRepository the user repository
   */
  public ClientService(
      ClientRepository clientRepository,
      UserRepository userRepository,
      BCryptPasswordEncoder passwordEncoder) {
    this.clientRepository = clientRepository;
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  /**
   * Create a new client.
   *
   * @param name the last name
   * @param firstname the first name
   * @param email the email
   * @param password the password
   * @param civility the civility
   * @param street the street
   * @param number the street number
   * @param postalCode the postal code
   * @param city the city
   * @param country the country
   * @param phoneNumber the phone number (optional)
   */
  public void createClient(
      String name,
      String firstname,
      String email,
      String password,
      String civility,
      String street,
      String number,
      String postalCode,
      String city,
      String country,
      String phoneNumber) {

    Client client = new Client();
    client.setName(name);
    client.setFirstname(firstname);
    client.setEmail(email);
    client.setPassword(passwordEncoder.encode(password));
    client.setCivility(civility);
    client.setStreet(street);
    client.setNumber(number);
    client.setPostalCode(postalCode);
    client.setCity(city);
    client.setCountry(country);
    client.setPhoneNumber(phoneNumber);
    client.setDateInscription(LocalDate.now());

    clientRepository.save(client);
  }

  /**
   * Register a new client.
   *
   * @param name the last name
   * @param firstname the first name
   * @param email the email
   * @param password the password
   * @param civility the civility
   * @param street the street
   * @param number the street number
   * @param postalCode the postal code
   * @param city the city
   * @param country the country
   * @param phoneNumber the phone number (optional)
   * @return true if the registration is successful, false otherwise
   * @throws ResponseStatusException if validation fails
   */
  public boolean register(
      String name,
      String firstname,
      String email,
      String password,
      String civility,
      String street,
      String number,
      String postalCode,
      String city,
      String country,
      String phoneNumber) {
    if (userRepository.findByEmail(email) != null) {
      return false;
    }

    createClient(
        name,
        firstname,
        email,
        password,
        civility,
        street,
        number,
        postalCode,
        city,
        country,
        phoneNumber);
    return true;
  }
}
