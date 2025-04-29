package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationLineRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
   * Creates a new reservation line with the specified details.
   *
   * @param reservation the reservation to add the line to
   * @param batch the batch of the product
   * @param quantity the quantity of the product
   */
  @Transactional
  public void createReservationLine(Reservation reservation, Batch batch, int quantity) {
    ReservationLine reservationLine = new ReservationLine();
    reservationLine.setReservation(reservation);
    reservationLine.setBatch(batch);
    reservationLine.setQuantity(quantity);
    reservationLineRepository.save(reservationLine);
  }

  /**
   * Adds a product to a reservation with the specified quantity.
   *
   * @param reservation the reservation to add the product to
   * @param product the product to add
   * @param quantity the quantity of the product to add
   */
  @Transactional
  public void addProduct(Reservation reservation, Product product, int quantity) {

    List<ReservationLine> existingLines =
        reservationLineRepository.findByReservationAndBatchProductOrderByBatchProductionDateAsc(
            reservation, product);

    int remainingQuantity = quantity;

    // augmenter la quantité si le produit existe déjà
    for (ReservationLine line : existingLines) {
      Batch batch = line.getBatch();
      if (batch.getAvailableQuantity() > 0) {
        int additionalQuantity = Math.min(batch.getAvailableQuantity(), remainingQuantity);
        if (additionalQuantity > 0) {
          line.setQuantity(line.getQuantity() + additionalQuantity);
          reservationLineRepository.save(line);

          batch.setAvailableQuantity(batch.getAvailableQuantity() - additionalQuantity);
          batchRepository.save(batch);

          remainingQuantity -= additionalQuantity;
          if (remainingQuantity <= 0) {
            return;
          }
        }
      }
    }

    if (remainingQuantity > 0) {
      List<Batch> batches =
          batchRepository.findByProductIdAndAvailableQuantityGreaterThanOrderByProductionDateAsc(
              product.getId(), 0);

      for (Batch batch : batches) {
        // Vérifier que ce lot n'est pas déjà utilisé dans des lignes existantes
        if (existingLines.stream()
            .noneMatch(line -> line.getBatch().getId().equals(batch.getId()))) {
          int batchQuantity = Math.min(batch.getAvailableQuantity(), remainingQuantity);
          createReservationLine(reservation, batch, batchQuantity);
          remainingQuantity -= batchQuantity;
          batch.setAvailableQuantity(batch.getAvailableQuantity() - batchQuantity);
          batchRepository.save(batch);

          if (remainingQuantity <= 0) {
            break;
          }
        }
      }
    }

    if (remainingQuantity > 0) {
      throw new ConflictException("Not enough stock available for product: " + product.getName());
    }
  }

  /**
   * Changes the quantity of a reservation line.
   *
   * @param reservationLine the reservation line to change
   * @param newQuantity the new quantity for the reservation line
   */
  @Transactional
  public Reservation changeQuantity(ReservationLine reservationLine, int newQuantity) {
    if (newQuantity == 0) {
      deleteReservationLine(reservationLine);
      return reservationLine.getReservation();
    }
    // update batch available quantity
    int quantityDifference = reservationLine.getQuantity() - newQuantity;
    Batch batch = reservationLine.getBatch();
    batch.setAvailableQuantity(batch.getAvailableQuantity() + quantityDifference);
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
  @Transactional
  public void deleteReservationLine(ReservationLine reservationLine) {
    // update batch available quantity
    Batch batch = reservationLine.getBatch();
    batch.setAvailableQuantity(batch.getAvailableQuantity() + reservationLine.getQuantity());
    batchRepository.save(batch);

    // delete the line it self and delete from reservation and return
    reservationLine.getReservation().getReservationLines().remove(reservationLine);
    reservationRepository.save(reservationLine.getReservation());
    reservationLineRepository.delete(reservationLine);
  }
}
