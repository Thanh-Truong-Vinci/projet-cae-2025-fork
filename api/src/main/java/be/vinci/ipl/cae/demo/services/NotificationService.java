package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;

/**
 * Service class for managing notifications.
 */
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

  // TODO CreateNotification

  // TODO addNotification

  /**
   * Retrieves notifications for a given producer.
   *
   * @param producer the producer whose notifications are to be retrieved
   */
  public void getNotifications(Producer producer) {
    notificationRepository.findByProducer(producer);
  }
}
