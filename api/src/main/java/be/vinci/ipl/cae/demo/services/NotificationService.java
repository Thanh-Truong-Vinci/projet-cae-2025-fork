package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NewNotification;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service for managing notifications.
 */
@Service
public class NotificationService {
  private final NotificationRepository notificationRepository;
  private final BatchRepository batchRepository;

  /**
  * Constructor for NotificationService.
  *
  * @param notificationRepository the notification repository
  * @param batchRepository        the batch repository
  */
  public NotificationService(NotificationRepository notificationRepository,
      BatchRepository batchRepository) {
    this.notificationRepository = notificationRepository;
    this.batchRepository = batchRepository;
  }

  /**
  * Creates a new notification.
  *
  * @param notification the notification to create
  * @return the created notification
  */
  public Notification createNotification(NewNotification notification) {
    System.out.println("Sout batch " + notification.getBatchId());
    System.out.println("Sout reject " + notification.getReasonOfReject());
    System.out.println("Sout message " + notification.getMessage());
    Notification newNotification = new Notification();
    newNotification.setMessage(notification.getMessage());
    newNotification.setRead(false);
    newNotification.setDate(LocalDate.now());
    newNotification.setReasonOfReject(notification.getReasonOfReject());
    if (notification.getBatchId() > 0) {
      Batch batchNotification = batchRepository.findById(notification.getBatchId()).orElse(null);
      newNotification.setBatch(batchNotification);
      newNotification.setProducer(batchNotification.getProducer());
    }
    return notificationRepository.save(newNotification);
  }


  /**
   * Get notifications for an user.
   *

   * @param principal the user principal
   * @return a list of notifications for the user
   */
  public List<Notification> getNotificationsByUserPrincipal(Object principal) {
    if (!(principal instanceof User)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
              "Principal n'est pas un utilisateur valide");
    }
    User user = (User) principal;
    return notificationRepository.findByProducerIdUser(user.getId());
  }
}