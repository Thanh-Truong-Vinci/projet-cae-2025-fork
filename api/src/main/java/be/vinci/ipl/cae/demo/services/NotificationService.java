package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import java.util.List;

/** Service class for managing notifications. */
public class NotificationService {

  private final NotificationRepository notificationRepository;

  /**
   * Constructs a NotificationService with the specified repository.
   *
   * @param notificationRepository the repository for managing notifications
   */
  public NotificationService(NotificationRepository notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  /**
   * Retrieves notifications for a given producer.
   *
   * @param producer the producer whose notifications are to be retrieved
   * @return a list of notifications for the producer
   */
  public List<Notification> getNotifications(Producer producer) {
    return notificationRepository.findByProducer(producer);
  }
}

