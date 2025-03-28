package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.Credentials;
import be.vinci.ipl.cae.demo.models.dtos.CredentialsManager;
import be.vinci.ipl.cae.demo.models.dtos.CredentialsRegister;
import be.vinci.ipl.cae.demo.services.AuthsService;
import be.vinci.ipl.cae.demo.services.ClientService;
import be.vinci.ipl.cae.demo.services.ManagerService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * AuthController to handle client authentication.
 */
@RestController
@RequestMapping("/auths")
public class AuthController {

  private final ClientService clientService;
  private final ManagerService managerService;
  private final AuthsService authsService;

  /**
   * Constructor for AuthController.
   *
   * @param clientService the injected ClientService.
   * @param managerService the injected ManagerService.
   * @param authsService  the injected AuthsService.
   */
  public AuthController(ClientService clientService, ManagerService managerService, AuthsService authsService) {
    this.clientService = clientService;
    this.managerService = managerService;
    this.authsService = authsService;
  }

  /**
   * Validates registration credentials.
   *
   * @param credentials the registration credentials to check
   * @throws ResponseStatusException with specific message if validation fails
   */
  private void validateCredentialsRegister(CredentialsRegister credentials) {
    if (credentials == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Credentials cannot be null");
    }
    if (credentials.getName() == null || credentials.getName().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
    }
    if (credentials.getFirstname() == null || credentials.getFirstname().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Firstname is required");
    }
    if (credentials.getStreet() == null || credentials.getStreet().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Street is required");
    }
    if (credentials.getNumber() == null || credentials.getNumber().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Street number is required");
    }
    if (credentials.getPostalCode() == null || credentials.getPostalCode().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Postal code is required");
    }
    if (credentials.getCity() == null || credentials.getCity().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "City is required");
    }
    if (credentials.getCountry() == null || credentials.getCountry().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Country is required");
    }
    if (credentials.getPhoneNumber() == null || credentials.getPhoneNumber().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number is required");
    }
  }

  /**
   * Validates login credentials.
   *
   * @param credentials the login credentials to check
   * @throws ResponseStatusException with specific message if validation fails
   */
  private void validateCredentialsLogin(Credentials credentials) {
    if (credentials == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Credentials cannot be null");
    }
    if (credentials.getEmail() == null || credentials.getEmail().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
    }
    if (credentials.getPassword() == null || credentials.getPassword().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
    }
  }

  /**
   * Register a new manager.
   *
   * @param credentials the manager credentials from the request body.
   * @throws ResponseStatusException if the credentials are invalid or the email
   *                                 is already in use.
   */
  @PostMapping("/register")
  public void register(@RequestBody CredentialsRegister credentials) {
    validateCredentialsRegister(credentials);
    boolean success = clientService.register(
        credentials.getName(),
        credentials.getFirstname(),
        credentials.getEmail(),
        credentials.getPassword(),
        credentials.getCivility(),
        credentials.getStreet(),
        credentials.getNumber(),
        credentials.getPostalCode(),
        credentials.getCity(),
        credentials.getCountry(),
        credentials.getPhoneNumber());

    if (!success) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use");
    }
  }

  /**
   * Register a new manager.
   *
   * @param credentials the manager credentials from the request body.
   * @throws ResponseStatusException if the credentials are invalid or the email
   *                                 is already in use.
   */
  @PostMapping("/register/manager")
  public void register(@RequestBody CredentialsManager credentials) {
    boolean success = managerService.register(
            credentials.getName(),
            credentials.getFirstname(),
            credentials.getEmail(),
            credentials.getPassword());
    if(!success){
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use");
    }
  }

  /**
   * Login a client.
   *
   * @param credentials the client credentials from the request body.
   * @return the authenticated user.
   * @throws ResponseStatusException if the credentials are invalid or the login
   *                                 fails.
   */
  @PostMapping("/login")
  public AuthenticatedUser login(@RequestBody Credentials credentials) {
    validateCredentialsLogin(credentials);

    AuthenticatedUser user = authsService.login(credentials.getEmail(),
        credentials.getPassword());

    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    return user;
  }

  /**
   * Refresh the token.
   * This endpoint receives a token, verifies its validity (including expiration)
   * and returns a new token with a new expiration date.
   *
   * @param request the token request containing the token to verify.
   * @return a new token if verification is successful.
   * @throws ResponseStatusException if the token is invalid or the verification
   *                                 fails.
   */
  @PostMapping("/me")
  public String refreshToken(@RequestBody String request) {
    if (request == null || request.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token is required");
    }

    String email = authsService.verifyJwtToken(request);

    if (email == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
    }

    return authsService.createJwtToken(email);

  }
}