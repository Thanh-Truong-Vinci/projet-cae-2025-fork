package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationLineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationLineService {

  @Autowired
  private BatchRepository batchRepository;

  @Autowired
  private ReservationLineRepository reservationLineRepository;

  public ReservationLineService() {
  }

  public void addProduct(Reservation reservation, Product product, int quantity) {
    List<Batch> batches = batchRepository.findByProductAndAvailableQuantityGreaterThan(product, 0);
    int totalAvailableQuantity = batches.stream().mapToInt(Batch::getAvailableQuantity).sum();

    if (totalAvailableQuantity < quantity) {
      throw new IllegalArgumentException("Not enough stock available for product: " + product.getName());
    }

    int remainingQuantity = quantity;
    for (Batch batch : batches) {
      if (remainingQuantity <= 0) break;

      int batchQuantity = Math.min(batch.getAvailableQuantity(), remainingQuantity);
      createOne(reservation, batch, batchQuantity);
      remainingQuantity -= batchQuantity;
      batch.setAvailableQuantity(batch.getAvailableQuantity() - batchQuantity);
      batchRepository.save(batch);
    }
  }

  public void createOne(Reservation reservation, Batch batch, int quantity) {
    ReservationLine reservationLine = new ReservationLine();
    reservationLine.setReservation(reservation);
    reservationLine.setBatch(batch);
    reservationLine.setQuantity(quantity);
    reservationLineRepository.save(reservationLine);
  }
}
