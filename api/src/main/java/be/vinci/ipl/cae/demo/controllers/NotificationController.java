package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NewNotification;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.services.NotificationService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

  /**
   * Constructor for NotificationController.
   *
   * @param notificationService the injected NotificationService.
   */
  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
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
    System.out.println("Notification create appelÃ© : " + notification);
    try {
      Notification createdNotification = notificationService.createNotification(notification);
      return ResponseEntity.status(HttpStatus.CREATED).body(createdNotification);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Error creating notification", e);
    }
  }

  /**
   * Get all notifications for the authenticated user.
   *
   * @param authentication the authentication object
   * @return a list of notifications for the user
   */
  @GetMapping("/all")
  public ResponseEntity<List<Notification>> getUserNotifications(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      return ResponseEntity.status(401).build();
    }
    // l'objet principal est notre User JPA
    Object principal = authentication.getPrincipal();
    List<Notification> notifs = notificationService.getNotificationsByUserPrincipal(principal);
    return ResponseEntity.ok(notifs);
  }

}