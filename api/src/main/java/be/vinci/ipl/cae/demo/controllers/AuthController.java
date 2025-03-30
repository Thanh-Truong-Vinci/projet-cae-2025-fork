package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.Credentials;
import be.vinci.ipl.cae.demo.models.dtos.CredentialsProfile;
import be.vinci.ipl.cae.demo.models.dtos.CredentialsRegister;
import be.vinci.ipl.cae.demo.services.AuthsService;
import be.vinci.ipl.cae.demo.services.ClientService;
import be.vinci.ipl.cae.demo.services.ProfileService;
import be.vinci.ipl.cae.demo.utils.ValidationUtils;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** AuthController to handle client authentication. */
@RestController
@RequestMapping("/auths")
public class AuthController {

  private final ProfileService profileService;
  private final ClientService clientService;
  private final AuthsService authsService;

  /**
   * Constructor for AuthController.
   *
   * @param clientService the injected ClientService.
   * @param authsService the injected AuthsService.
   */
  public AuthController(
      ProfileService profileService, ClientService clientService, AuthsService authsService) {
    this.profileService = profileService;
    this.clientService = clientService;
    this.authsService = authsService;
  }

  /**
   * Validates registration credentials.
   *
   * @param credentials the registration credentials to check
   * @throws ResponseStatusException with specific message if validation fails
   */
  private void validateCredentialsRegister(CredentialsRegister credentials) {
    ValidationUtils.validateCredentialsRegister(credentials);
  }

  /**
   * Validates login credentials.
   *
   * @param credentials the login credentials to check
   * @throws ResponseStatusException with specific message if validation fails
   */
  private void validateCredentialsLogin(Credentials credentials) {
    ValidationUtils.validateCredentialsLogin(credentials);
  }

  /**
   * Register a new manager.
   *
   * @param credentials the manager credentials from the request body.
   * @throws ResponseStatusException if the credentials are invalid or the email is already in use.
   */
  @PostMapping("/register")
  public void register(@RequestBody CredentialsRegister credentials) {
    validateCredentialsRegister(credentials);
    boolean success =
        clientService.register(
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
   * Sets a new password.
   *
   * @param credentials the producer credentials from the request body.
   */
  @PostMapping("/changepassword")
  public void changePassword(@RequestBody CredentialsProfile credentials) {
    profileService.changePassword(
        credentials.getEmail(), credentials.getCurrentPassword(), credentials.getNewPassword());
  }

  /**
   * Login a client.
   *
   * @param credentials the client credentials from the request body.
   * @return the authenticated user.
   * @throws ResponseStatusException if the credentials are invalid or the login fails.
   */
  @PostMapping("/login")
  public AuthenticatedUser login(@RequestBody Credentials credentials) {
    validateCredentialsLogin(credentials);

    AuthenticatedUser user = authsService.login(credentials.getEmail(), credentials.getPassword());

    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    return user;
  }

  /**
   * Refresh the token. This endpoint receives a token, verifies its validity (including expiration)
   * and returns a new token with a new expiration date.
   *
   * @param token the token request containing the token to verify.
   * @return a new token if verification is successful.
   * @throws ResponseStatusException if the token is invalid or the verification fails.
   */
  @PostMapping("/me")
  public String refreshToken(@RequestBody String token) {
    if (token == null || token.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token is required");
    }

    String email = authsService.verifyJwtToken(token);

    if (email == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
    }

    return authsService.createJwtToken(email);
  }
}
