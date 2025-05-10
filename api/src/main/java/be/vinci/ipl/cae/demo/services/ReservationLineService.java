package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationLineRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/** Service class for managing reservation lines. */
@Service
public class ReservationLineService {

  private final BatchRepository batchRepository;
  private final ReservationLineRepository reservationLineRepository;
  private final ReservationRepository reservationRepository;

  /** Default constructor for ReservationLineService. */
  public ReservationLineService(
      BatchRepository batchRepository,
      ReservationLineRepository reservationLineRepository,
      ReservationRepository reservationRepository) {
    this.batchRepository = batchRepository;
    this.reservationLineRepository = reservationLineRepository;
    this.reservationRepository = reservationRepository;
  }

  /**
   * Adds a product to a reservation with the specified batch ID and quantity.
   *
   * @param reservation the reservation to add the product to
   * @param batch the batch to add
   * @param quantity the quantity of the product to add
   */
  public void addProduct(Reservation reservation, Batch batch, int quantity) {

    List<ReservationLine> existingLines =
        reservationLineRepository.findByReservationAndBatchOrderByBatchProductionDateAsc(
            reservation, batch);

    for (ReservationLine existingLine : existingLines) {
      if (existingLine.getBatch().getId().equals(batch.getId())) {
        changeQuantity(existingLine, existingLine.getQuantity() + quantity);
        return;
      }
    }

    ReservationLine reservationLine = new ReservationLine();
    reservationLine.setReservation(reservation);
    reservationLine.setBatch(batch);
    reservationLine.setQuantity(quantity);
    reservationLineRepository.save(reservationLine);
    batch.setAvailableQuantity(batch.getAvailableQuantity() - quantity);
    batchRepository.save(batch);
  }

  /**
   * Changes the quantity of a reservation line.
   *
   * @param reservationLine the reservation line to change
   * @param newQuantity the new quantity for the reservation line
   */
  public Reservation changeQuantity(ReservationLine reservationLine, int newQuantity) {
    if (newQuantity == 0) {
      deleteReservationLine(reservationLine);
      return reservationLine.getReservation();
    }
    // update batch available quantity
    Batch batch = reservationLine.getBatch();
    batch.setAvailableQuantity(
        batch.getAvailableQuantity() - (newQuantity - reservationLine.getQuantity()));
    batchRepository.save(batch);

    reservationLine.setQuantity(newQuantity);
    reservationLineRepository.save(reservationLine);
    return reservationLine.getReservation();
  }

  /**
   * Deletes a reservation line and updates the available quantity of the associated batch.
   *
   * @param reservationLine the reservation line to delete
   */
  public void deleteReservationLine(ReservationLine reservationLine) {
    // update batch available quantity
    Batch batch = reservationLine.getBatch();
    batchRepository.save(batch);

    // delete the line it self and delete from reservation and return
    reservationLine.getReservation().getReservationLines().remove(reservationLine);
    reservationRepository.save(reservationLine.getReservation());
    reservationLineRepository.delete(reservationLine);
    batch.setAvailableQuantity(batch.getAvailableQuantity() + reservationLine.getQuantity());
    batchRepository.save(batch);
  }
}
