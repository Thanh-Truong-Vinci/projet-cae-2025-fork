package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.CredentialsManager;
import be.vinci.ipl.cae.demo.models.dtos.CredentialsProducer;
import be.vinci.ipl.cae.demo.services.AuthsService;
import be.vinci.ipl.cae.demo.services.ManagerService;
import be.vinci.ipl.cae.demo.services.ProducerService;
import be.vinci.ipl.cae.demo.utils.ValidationUtils;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller for managing manager and producer registrations.
 */
@RestController
@RequestMapping("/manager")
public class ManagerController {

  private final ManagerService managerService;
  private final ProducerService producerService;
  private final AuthsService authsService;

  /**
   * Constructs a ManagerController with the specified services.
   *
   * @param managerService the service for managing managers.
   * @param producerService the service for managing producers.
   * @param authsService the service for authentication.
   */
  public ManagerController(ManagerService managerService,
                           ProducerService producerService,
                           AuthsService authsService) {
    this.managerService = managerService;
    this.producerService = producerService;
    this.authsService = authsService;
  }

  /**
   * Register a new manager.
   *
   * @param credentials the manager credentials from the request body.
   * @param token the authorization token from the request header.
   * @throws ResponseStatusException if the credentials are invalid or the email is already in use.
   */
  @PostMapping("/registermanager")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  public void register(
      @RequestBody CredentialsManager credentials, @RequestHeader("Authorization") String token) {
    boolean success =
        managerService.register(
            credentials.getName(),
            credentials.getFirstname(),
            credentials.getEmail(),
            credentials.getPassword(),
            authsService.verifyJwtToken(token));
            ValidationUtils.ensureSuccess(success, HttpStatus.CONFLICT, "Email is already in use");  }

  /**
   * Register a new producer.
   *
   * @param credentials the producer credentials from the request body.
   * @param token the authorization token from the request header.
   * @throws ResponseStatusException if the token is invalid or expired, or if email already exists.
   */
  @PostMapping("/registerproducer")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  public void registerProducer(@RequestBody CredentialsProducer credentials,
                               @RequestHeader("Authorization") String token) {
    boolean success = producerService.registerProducer(
        credentials.getName(),
        credentials.getFirstname(),
        credentials.getCompany(),
        credentials.getEmail(),
        credentials.getPassword(),
        credentials.getStreet(),
        credentials.getNumber(),
        credentials.getBox(),
        credentials.getPostalCode(),
        credentials.getCity(),
        credentials.getCountry(),
        credentials.getPhoneNumber());
        ValidationUtils.ensureSuccess(success, HttpStatus.CONFLICT, "Email is already in use");
  }
}
