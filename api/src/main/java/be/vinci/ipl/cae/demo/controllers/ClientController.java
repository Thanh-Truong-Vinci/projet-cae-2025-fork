package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.ReservationRequest;
import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.services.AuthsService;
import be.vinci.ipl.cae.demo.services.ProductService;
import be.vinci.ipl.cae.demo.services.ReservationService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller for handling client-related operations.
 */
@RestController
@RequestMapping("/client")
public class ClientController {

  private final AuthsService authsService;
  private final ProductService productService;
  private final ReservationService reservationService;

  /**
   * Constructs a ClientController with the specified
   *     AuthsService, ProductService, and ReservationService.
   *
   * @param authsService the AuthsService to be used by this controller.
   * @param productService the ProductService to be used by this controller.
   * @param reservationService the ReservationService to be used by this controller.
   */
  public ClientController(AuthsService authsService, ProductService productService, 
                          ReservationService reservationService) {
    this.authsService = authsService;
    this.productService = productService;
    this.reservationService = reservationService;
  }

  /**
   * Retrieves a list of products based on search criteria and type.
   *
   * @param search the search term for product name or description.
   * @param type the type of product.
   * @param token the authorization token from the request header.
   * @return a list of products matching the criteria.
   * @throws ResponseStatusException if the token is invalid or expired.
   */
  @PostMapping("/products")
  public List<Product> getProducts(
      @RequestBody String search, @RequestBody String type, 
      @RequestHeader("Authorization") String token) {
    if (authsService.isValidClientToken(token) == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                                        "Token not valid, expired or user is not client");
    }
    return productService.getProducts(search, type);
  }

  /**
   * Reserves a product for a client.
   *
   * @param reservationRequest the reservation request containing product ID and quantity.
   * @param token the authorization token from the request header.
   * @throws ResponseStatusException if the token is invalid or expired.
   */
  @PostMapping("/reserve")
  public void reserveProduct(@RequestBody ReservationRequest reservationRequest, 
                             @RequestHeader("Authorization") String token) {
    Client client = authsService.isValidClientToken(token);
    if (client == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                                        "Token not valid, expired or user is not client");
    }
    Product product = productService.findProductById(reservationRequest.getProductId());
    if (product == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
    }
    reservationService.reserveProduct(client, product, reservationRequest.getQuantity());
  }

  /**
   * Cancels a reservation for a client.
   *
   * @param reservationId the ID of the reservation to cancel.
   * @param token the authorization token from the request header.
   * @throws ResponseStatusException if the token is invalid or expired.
   */
  @PostMapping("/cancelreservation")
  public void cancelReservation(@RequestBody Long reservationId, 
                                @RequestHeader("Authorization") String token) {
    Client client = authsService.isValidClientToken(token);
    if (client == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                                        "Token not valid, expired or user is not client");
    }
    reservationService.cancelReservation(client, reservationId);
  }

  /**
   * Retrieves the reservations for a client.
   *
   * @param token the authorization token from the request header.
   * @return a list of reservations for the client.
   * @throws ResponseStatusException if the token is invalid or expired.
   */
  @PostMapping("/reservations")
  public List<Reservation> getReservations(@RequestHeader("Authorization") String token) {
    Client client = authsService.isValidClientToken(token);
    if (client == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                                        "Token not valid, expired or user is not client");
    }
    return reservationService.getReservations(client);
  }
}
