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
   * Find all notifications by user id.
   *
   * @param producerId the user id
   * @return the list of notifications
   */
  List<Notification> findByProducerIdUser(Long producerId);


  /**
   * Find all notifications by user id and read status.
   *
   * @param idNotification the user id
   * @return the list of notifications
   */
  @Modifying
  @Query("UPDATE Notification n SET n.read = true WHERE n.idNotification = :id")
  Notification updateReadArgument(@Param("id") Long idNotification);

}