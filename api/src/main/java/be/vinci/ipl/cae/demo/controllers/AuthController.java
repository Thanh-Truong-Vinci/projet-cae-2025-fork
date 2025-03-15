package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.Credentials;
import be.vinci.ipl.cae.demo.models.dtos.CredentialsRegister;
import be.vinci.ipl.cae.demo.models.dtos.TokenRequest;
import be.vinci.ipl.cae.demo.services.ClientService;
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

  /**
   * Constructor for AuthController.
   *
   * @param clientService the injected ClientService.
   */
  public AuthController(ClientService clientService) {
    this.clientService = clientService;
  }

  /**
   * Checks if the provided registration credentials are invalid.
   *
   * @param credentials the registration credentials to check.
   * @return true if the credentials are invalid, false otherwise.
   */
  private boolean isInvalidCredentialsRegister(CredentialsRegister credentials) {
    return credentials == null
            || credentials.getName() == null || credentials.getName().isBlank()
            || credentials.getFirstname() == null || credentials.getFirstname().isBlank()
            || credentials.getEmail() == null || credentials.getEmail().isBlank()
            || credentials.getPassword() == null || credentials.getPassword().isBlank()
            || credentials.getStreet() == null || credentials.getStreet().isBlank()
            || credentials.getNumber() == null || credentials.getNumber().isBlank()
            || credentials.getPostalCode() == null || credentials.getPostalCode().isBlank()
            || credentials.getCity() == null || credentials.getCity().isBlank()
            || credentials.getCountry() == null || credentials.getCountry().isBlank();
  }

  /**
   * Checks if the provided login credentials are invalid.
   *
   * @param credentials the login credentials to check.
   * @return true if the credentials are invalid, false otherwise.
   */
  private boolean isInvalidCredentials(Credentials credentials) {
    return credentials == null
            || credentials.getEmail() == null
            || credentials.getEmail().isBlank()
            || credentials.getPassword() == null
            || credentials.getPassword().isBlank();
  }

  /**
   * Register a new client.
   *
   * @param credentials the client credentials from the request body.
   * @return the authenticated client.
   * @throws ResponseStatusException if the credentials are invalid or the email is already in use.
   */
  @PostMapping("/register")
  public AuthenticatedUser register(@RequestBody CredentialsRegister credentials) {
    if (isInvalidCredentialsRegister(credentials)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }

    AuthenticatedUser client = clientService.register(
            credentials.getName(),
            credentials.getFirstname(),
            credentials.getEmail(),
            credentials.getPassword(),
            credentials.getStreet(),
            credentials.getNumber(),
            credentials.getPostalCode(),
            credentials.getCity(),
            credentials.getCountry(),
            credentials.getPhoneNumber()
    );

    if (client == null) {
      throw new ResponseStatusException(HttpStatus.CONFLICT);
    }
    return client;
  }

  /**
   * Login a client.
   *
   * @param credentials the client credentials from the request body.
   * @return the authenticated client.
   * @throws ResponseStatusException if the credentials are invalid or the login fails.
   */
  @PostMapping("/login")
  public AuthenticatedUser login(@RequestBody Credentials credentials) {
    if (isInvalidCredentials(credentials)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }

    AuthenticatedUser client = clientService.login(credentials.getEmail(),
            credentials.getPassword());

    if (client == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }

    return client;
  }

  /**
   * Refresh the token.
   * This endpoint receives a token, verifies its validity (including expiration)
   * and returns a new token with a new expiration date.
   *
   * @param request the token request containing the token to verify.
   * @return a new token if verification is successful.
   * @throws ResponseStatusException if the token is invalid or the verification fails.
   */
  @PostMapping("/me")
  public AuthenticatedUser refreshToken(@RequestBody TokenRequest request) {
    String email = clientService.verifyJwtToken(request.getToken());

    if (email == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }

    AuthenticatedUser client = clientService.createJwtToken(email);

    if (client == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }

    return client;
  }
}