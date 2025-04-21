package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.views.SalesStatisticsView;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.BatchStatus;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.models.entities.ReservationStatus;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationRepository;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * Service pour gérer les statistiques de ventes et de réception des produits. Fournit des méthodes
 * pour agréger et analyser les données de la coopérative.
 */
@Service
public class StatisticsService {

  private final BatchRepository batchRepository;
  private final ReservationRepository reservationRepository;

  /**
   * Constructeur du service de statistiques.
   *
   * @param batchRepository le repository pour les lots
   * @param reservationRepository le repository pour les réservations
   */
  public StatisticsService(
      BatchRepository batchRepository, ReservationRepository reservationRepository) {
    this.batchRepository = batchRepository;
    this.reservationRepository = reservationRepository;
  }

  /**
   * Récupère les statistiques de ventes agrégées par produit, année et mois.
   *
   * @param year l'année pour filtrer les données (optionnel)
   * @param month le mois pour filtrer les données (optionnel)
   * @return la liste des statistiques de ventes
   */
  public List<SalesStatisticsView> getSalesStatistics(Integer year, Integer month) {
    // Récupérer les lots reçus
    List<Batch> receivedBatches = batchRepository.findByStatus(BatchStatus.RECEIVED);

    // Récupérer les réservations confirmées
    List<Reservation> confirmedReservations =
        reservationRepository.findByStatus(ReservationStatus.CONFIRMED);

    // Map pour regrouper les statistiques par produit, année et mois
    Map<String, SalesStatisticsView> statisticsMap = new HashMap<>();

    // Traiter les lots reçus
    for (Batch batch : receivedBatches) {
      LocalDate depositDate = batch.getDepositDate();
      if (depositDate == null) {
        continue;
      }

      if ((year == null || depositDate.getYear() == year)
          && (month == null || depositDate.getMonthValue() == month)) {

        String key = generateKey(batch.getProduct().getId(), depositDate);

        // Utiliser la méthode réutilisable pour configurer l'objet statistiques
        SalesStatisticsView stats =
            getOrCreateStatistics(
                statisticsMap, key, batch, depositDate.getYear(), depositDate.getMonthValue());

        // Incrémenter la quantité reçue
        int currentReceived = stats.getReceivedQuantity() != null ? stats.getReceivedQuantity() : 0;
        stats.setReceivedQuantity(currentReceived + batch.getAvailableQuantity());

        statisticsMap.put(key, stats);
      }
    }

    // Traiter les réservations confirmées
    for (Reservation reservation : confirmedReservations) {
      if (reservation.getSaleDate() == null) {
        continue;
      }

      LocalDate saleDate = LocalDate.parse(reservation.getSaleDate().toString());

      if ((year == null || saleDate.getYear() == year)
          && (month == null || saleDate.getMonthValue() == month)) {

        for (ReservationLine line : reservation.getReservationLines()) {
          Batch batch = line.getBatch();
          if (batch == null || batch.getProduct() == null) {
            continue;
          }

          String key = generateKey(batch.getProduct().getId(), saleDate);

          // Utiliser la méthode réutilisable pour configurer l'objet statistiques
          SalesStatisticsView stats =
              getOrCreateStatistics(
                  statisticsMap, key, batch, saleDate.getYear(), saleDate.getMonthValue());

          // Incrémenter la quantité vendue
          int currentSold = stats.getSoldQuantity() != null ? stats.getSoldQuantity() : 0;
          stats.setSoldQuantity(currentSold + line.getQuantity());

          // Calculer le revenu total
          double currentRevenue = stats.getTotalRevenue() != null ? stats.getTotalRevenue() : 0.0;
          stats.setTotalRevenue(currentRevenue + (line.getQuantity() * batch.getUnitPrice()));

          statisticsMap.put(key, stats);
        }
      }
    }

    // Initialiser les valeurs manquantes à zéro
    for (SalesStatisticsView stats : statisticsMap.values()) {
      if (stats.getSoldQuantity() == null) {
        stats.setSoldQuantity(0);
      }
      if (stats.getTotalRevenue() == null) {
        stats.setTotalRevenue(0.0);
      }
    }

    // Convertir la map en liste et trier par année, mois, nom du produit
    return statisticsMap.values().stream()
        .sorted(
            Comparator.comparing(SalesStatisticsView::getYear)
                .thenComparing(SalesStatisticsView::getMonth)
                .thenComparing(SalesStatisticsView::getProductName))
        .collect(Collectors.toList());
  }

  /**
   * Génère une clé unique pour indexer les statistiques basée sur l'id du produit et la date.
   *
   * @param productId identifiant du produit
   * @param date date concernée (dépôt ou vente)
   * @return la clé générée
   */
  private String generateKey(Long productId, LocalDate date) {
    return productId + "_" + date.getYear() + "_" + date.getMonthValue();
  }

  /**
   * Récupère ou crée un objet de statistiques et initialise ses propriétés de base.
   *
   * @param statisticsMap la map contenant les statistiques
   * @param key la clé permettant d'indexer les statistiques
   * @param batch le lot contenant les informations du produit
   * @param year l'année concernée
   * @param month le mois concerné
   * @return l'objet statistiques récupéré ou créé
   */
  private SalesStatisticsView getOrCreateStatistics(
      Map<String, SalesStatisticsView> statisticsMap,
      String key,
      Batch batch,
      int year,
      int month) {

    SalesStatisticsView stats = statisticsMap.getOrDefault(key, new SalesStatisticsView());
    stats.setProductId(batch.getProduct().getId());
    stats.setProductName(batch.getProduct().getName());
    stats.setProductType(batch.getProduct().getType().getTitle());
    stats.setYear(year);
    stats.setMonth(month);
    stats.setUnitType(batch.getSaleUnit());

    return stats;
  }
}
