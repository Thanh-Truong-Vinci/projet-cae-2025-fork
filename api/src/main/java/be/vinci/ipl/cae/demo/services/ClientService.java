package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.repositories.ClientRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import java.time.LocalDate;
import java.util.Date;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Client service.
 */
@Service
public class ClientService {

  private static final String JWT_SECRET = "ilovemypizza!";
  private static final long LIFETIME_JWT = 24 * 60 * 60 * 1000; // 24 hours

  private static final Algorithm algorithm = Algorithm.HMAC256(JWT_SECRET);

  private final BCryptPasswordEncoder passwordEncoder;
  private final ClientRepository clientRepository;

  /**
   * Constructor.
   *
   * @param passwordEncoder the password encoder
   * @param clientRepository  the client repository
   */
  public ClientService(BCryptPasswordEncoder passwordEncoder, ClientRepository clientRepository) {
    this.passwordEncoder = passwordEncoder;
    this.clientRepository = clientRepository;
  }

  /**
   * Create a JWT token.
   *
   * @param email the email to include in the claim
   * @return the authenticated user with the JWT token
   * @throws ResponseStatusException if token creation fails
   */
  public AuthenticatedUser createJwtToken(String email) {
    if (email == null || email.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email cannot be null or empty");
    }
    
    try {
      String token = JWT.create()
              .withIssuer("auth0")
              .withClaim("email", email)
              .withIssuedAt(new Date())
              .withExpiresAt(new Date(System.currentTimeMillis() + LIFETIME_JWT))
              .sign(algorithm);

      AuthenticatedUser authenticatedUser = new AuthenticatedUser();
      authenticatedUser.setEmail(email);
      authenticatedUser.setToken(token);

      return authenticatedUser;
    } catch (JWTCreationException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
          "Token generation failed: " + e.getMessage(), e);
    }
  }

  /**
   * Verify a JWT token.
   *
   * @param token the token to verify
   * @return the email if the token is valid, null otherwise
   */
  public String verifyJwtToken(String token) {
    if (token == null || token.isBlank()) {
      return null;
    }
    
    try {
      return JWT.require(algorithm)
              .withIssuer("auth0")
              .build()
              .verify(token)
              .getClaim("email")
              .asString();
    } catch (JWTVerificationException e) {
      // Handle all verification exceptions, including TokenExpiredException
      return null;
    }
  }

  /**
   * Login a client.
   *
   * @param email the email
   * @param password the password
   * @return the authenticated client if the login is successful, null otherwise
   */
  public AuthenticatedUser login(String email, String password) {
    if (email == null || password == null) {
      return null;
    }
    
    Client client = clientRepository.findByEmail(email);
    if (client == null) {
      return null;
    }

    if (!passwordEncoder.matches(password, client.getPassword())) {
      return null;
    }

    return createJwtToken(email);
  }

  /**
   * Register a new client.
   *
   * @param name the last name
   * @param firstname the first name
   * @param email the email
   * @param password the password
   * @param street the street
   * @param number the street number
   * @param postalCode the postal code
   * @param city the city
   * @param country the country
   * @param phoneNumber the phone number (optional)
   * @return the authenticated client if the registration is successful, null otherwise
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

    // Validate all required fields
    validateRegistrationFields(name, firstname, email, password, street, 
                               number, postalCode, city, country, phoneNumber);
    
    // Validate email format
    if (!isValidEmail(email)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email format");
    }
    
    // Validate password strength
    if (!isStrongPassword(password)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
          "Password must be at least 8 characters and contain letters and numbers");
    }
    
    // Check if phone number is provided and validate it
    if (!isValidPhoneNumber(phoneNumber)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid phone number format");
    }

    // Check if email already exists
    if (clientRepository.findByEmail(email) != null) {
      return null;
    }

    createOne(name, firstname, email, password, street,
            number, postalCode, city, country, phoneNumber);

    return createJwtToken(email);
  }

  /**
   * Validates that all required registration fields are present.
   *
   * @throws ResponseStatusException if any required field is missing
   */
  private void validateRegistrationFields(String name, String firstname,
                                         String email, String password,
                                         String street, String number, String postalCode, 
                                         String city, String country, String phoneNumber) {
    if (name == null || name.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
    }
    if (firstname == null || firstname.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Firstname is required");
    }
    if (email == null || email.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
    }
    if (password == null || password.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
    }
    if (street == null || street.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Street is required");
    }
    if (number == null || number.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Number is required");
    }
    if (postalCode == null || postalCode.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Postal code is required");
    }
    if (city == null || city.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "City is required");
    }
    if (country == null || country.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Country is required");
    }
    if (phoneNumber == null || phoneNumber.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number is required");
    }
  }

  /**
   * Read a client from its email.
   *
   * @param email the email
   * @return the client if it exists, null otherwise
   */
  public Client readOneFromEmail(String email) {
    if (email == null || email.isBlank()) {
      return null;
    }
    return clientRepository.findByEmail(email);
  }

  /**
   * Create a new client.
   *
   * @param name the last name
   * @param firstname the first name
   * @param email the email
   * @param password the password
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

  /**
   * Validates the email format using a more robust regular expression.
   *
   * @param email the email to validate
   * @return true if the email format is valid, false otherwise
   */
  public boolean isValidEmail(String email) {
    // More comprehensive email regex
    String emailRegex =
            "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$";
    return email != null && email.matches(emailRegex);
  }
  
  /**
   * Validates the password strength.
   *
   * @param password the password to validate
   * @return true if the password is strong enough, false otherwise
   */
  public boolean isStrongPassword(String password) {
    // At least 8 chars, contains both letters and numbers
    return password != null && password.length() >= 8
            && password.matches(".*[a-zA-Z].*")
            && password.matches(".*\\d.*");
  }
  
  /**
   * Validates the phone number format.
   *
   * @param phoneNumber the phone number to validate
   * @return true if the phone number format is valid, false otherwise
   */
  public boolean isValidPhoneNumber(String phoneNumber) {
    // More flexible phone number validation that supports various formats
    return phoneNumber != null && phoneNumber.matches(
            "^[+]?[(]?[0-9]{1,4}[)]?([-\\s.]?[0-9]{1,5}){1,4}$");
  }
}