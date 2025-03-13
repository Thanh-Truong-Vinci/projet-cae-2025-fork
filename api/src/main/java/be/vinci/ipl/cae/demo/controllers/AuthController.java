package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.Credentials;
import be.vinci.ipl.cae.demo.models.dtos.CredentialsRegister;
import be.vinci.ipl.cae.demo.models.dtos.TokenRequest;
import be.vinci.ipl.cae.demo.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * AuthController to handle user authentication.
 */
@RestController
@RequestMapping("/auths")
public class AuthController {

  private final UserService userService;

  /**
   * Constructor for AuthController.
   *
   * @param userService the injected UserService.
   */
  public AuthController(UserService userService) {
    this.userService = userService;
  }

  private boolean isInvalidCredentialsRegister(CredentialsRegister credentials) {
    return credentials == null
            || credentials.getNom() == null || credentials.getNom().isBlank()
            || credentials.getPrenom() == null || credentials.getPrenom().isBlank()
            || credentials.getEmail() == null || credentials.getEmail().isBlank()
            || credentials.getPassword() == null || credentials.getPassword().isBlank()
            || credentials.getRue() == null || credentials.getRue().isBlank()
            || credentials.getNumeroRue() == null || credentials.getNumeroRue().isBlank()
            || credentials.getCodePostal() == null || credentials.getCodePostal().isBlank()
            || credentials.getCommune() == null || credentials.getCommune().isBlank()
            || credentials.getPays() == null || credentials.getPays().isBlank();
  }


  private boolean isInvalidCredentials(Credentials credentials) {
    return credentials == null
        || credentials.getEmail() == null
        || credentials.getEmail().isBlank()
        || credentials.getPassword() == null
        || credentials.getPassword().isBlank();
  }

  /**
   * Register a new user.
   *
   * @param credentials the user credentials from the request body.
   * @return the authenticated user.
   */
  @PostMapping("/register")
  public AuthenticatedUser register(@RequestBody CredentialsRegister credentials) {
    if (isInvalidCredentialsRegister(credentials)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }

    AuthenticatedUser user = userService.register(
            credentials.getNom(),
            credentials.getPrenom(),
            credentials.getEmail(),
            credentials.getPassword(),
            credentials.getRue(),
            credentials.getNumeroRue(),
            credentials.getCodePostal(),
            credentials.getCommune(),
            credentials.getPays(),
            credentials.getTel()
    );

    if (user == null) {
      throw new ResponseStatusException(HttpStatus.CONFLICT);
    }
    return user;
  }


  /**
   * Login a user.
   *
   * @param credentials the user credentials from the request body
   * @return the authenticated user.
   */
  @PostMapping("/login")
  public AuthenticatedUser login(@RequestBody Credentials credentials) {
    if (isInvalidCredentials(credentials)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }

    AuthenticatedUser user = userService.login(credentials.getEmail(),
        credentials.getPassword());

    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
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
   */
  @PostMapping("/me")
  public AuthenticatedUser refreshToken(@RequestBody TokenRequest request) {
    String email = userService.verifyJwtToken(request.getToken());
    if (email == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }
    return userService.createJwtToken(email);
  }

}
