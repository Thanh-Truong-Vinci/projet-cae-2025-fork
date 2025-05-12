package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.ChangeQuantityRequest;
import be.vinci.ipl.cae.demo.models.dtos.ReservationRequest;
import be.vinci.ipl.cae.demo.models.dtos.views.ReservationView;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.models.entities.ReservationStatus;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationLineRepository;
import be.vinci.ipl.cae.demo.services.AuthsService;
import be.vinci.ipl.cae.demo.services.ReservationLineService;
import be.vinci.ipl.cae.demo.services.ReservationService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

/** Controller for handling reservation-related operations. */
@RestController
@RequestMapping("/reservation")
public class ReservationController {

  private final AuthsService authsService;
  private final ReservationService reservationService;
  private final ReservationLineService reservationLineService;
  private final ReservationLineRepository reservationLineRepository;
  private final BatchRepository batchRepository;

  /**
   * Constructs a ReservationController with the specified AuthsService and ReservationService.
   *
   * @param authsService the authentication service.
   * @param reservationService the reservation service.
   * @param reservationLineService the reservation line service.
   * @param reservationLineRepository the reservation line repository.
   */
  public ReservationController(
      AuthsService authsService,
      ReservationService reservationService,
      ReservationLineService reservationLineService,
      ReservationLineRepository reservationLineRepository,
      BatchRepository batchRepository) {
    this.authsService = authsService;
    this.reservationService = reservationService;
    this.reservationLineService = reservationLineService;
    this.reservationLineRepository = reservationLineRepository;
    this.batchRepository = batchRepository;
  }

  /**
   * Reserves a product for a client.
   *
   * @param reservationRequest the reservation request containing product ID and quantity.
   * @param token the authorization token from the request header.
   * @throws ResourceNotFoundException if the token is invalid or expired.
   */
  @Transactional
  @PostMapping("/reserve")
  public void reserveProduct(
      @RequestBody ReservationRequest reservationRequest,
      @RequestHeader("Authorization") String token) {
    Client client = authsService.isValidClientToken(token);
    if (client == null) {
      throw new ResourceNotFoundException("Token not valid, expired or user is not client");
    }

    Batch batch = batchRepository.getBatchById(reservationRequest.getBatchId());
    if (batch == null) {
      throw new ResourceNotFoundException("Batch not found");
    }
    if (reservationRequest.getQuantity() > batch.getAvailableQuantity()) {
      throw new ConflictException("Not enough available quantity in the batch");
    }

    reservationService.reserveProduct(client, batch, reservationRequest.getQuantity());
  }

  /**
   * Creates a direct sale reservation for the default "vente libre" client.
   *
   * @param reservationRequest the reservation request containing batch ID and quantity
   * @param token the authorization token from the request header
   * @return the created reservation as ReservationView
   * @throws ResourceNotFoundException if the token is invalid or expired or batch not found
   * @throws ConflictException if there isn't enough quantity available
   */
  @Transactional
  @PostMapping("/reserveDirect")
  public ReservationView reserveProductDirect(
      @RequestBody ReservationRequest reservationRequest,
      @RequestHeader("Authorization") String token) {

    // Validate volunteer token
    if (!authsService.isValidVolunteerToken(token)) {
      throw new ResourceNotFoundException("Authorization failed: Invalid token or not a volunteer");
    }

    // Get the default client - shouldn't use Optional as specified
    Client defaultClient = authsService.getClientByEmail("clientlibre@example.com");
    if (defaultClient == null) {
      throw new ResourceNotFoundException("Cannot find default client account for direct sales");
    }

    // Get the batch
    Batch productBatch = batchRepository.getBatchById(reservationRequest.getBatchId());
    if (productBatch == null) {
      throw new ResourceNotFoundException("Selected product batch could not be found");
    }

    // Check available quantity
    if (reservationRequest.getQuantity() > productBatch.getAvailableQuantity()) {
      throw new ConflictException("Requested quantity exceeds available stock");
    }

    // Create the reservation directly as CONFIRMED
    Reservation reservation =
        reservationService.reserveProductDirect(
            defaultClient, productBatch, reservationRequest.getQuantity());

    // Return view
    return new ReservationView(reservation);
  }

  /**
   * Retrieves the reservations for a client.
   *
   * @param token the authorization token from the request header.
   * @return a list of reservations for the client.
   * @throws ResourceNotFoundException if the token is invalid or expired.
   */
  @GetMapping("/list")
  public List<ReservationView> getReservations(@RequestHeader("Authorization") String token) {
    Client client = authsService.isValidClientToken(token);
    if (client == null) {
      throw new ResourceNotFoundException("Token not valid, expired or user is not client");
    }
    return reservationService.getReservations(client).stream()
        .map(ReservationView::new)
        .collect(Collectors.toList());
  }

  /**
   * Changes the status of a reservation to PENDING.
   *
   * @param reservationId the ID of the reservation to update.
   * @param token the authorization token from the request header.
   * @return the updated reservation as ReservationView.
   * @throws ResourceNotFoundException if the token is invalid or expired.
   * @throws ConflictException if the reservation ID is missing.
   */
  @PostMapping("/toPending")
  public ReservationView toPending(
      @RequestBody Long reservationId, @RequestHeader("Authorization") String token) {
    return changeReservationStatus(reservationId, token, ReservationStatus.PENDING, true);
  }

  /**
   * Changes the status of a reservation to CONFIRMED.
   *
   * @param reservationId the ID of the reservation to update.
   * @throws ResourceNotFoundException if the token is invalid or expired.
   * @throws ConflictException if the reservation ID is missing.
   */
  @Transactional
  @PostMapping("/toConfirm")
  public void toConfirm(@RequestBody Long reservationId) {
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
   * @return the updated reservation as ReservationView.
   * @throws ResourceNotFoundException if the token is invalid or expired.
   * @throws ConflictException if the reservation ID is missing.
   */
  @Transactional
  @PostMapping("/toCancel")
  public ReservationView toCancel(
      @RequestBody Long reservationId, @RequestHeader("Authorization") String token) {
    // First check if it's a client
    Client client = authsService.isValidClientToken(token);

    // If not a client, check if it's a volunteer
    boolean isVolunteer = false;
    if (client == null) {
      isVolunteer = authsService.isValidVolunteerToken(token);
      if (!isVolunteer) {
        throw new ResourceNotFoundException(
            "Token not valid, expired or user is not client or volunteer");
      }
    }

    if (reservationId == null) {
      throw new ConflictException("Reservation ID is required");
    }

    var updatedReservation =
        reservationService.changeStatus(reservationId, ReservationStatus.CANCELLED);
    return new ReservationView(updatedReservation);
  }

  /**
   * Changes the status of a reservation to ABANDONED.
   *
   * @param reservationId the ID of the reservation to update.
   * @param token the authorization token from the request header.
   * @return the updated reservation as ReservationView.
   * @throws ResourceNotFoundException if the token is invalid or expired.
   * @throws ConflictException if the reservation ID is missing.
   */
  @Transactional
  @PostMapping("/toAbandon")
  public ReservationView toAbandon(
      @RequestBody Long reservationId, @RequestHeader("Authorization") String token) {
    if (!authsService.isValidToken(token)) {
      throw new ResourceNotFoundException("Token not valid or expired");
    }

    String role = authsService.getRoleFromToken(token);
    if (!"Volunteer".equals(role)) {
      throw new ResourceNotFoundException("User is not a volunteer");
    }

    if (reservationId == null) {
      throw new ConflictException("Reservation ID is required");
    }

    var updatedReservation =
        reservationService.changeStatus(reservationId, ReservationStatus.ABANDONED);
    return new ReservationView(updatedReservation);
  }

  /**
   * Helper method to change a reservation's status and validate client token if needed.
   *
   * @param reservationId the ID of the reservation to update
   * @param token the authorization token from the request header
   * @param status the new status to set for the reservation
   * @param validateToken whether to validate the client token
   * @return the updated reservation as ReservationView
   * @throws ResourceNotFoundException if the token is invalid or expired
   * @throws ConflictException if the reservation ID is missing
   */
  private ReservationView changeReservationStatus(
      Long reservationId, String token, ReservationStatus status, boolean validateToken) {
    if (validateToken) {
      validateClientToken(token);
    }
    if (reservationId == null) {
      throw new ConflictException("Reservation ID is required");
    }
    var updatedReservation = reservationService.changeStatus(reservationId, status);
    return new ReservationView(updatedReservation);
  }

  /**
   * Retrieves all reservations regardless of the client.
   *
   * @return a list of all reservations as ReservationView.
   */
  @GetMapping("/all")
  public List<ReservationView> getAllReservations() {
    return reservationService.getAllReservations().stream()
        .map(ReservationView::new)
        .collect(Collectors.toList());
  }

  /**
   * Clears/deletes a reservation by ID.
   *
   * @param reservationId the ID of the reservation to delete.
   * @param token the authorization token from the request header.
   * @return the cleared reservation as ReservationView.
   * @throws ResourceNotFoundException if the token is invalid or expired or reservation not found.
   */
  @Transactional
  @PostMapping("/clear")
  public ReservationView clearReservation(
      @RequestBody Long reservationId, @RequestHeader("Authorization") String token) {
    Client client = validateClientToken(token);

    var reservation = reservationService.getReservationById(reservationId);
    if (reservation == null) {
      throw new ResourceNotFoundException("Reservation not found");
    }

    // Verify the reservation belongs to the client
    if (!reservation.getClient().getId().equals(client.getId())) {
      throw new ConflictException("This reservation doesn't belong to the authenticated client");
    }

    var clearedReservation = reservationService.deleteReservation(reservation);
    return new ReservationView(clearedReservation);
  }

  /**
   * Changes the quantity of a product in a reservation.
   *
   * @param request a request containing reservation line ID and new quantity
   * @param token the authorization token from the request header
   * @throws ResourceNotFoundException if the token is invalid or expired or reservation line not
   *     found
   */
  @Transactional
  @PostMapping("/changeQuantity")
  public ReservationView changeQuantity(
      @RequestBody ChangeQuantityRequest request, @RequestHeader("Authorization") String token) {
    Client client = authsService.isValidClientToken(token);
    if (client == null) {
      throw new ResourceNotFoundException("Token not valid, expired or user is not client");
    }

    if (request.getReservationLineId() == null || request.getQuantity() == null) {
      throw new ConflictException("Reservation line ID and quantity are required");
    }

    // Fetch the reservation line
    ReservationLine line =
        reservationLineRepository
            .findById(request.getReservationLineId())
            .orElseThrow(() -> new ResourceNotFoundException("Reservation line not found"));

    // Verify the reservation belongs to the client
    if (!line.getReservation().getClient().getId().equals(client.getId())) {
      throw new ConflictException("This reservation doesn't belong to the authenticated client");
    }

    // If reservation is not in BUILDING status, don't allow changes
    if (line.getReservation().getStatus() != ReservationStatus.BUILDING) {
      throw new ConflictException("Cannot modify a reservation that is not in BUILDING status");
    }

    // Change quantity
    Reservation updatedReservation =
        reservationLineService.changeQuantity(line, request.getQuantity());
    return new ReservationView(updatedReservation);
  }

  /**
   * Validates the client token.
   *
   * @param token the authorization token from the request header.
   * @return the validated client.
   * @throws ResourceNotFoundException if the token is invalid or expired.
   */
  private Client validateClientToken(String token) {
    Client client = authsService.isValidClientToken(token);
    if (client == null) {
      throw new ResourceNotFoundException("Token not valid, expired or user is not client");
    }
    return client;
  }
}
