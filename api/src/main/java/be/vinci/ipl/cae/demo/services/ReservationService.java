package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReservationService {

  private final ReservationRepository reservationRepository;
  private final BatchRepository batchRepository;
  private final ReservationLineService reservationLineService;

  public ReservationService(ReservationRepository reservationRepository,
                            BatchRepository batchRepository,
                            ReservationLineService reservationLineService) {
    this.reservationRepository = reservationRepository;
    this.batchRepository = batchRepository;
    this.reservationLineService = reservationLineService;
  }


  public void reserveProduct(Client client, Product product, int quantity) {
    Reservation reservation = reservationRepository.findByClientAndStatus(client, "pending")
        .orElseGet(() -> {
          Reservation newReservation = new Reservation();
          newReservation.setClient(client);
          newReservation.setPrice(0.0);
          newReservation.setStatus("pending");
          newReservation.setReservationDate(LocalDate.now());
          return newReservation;
        });

    reservationLineService.addProduct(reservation, product, quantity);
    reservationRepository.save(reservation);
  }

  public List<Reservation> getReservations(Client client) {
    return reservationRepository.findByClient(client);
  }

  public void completeReservation(Reservation reservation) {
    reservation.setStatus("completed");
    reservation.setSaleDate(LocalDate.now());
    reservationRepository.save(reservation);
  }

  public void cancelReservation(Reservation reservation) {
    reservation.setStatus("canceled");
    for (ReservationLine line : reservation.getReservationLines()) {
      Batch batch = line.getBatch();
      batch.setAvailableQuantity(batch.getAvailableQuantity() + line.getQuantity());
      batchRepository.save(batch);
    }
    reservationRepository.save(reservation);
  }

  public void createOne(Client client, Product product, int quantity) {
    Reservation reservation = new Reservation();
    reservation.setClient(client);
    reservation.setPrice(0.0);
    reservation.setStatus("pending");
    reservation.setReservationDate(LocalDate.now());
    reservationLineService.addProduct(reservation, product, quantity);
    reservationRepository.save(reservation);
  }

}
