package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.repositories.ClientRepository;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Client service. */
@Service
public class ClientService {

  private final ClientRepository clientRepository;

  /**
   * Constructor.
   *
   * @param clientRepository the client repository
   */
  public ClientService(ClientRepository clientRepository) {
    this.clientRepository = clientRepository;
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
    if (clientRepository.findByEmail(email) != null) {
      return false;
    }

    createOne(
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
  public void createOne(
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
    client.setPassword(password);
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
}
