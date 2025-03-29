package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.models.entities.Manager;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.ClientRepository;
import be.vinci.ipl.cae.demo.repositories.ManagerRepository;
import be.vinci.ipl.cae.demo.repositories.ProducerRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import java.util.Date;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Service for handling authentication-related operations. */
@Service
public class AuthsService {
  private static final String JWT_SECRET = "JWT_SECRET";
  private static final long LIFETIME_JWT = 24 * 60 * 60 * 1000; // 24 hours
  private static final Algorithm algorithm = Algorithm.HMAC256(JWT_SECRET);

  private final UserRepository userRepository;
  private final ClientRepository clientRepository;
  private final ManagerRepository managerRepository;
  private final ProducerRepository producerRepository;
  private final BCryptPasswordEncoder passwordEncoder;

  /** Service for handling authentication-related operations. */
  public AuthsService(
      UserRepository userRepository,
      ClientRepository clientRepository,
      ManagerRepository managerRepository,
      ProducerRepository producerRepository,
      BCryptPasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.clientRepository = clientRepository;
    this.managerRepository = managerRepository;
    this.producerRepository = producerRepository;
    this.passwordEncoder = passwordEncoder;
  }

  /**
   * Create a JWT token for the given email.
   *
   * @param email the email to include in the token
   * @return the generated JWT token
   * @throws ResponseStatusException if token generation fails
   */
  @SuppressWarnings({
    "checkstyle:FileTabCharacter",
    "checkstyle:Indentation",
    "checkstyle:LineLength",
    "checkstyle:MissingJavadocMethod"
  })
  public String createJwtToken(String email) {
    if (email == null || email.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email cannot be null or empty");
    }
    try {
      return JWT.create()
          .withIssuer("auth0")
          .withClaim("email", email)
          .withIssuedAt(new Date())
          .withExpiresAt(new Date(System.currentTimeMillis() + LIFETIME_JWT))
          .sign(algorithm);
    } catch (JWTCreationException e) {
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR, "Token generation failed: " + e.getMessage(), e);
    }
  }

  /**
   * Verify a JWT token and extract the email claim.
   *
   * @param token the JWT token to verify
   * @return the email if the token is valid, null otherwise
   */
  @SuppressWarnings({
    "checkstyle:FileTabCharacter",
    "checkstyle:Indentation",
    "checkstyle:LineLength",
    "checkstyle:MissingJavadocMethod"
  })
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
      // Handle verification exceptions including token expiration
      return null;
    }
  }

  /**
   * Validate if the token is valid for a client.
   *
   * @param token the JWT token to verify
   * @return the client if the token is valid, null otherwise
   */
  public Client isValidClientToken(String token) {
    String email = verifyJwtToken(token);
    return email != null ? clientRepository.findByEmail(email) : null;
  }

  /**
   * Validate if the token is valid for a producer.
   *
   * @param token the JWT token to verify
   * @return the producer if the token is valid, null otherwise
   */
  public Producer isValidProducerToken(String token) {
    String email = verifyJwtToken(token);
    return email != null ? producerRepository.findByEmail(email) : null;
  }

  /**
   * Validate if the token is valid for a manager.
   *
   * @param token the JWT token to verify
   * @return the manager if the token is valid, null otherwise
   */
  public Manager isValidManagerToken(String token) {
    String email = verifyJwtToken(token);
    return email != null ? managerRepository.findByEmail(email) : null;
  }

  /**
   * Login a client.
   *
   * @param email the email
   * @param password the password
   * @return the authenticated user if the login is successful, null otherwise
   */
  public AuthenticatedUser login(String email, String password) {

    User user = userRepository.findByEmail(email);
    if (user == null) {
      return null;
    }

    if (!passwordEncoder.matches(password, user.getPassword())) {
      return null;
    }

    AuthenticatedUser authenticatedUser = new AuthenticatedUser();
    authenticatedUser.setEmail(email);
    authenticatedUser.setName(user.getName());
    authenticatedUser.setFirstname(user.getFirstname());
    authenticatedUser.setToken(createJwtToken(email));

    // Determine the role using specific repositories
    if (clientRepository.findByEmail(email) != null) {
      authenticatedUser.setRole("Client");
    } else if (managerRepository.findByEmail(email) != null) {
      authenticatedUser.setRole("Manager");
    } else if (producerRepository.findByEmail(email) != null) {
      authenticatedUser.setRole("Producer");
    } else {
      authenticatedUser.setRole("Unknown");
    }

    return authenticatedUser;
  }
}
