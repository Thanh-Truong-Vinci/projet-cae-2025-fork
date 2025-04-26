package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NewNotification;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.services.AuthsService;
import be.vinci.ipl.cae.demo.services.AuthsService.SecurityConstants;
import be.vinci.ipl.cae.demo.services.NotificationService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Notification controller.
 */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

  private final NotificationService notificationService;
  private final AuthsService authsService;

  /**
   * Constructor for NotificationController.
   *
   * @param notificationService the injected NotificationService.
   * @param authsService the injected AuthsService.
   */
  public NotificationController(NotificationService notificationService, AuthsService authsService) {
    this.notificationService = notificationService;
    this.authsService = authsService;
  }

  /**
   * Create a new notification.
   *
   * @param notification the notification to create
   * @return the created notification
   */
  @PostMapping("/create")
  public ResponseEntity<Notification>
      createNotification(@RequestBody NewNotification notification) {
    System.out.println("Notification create appelé : " + notification);
    try {
      Notification createdNotification = notificationService.createNotification(notification);
      return ResponseEntity.status(HttpStatus.CREATED).body(createdNotification);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Error creating notification: " + e.getMessage(), e);
    }
  }

  /**
   * Get all notifications for the authenticated user.
   *
   * @param authentication the authentication object
   * @return a list of notifications for the user
   */
  @GetMapping("/all")
  @PreAuthorize(SecurityConstants.HAS_ROLE_PRODUCER)
  public ResponseEntity<List<Notification>> getUserNotifications(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    
    // l'objet principal est notre User JPA
    Object principal = authentication.getPrincipal();
    List<Notification> notifs = notificationService.getNotificationsByUserPrincipal(principal);
    return ResponseEntity.ok(notifs);
  }
  
  /**
   * Alternative method to get notifications with token in header.
   * This is useful for front-end applications that handle authentication via tokens.
   *
   * @param token the authentication token
   * @return a list of notifications for the producer
   */
  @GetMapping("/producer")
  public ResponseEntity<List<Notification>> getProducerNotifications(
      @RequestHeader("Authorization") String token) {
    try {
      // Vérifier si le token est valide pour un producteur
      Producer producer = authsService.isValidProducerToken(token);
      if (producer == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
      }
      
      // Obtenir les notifications pour ce producteur
      List<Notification> notifs = notificationService.getNotificationsByUserPrincipal(producer);
      return ResponseEntity.ok(notifs);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Error retrieving notifications: " + e.getMessage(), e);
    }
  }
}