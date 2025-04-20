package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationLineRepository;
import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import java.util.List;
import org.springframework.stereotype.Service;

/** Service class for managing reservation lines. */
@Service
public class ReservationLineService {

  private final BatchRepository batchRepository;
  private final ReservationLineRepository reservationLineRepository;

  /** Default constructor for ReservationLineService. */
  public ReservationLineService(
      BatchRepository batchRepository, ReservationLineRepository reservationLineRepository) {
    this.batchRepository = batchRepository;
    this.reservationLineRepository = reservationLineRepository;
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

  /**
   * Adds a product to a reservation with the specified quantity.
   *
   * @param reservation the reservation to add the product to
   * @param product the product to add
   * @param quantity the quantity of the product to add
   */
  public void addProduct(Reservation reservation, Product product, int quantity) {

    List<ReservationLine> existingLines = reservationLineRepository
        .findByReservationAndProductOrderByBatchProductionDateAsc(reservation, product);
    
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
                if (remainingQuantity <= 0) return;
            }
        }
    }

    if (remainingQuantity > 0) {
        List<Batch> batches = batchRepository
            .findByProductIdAndAvailableQuantityGreaterThanOrderByProductionDateAsc(
                product.getId(), 0);
                
        for (Batch batch : batches) {
            // Vérifier que ce lot n'est pas déjà utilisé dans des lignes existantes
            if (existingLines.stream().noneMatch(line -> line.getBatch().getId() == batch.getId())) {
                int batchQuantity = Math.min(batch.getAvailableQuantity(), remainingQuantity);
                createReservationLine(reservation, batch, batchQuantity);
                remainingQuantity -= batchQuantity;
                batch.setAvailableQuantity(batch.getAvailableQuantity() - batchQuantity);
                batchRepository.save(batch);
                
                if (remainingQuantity <= 0) break;
            }
        }
    }
    
    if (remainingQuantity > 0) {
        throw new ConflictException(
            "Not enough stock available for product: " + product.getName());
    }
  }
}
