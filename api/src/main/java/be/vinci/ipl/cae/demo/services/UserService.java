package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import java.time.LocalDate;
import java.util.Date;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * User service.
 */
@Service
public class UserService {

  private static final String jwtSecret = "ilovemypizza!";
  private static final long lifetimeJwt = 24 * 60 * 60 * 1000; // 24 hours

  private static final Algorithm algorithm = Algorithm.HMAC256(jwtSecret);

  private final BCryptPasswordEncoder passwordEncoder;
  private final UserRepository userRepository;

  /**
   * Constructor.
   *
   * @param passwordEncoder the password encoder
   * @param userRepository  the user repository
   */
  public UserService(BCryptPasswordEncoder passwordEncoder, UserRepository userRepository) {
    this.passwordEncoder = passwordEncoder;
    this.userRepository = userRepository;
  }

  /**
   * Create a JWT token.
   *
   * @param email the email to included in the claim
   * @return the JWT token
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
   * Login a user.
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

    if (!passwordEncoder.matches(password, user.getMdp())) {
      return null;
    }

    System.out.println(createJwtToken(email));

    return createJwtToken(email);
  }

  /**
   * Register a new user.
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
   * @return the authenticated user if the registration is successful, null otherwise
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

    if (userRepository.findByEmail(email) != null) {
      return null; // L'email è già registrata
    }

    createOne(nom, prenom, email, password, rue, numeroRue, codePostal, commune, pays, tel);

    return createJwtToken(email);
  }


  /**
   * Read a user from its email.
   *
   * @param email the email
   * @return the user if it exists, null otherwise
   */
  public User readOneFromEmail(String email) {
    return userRepository.findByEmail(email);
  }

  /**
   * Create a new user.
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

    User user = new User();
    user.setNom(nom);
    user.setPrenom(prenom);
    user.setEmail(email);
    user.setMdp(hashedPassword);
    user.setRue(rue);
    user.setNumeroRue(numeroRue);
    user.setCodePostal(codePostal);
    user.setCommune(commune);
    user.setPays(pays);
    user.setTel(tel);
    user.setDateInscription(LocalDate.now());

    userRepository.save(user);
  }

}
