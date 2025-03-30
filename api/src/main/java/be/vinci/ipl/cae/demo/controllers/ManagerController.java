package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.CredentialsManager;
import be.vinci.ipl.cae.demo.models.dtos.CredentialsProducer;
import be.vinci.ipl.cae.demo.services.AuthsService;
import be.vinci.ipl.cae.demo.services.ManagerService;
import be.vinci.ipl.cae.demo.services.ProducerService;
import be.vinci.ipl.cae.demo.services.ProductTypeService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Controller for managing manager and producer registrations. */
@RestController
@RequestMapping("/manager")
public class ManagerController {

  private final ManagerService managerService;
  private final ProducerService producerService;
  private final AuthsService authsService;
  private final ProductTypeService productTypeService;

  /**
   * Constructs a ManagerController with the specified services.
   *
   * @param managerService the service for managing managers.
   * @param producerService the service for managing producers.
   * @param authsService the service for authentication.
   */
  public ManagerController(
      ManagerService managerService,
      ProducerService producerService,
      AuthsService authsService,
      ProductTypeService productTypeService) {
    this.managerService = managerService;
    this.producerService = producerService;
    this.authsService = authsService;
    this.productTypeService = productTypeService;
  }

  /**
   * Register a new manager.
   *
   * @param credentials the manager credentials from the request body.
   * @param token the authorization token from the request header.
   * @throws ResponseStatusException if the credentials are invalid or the email is already in use.
   */
  @PostMapping("/registermanager")
  public void registerManager(
      @RequestBody CredentialsManager credentials, @RequestHeader("Authorization") String token) {
    if (authsService.isValidManagerToken(token) == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Token not valide, expired or user is not Manager");
    }

    boolean success =
        managerService.register(
            credentials.getName(),
            credentials.getFirstname(),
            credentials.getEmail(),
            credentials.getPassword(),
            authsService.verifyJwtToken(token)); // email
    if (!success) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use");
    }
  }

  /**
   * Register a new producer.
   *
   * @param credentials the producer credentials from the request body.
   * @param token the authorization token from the request header.
   * @throws ResponseStatusException if the token is invalid or expired.
   */
  @PostMapping("/registerproducer")
  public void registerProducer(
      @RequestBody CredentialsProducer credentials, @RequestHeader("Authorization") String token) {
    if (authsService.isValidManagerToken(token) == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token not valide or expired");
    }

    producerService.registerProducer(
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
  }

  /**
   * Add a new product type.
   *
   * @param newType the new product type to be added.
   * @param token the authorization token from the request header.
   * @throws ResponseStatusException if the token is invalid, expired, or the user is not a manager.
   */
  @PostMapping("/addproducttype")
  public void addProductType(
      @RequestBody String newType, @RequestHeader("Authorization") String token) {
    if (authsService.isValidManagerToken(token) == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Token not valide, expired or user is not Manager");
    }
    productTypeService.addProductType(newType);
  }

  /**
   * Delete an existing product type.
   *
   * @param id the ID of the product type to be deleted.
   * @param token the authorization token from the request header.
   * @throws ResponseStatusException if the token is invalid, expired, or the user is not a manager.
   */
  @PostMapping("/deleteproducttype")
  public void deleteProductType(
      @RequestBody Long id, @RequestHeader("Authorization") String token) {
    if (authsService.isValidManagerToken(token) == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Token not valide, expired or user is not Manager");
    }
    productTypeService.deleteProductType(id);
  }
}
