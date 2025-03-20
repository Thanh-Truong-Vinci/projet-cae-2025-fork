package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.repositories.ClientRepository;
import java.time.LocalDate;
import java.util.Objects;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Client service.
 */
@Service
public class ClientService {

  private final BCryptPasswordEncoder passwordEncoder;
  private final ClientRepository clientRepository;
  private final AuthsService authsService;

  /**
   * Constructor.
   *
   * @param passwordEncoder  the password encoder
   * @param clientRepository the client repository
   * @param authsService     the auths service
   */
  public ClientService(BCryptPasswordEncoder passwordEncoder, ClientRepository clientRepository,
      AuthsService authsService) {
    this.passwordEncoder = passwordEncoder;
    this.clientRepository = clientRepository;
    this.authsService = authsService;
  }

  /**
   * Login a client.
   *
   * @param email    the email
   * @param password the password
   * @return the authenticated client if the login is successful, null otherwise
   */
  public AuthenticatedUser login(String email, String password) {

    Client client = clientRepository.findByEmail(email);
    if (client == null) {
      return null;
    }

    if (!Objects.equals(password, client.getPassword())) {
      return null;
    }

    return authsService.createJwtToken(email);
  }

  /**
   * Register a new client.
   *
   * @param name        the last name
   * @param firstname   the first name
   * @param email       the email
   * @param password    the password
   * @param street      the street
   * @param number      the street number
   * @param postalCode  the postal code
   * @param city        the city
   * @param country     the country
   * @param phoneNumber the phone number (optional)
   * @return the authenticated client if the registration is successful, null
   *         otherwise
   * @throws ResponseStatusException if validation fails
   */
  public AuthenticatedUser register(
      String name,
      String firstname,
      String email,
      String password,
      String street,
      String number,
      String postalCode,
      String city,
      String country,
      String phoneNumber) {

    if (clientRepository.findByEmail(email) != null) {
      return null;
    }

    createOne(name, firstname, email, password, street,
        number, postalCode, city, country, phoneNumber);

    return authsService.createJwtToken(email);
  }

  /**
   * Create a new client.
   *
   * @param name        the last name
   * @param firstname   the first name
   * @param email       the email
   * @param password    the password
   * @param street      the street
   * @param number      the street number
   * @param postalCode  the postal code
   * @param city        the city
   * @param country     the country
   * @param phoneNumber the phone number (optional)
   */
  public void createOne(
      String name,
      String firstname,
      String email,
      String password,
      String street,
      String number,
      String postalCode,
      String city,
      String country,
      String phoneNumber) {

    String hashedPassword = passwordEncoder.encode(password);

    Client client = new Client();
    client.setName(name);
    client.setFirstname(firstname);
    client.setEmail(email);
    client.setPassword(hashedPassword);
    client.setStreet(street);
    client.setNumber(number);
    client.setPostalCode(postalCode);
    client.setCity(city);
    client.setCountry(country);
    client.setPhoneNumber(phoneNumber);
    client.setDateInscription(LocalDate.now());

    clientRepository.save(client);
  }
}