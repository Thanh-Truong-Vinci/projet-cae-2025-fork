package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Notification;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository Notification.
 */
@Repository
public interface NotificationRepository extends CrudRepository<Notification, Long> {

  /**
   * Find all notifications by producer id.
   *
   * @param producerId the producer id
   * @return the list of notifications
   */
  @Query("SELECT n FROM Notification n WHERE n.producer.id = :producerId")
  List<Notification> findByProducerId(@Param("producerId") Long producerId);


  /**
   * Update notification read status.
   *
   * @param idNotification the notification id
   * @return the updated notification
   */
  @Modifying
  @Query("UPDATE Notification n SET n.read = true WHERE n.idNotification = :id")
  Notification updateReadArgument(@Param("id") Long idNotification);

}