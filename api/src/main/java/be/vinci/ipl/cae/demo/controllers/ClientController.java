package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.ProductAvailability;
import be.vinci.ipl.cae.demo.models.dtos.ProductSearchDto;
import be.vinci.ipl.cae.demo.services.AuthsService;
import be.vinci.ipl.cae.demo.services.ProductService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Controller for handling client-related operations. */
@RestController
@RequestMapping("/client")
public class ClientController {

  private final AuthsService authsService;
  private final ProductService productService;

  /**
   * Constructs a ClientController with the specified AuthsService and ProductService.
   *
   * @param authsService the authentication service.
   * @param productService the product service.
   */
  public ClientController(AuthsService authsService, ProductService productService) {
    this.authsService = authsService;
    this.productService = productService;
  }

  /**
   * Retrieves a list of products based on search criteria and type.
   *
   * @param productSearchDto the search criteria and type encapsulated in a DTO.
   * @param token the authorization token from the request header.
   * @return a list of products matching the criteria.
   * @throws ResponseStatusException if the token is invalid or expired.
   */
  @PostMapping("/products")
  public List<ProductAvailability> getProducts(
      @RequestBody ProductSearchDto productSearchDto,
      @RequestHeader("Authorization") String token) {
    if (authsService.isValidClientToken(token) == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Token not valid, expired or user is not client");
    }
    return productService.getAvailableProducts(
        productSearchDto.getSearch(), productSearchDto.getType());
  }
}
