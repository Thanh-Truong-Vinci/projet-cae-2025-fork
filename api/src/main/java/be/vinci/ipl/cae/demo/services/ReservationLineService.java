package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationLineRepository;
import java.util.List;
import org.springframework.stereotype.Service;


/**
 * Service class for managing reservation lines.
 */
@Service
public class ReservationLineService {

  private final BatchRepository batchRepository;
  private final ReservationLineRepository reservationLineRepository;

  /**
   * Default constructor for ReservationLineService.
   */
  public ReservationLineService(BatchRepository batchRepository,
      ReservationLineRepository reservationLineRepository) {
    this.batchRepository = batchRepository;
    this.reservationLineRepository = reservationLineRepository;
  }

  /**
   * Adds a product to a reservation with the specified quantity.
   *
   * @param reservation the reservation to add the product to
   * @param product the product to add
   * @param quantity the quantity of the product to add
   */
  public void addProduct(Reservation reservation, Product product, int quantity) {
    List<Batch> batches = batchRepository.findByProductAndAvailableQuantityGreaterThan(product, 0);
    int totalAvailableQuantity = batches.stream().mapToInt(Batch::getAvailableQuantity).sum();

    if (totalAvailableQuantity < quantity) {
      throw new IllegalArgumentException(
          "Not enough stock available for product: " + product.getName());
    }

    int remainingQuantity = quantity;
    for (Batch batch : batches) {
      if (remainingQuantity <= 0) {
        break;
      }

      int batchQuantity = Math.min(batch.getAvailableQuantity(), remainingQuantity);
      createReservationLine(reservation, batch, batchQuantity);
      remainingQuantity -= batchQuantity;
      batch.setAvailableQuantity(batch.getAvailableQuantity() - batchQuantity);
      batchRepository.save(batch);
    }
  }

  /**
   * Creates a new reservation line with the specified details.
   *
   * @param reservation the reservation to add the line to
   * @param batch the batch of the product
   * @param quantity the quantity of the product
   */
  public void createReservationLine(Reservation reservation, Batch batch, int quantity) {
    ReservationLine reservationLine = new ReservationLine();
    reservationLine.setReservation(reservation);
    reservationLine.setBatch(batch);
    reservationLine.setQuantity(quantity);
    reservationLineRepository.save(reservationLine);
  }
}
