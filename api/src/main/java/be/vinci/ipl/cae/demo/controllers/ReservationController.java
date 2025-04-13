package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.ReservationRequest;
import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationStatus;
import be.vinci.ipl.cae.demo.services.AuthsService;
import be.vinci.ipl.cae.demo.services.ReservationService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Controller for handling reservation-related operations. */
@RestController
@RequestMapping("/reservation")
public class ReservationController {

  private final AuthsService authsService;
  private final ReservationService reservationService;

  /**
   * Constructs a ReservationController with the specified AuthsService and ReservationService.
   *
   * @param authsService the authentication service.
   * @param reservationService the reservation service.
   */
  public ReservationController(AuthsService authsService, ReservationService reservationService) {
    this.authsService = authsService;
    this.reservationService = reservationService;
  }

  /**
   * Reserves a product for a client.
   *
   * @param reservationRequest the reservation request containing product ID and quantity.
   * @param token the authorization token from the request header.
   * @throws ResourceNotFoundException if the token is invalid or expired.
   */
  @PostMapping("/reserve")
  public void reserveProduct(
      @RequestBody ReservationRequest reservationRequest,
      @RequestHeader("Authorization") String token) {
    Client client = authsService.isValidClientToken(token);
    if (client == null) {
      throw new ResourceNotFoundException("Token not valid, expired or user is not client");
    }
    reservationService.reserveProduct(
        client, reservationRequest.getProductId(), reservationRequest.getQuantity());
  }

  /**
   * Retrieves the reservations for a client.
   *
   * @param token the authorization token from the request header.
   * @return a list of reservations for the client.
   * @throws ResourceNotFoundException if the token is invalid or expired.
   */
  @GetMapping("/list")
  public List<Reservation> getReservations(@RequestHeader("Authorization") String token) {
    Client client = authsService.isValidClientToken(token);
    if (client == null) {
      throw new ResourceNotFoundException("Token not valid, expired or user is not client");
    }
    return reservationService.getReservations(client);
  }

  /**
   * Changes the status of a reservation to PENDING.
   *
   * @param reservationId the ID of the reservation to update.
   * @param token the authorization token from the request header.
   * @throws ResourceNotFoundException if the token is invalid or expired.
   * @throws ConflictException if the reservation ID is missing.
   */
  @PostMapping("/toPending")
  public void toPending(
      @RequestBody Long reservationId, @RequestHeader("Authorization") String token) {
    validateAndChangeStatus(reservationId, token, ReservationStatus.PENDING);
  }

  /**
   * Changes the status of a reservation to CONFIRMED.
   *
   * @param reservationId the ID of the reservation to update.
   * @throws ResourceNotFoundException if the token is invalid or expired.
   * @throws ConflictException if the reservation ID is missing.
   */
  @PostMapping("/toConfirm")
  public void toConfirm(
      @RequestBody Long reservationId) {
    if (reservationId == null) {
      throw new ConflictException("Reservation ID is required");
    }
    reservationService.changeStatus(reservationId, ReservationStatus.CONFIRMED);
  }

  /**
   * Changes the status of a reservation to CANCELLED.
   *
   * @param reservationId the ID of the reservation to update.
   * @param token the authorization token from the request header.
   * @throws ResourceNotFoundException if the token is invalid or expired.
   * @throws ConflictException if the reservation ID is missing.
   */
  @PostMapping("/toCancel")
  public void toCancel(
      @RequestBody Long reservationId, @RequestHeader("Authorization") String token) {
    validateAndChangeStatus(reservationId, token, ReservationStatus.CANCELLED);
  }
  
  /**
   * Validates client token and reservation ID, then changes reservation status.
   *
   * @param reservationId the ID of the reservation to update.
   * @param token the authorization token from the request header.
   * @param status the new status to set.
   * @throws ResourceNotFoundException if the token is invalid or expired.
   * @throws ConflictException if the reservation ID is missing.
   */
  private void validateAndChangeStatus(Long reservationId, String token, ReservationStatus status) {
    Client client = authsService.isValidClientToken(token);
    if (client == null) {
      throw new ResourceNotFoundException("Token not valid, expired or user is not client");
    }
    if (reservationId == null) {
      throw new ConflictException("Reservation ID is required");
    }
    reservationService.changeStatus(reservationId, status);
  }
}

