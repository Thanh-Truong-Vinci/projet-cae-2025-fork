package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.repositories.ClientRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.time.LocalDate;
import java.util.Date;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Client service.
 */
@Service
public class ClientService {

  private static final String jwtSecret = "ilovemypizza!";
  private static final long lifetimeJwt = 24 * 60 * 60 * 1000; // 24 hours

  private static final Algorithm algorithm = Algorithm.HMAC256(jwtSecret);

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
   */
  public AuthenticatedUser createJwtToken(String email) {
    String token = JWT.create()
            .withIssuer("auth0")
            .withClaim("email", email)
            .withIssuedAt(new Date())
            .withExpiresAt(new Date(System.currentTimeMillis() + lifetimeJwt))
            .sign(algorithm);

    AuthenticatedUser authenticatedUser = new AuthenticatedUser();
    authenticatedUser.setEmail(email);
    authenticatedUser.setToken(token);

    return authenticatedUser;
  }

  /**
   * Verify a JWT token.
   *
   * @param token the token to verify
   * @return the email if the token is valid, null otherwise
   */
  public String verifyJwtToken(String token) {
    try {
      return JWT.require(algorithm).build().verify(token).getClaim("email").asString();
    } catch (Exception e) {
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
   * @param nom the last name
   * @param prenom the first name
   * @param email the email
   * @param password the password
   * @param rue the street
   * @param numeroRue the street number
   * @param codePostal the postal code
   * @param commune the commune
   * @param pays the country
   * @param tel the phone number (optional)
   * @return the authenticated client if the registration is successful, null otherwise
   */
  public AuthenticatedUser register(
          String nom,
          String prenom,
          String email,
          String password,
          String rue,
          String numeroRue,
          String codePostal,
          String commune,
          String pays,
          String tel) {

    if (clientRepository.findByEmail(email) != null) {
      return null;
    }

    createOne(nom, prenom, email, password, rue, numeroRue, codePostal, commune, pays, tel);

    return createJwtToken(email);
  }

  /**
   * Read a client from its email.
   *
   * @param email the email
   * @return the client if it exists, null otherwise
   */
  public Client readOneFromEmail(String email) {
    return clientRepository.findByEmail(email);
  }

  /**
   * Create a new client.
   *
   * @param nom the last name
   * @param prenom the first name
   * @param email the email
   * @param password the password
   * @param rue the street
   * @param numeroRue the street number
   * @param codePostal the postal code
   * @param commune the commune
   * @param pays the country
   * @param tel the phone number (optional)
   */
  public void createOne(
          String nom,
          String prenom,
          String email,
          String password,
          String rue,
          String numeroRue,
          String codePostal,
          String commune,
          String pays,
          String tel) {

    String hashedPassword = passwordEncoder.encode(password);

    Client client = new Client();
    client.setNom(nom);
    client.setPrenom(prenom);
    client.setEmail(email);
    client.setPassword(hashedPassword);
    client.setRue(rue);
    client.setNumeroRue(numeroRue);
    client.setCodePostal(codePostal);
    client.setCommune(commune);
    client.setPays(pays);
    client.setTel(tel);
    client.setDateInscription(LocalDate.now());

    clientRepository.save(client);
  }

}