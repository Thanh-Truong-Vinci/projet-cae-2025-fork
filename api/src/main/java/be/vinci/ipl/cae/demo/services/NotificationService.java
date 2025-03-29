package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.repositories.NotificationsRepository;

public class NotificationService {

  private final NotificationsRepository notificationsRepository;

  public NotificationService(NotificationsRepository notificationsRepository) {
    this.notificationsRepository = notificationsRepository;
  }

  public void getNotifications(Producer producer) {
    notificationsRepository.findByProducer(producer);
  }
}
