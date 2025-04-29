package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.dtos.views.SalesStatisticsView;
import be.vinci.ipl.cae.demo.models.entities.Batch;
import be.vinci.ipl.cae.demo.models.entities.BatchStatus;
import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import be.vinci.ipl.cae.demo.models.entities.ReservationStatus;
import be.vinci.ipl.cae.demo.repositories.BatchRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class StatisticsServiceTest {

  @Mock private BatchRepository batchRepository;

  @Mock private ReservationRepository reservationRepository;

  @InjectMocks private StatisticsService statisticsService;

  private Batch testBatch;
  private Reservation testReservation;
  private ReservationLine testReservationLine;
  private Product testProduct;
  private ProductType testProductType;
  private Client testClient;

  @BeforeEach
  void setUp() {
    // Initialiser le produit et son type
    testProductType = new ProductType();
    testProductType.setId(1L);
    testProductType.setTitle("Légume");

    testProduct = new Product();
    testProduct.setId(1L);
    testProduct.setName("Carotte");
    testProduct.setType(testProductType);
    testProduct.setDescription("Carottes fraîches");

    // Initialiser un lot
    testBatch = new Batch();
    testBatch.setId(1L);
    testBatch.setProduct(testProduct);
    testBatch.setUnitPrice(2.50);
    testBatch.setSaleUnit("kg");
    testBatch.setAvailableQuantity(50);
    testBatch.setStatus(BatchStatus.RECEIVED);
    testBatch.setProductionDate(LocalDate.now().minusDays(7));
    testBatch.setDepositDate(LocalDate.now().minusDays(5));

    // Initialiser un client
    testClient = new Client();
    testClient.setId(1L);
    testClient.setEmail("client@test.com");

    // Initialiser une réservation
    testReservation = new Reservation();
    testReservation.setId(1L);
    testReservation.setClient(testClient);
    testReservation.setStatus(ReservationStatus.CONFIRMED);
    testReservation.setSaleDate(LocalDate.now().minusDays(2));
    testReservation.setReservationLines(new ArrayList<>());

    // Initialiser une ligne de réservation
    testReservationLine = new ReservationLine();
    testReservationLine.setId(1L);
    testReservationLine.setReservation(testReservation);
    testReservationLine.setBatch(testBatch);
    testReservationLine.setQuantity(10);

    // Associer la ligne à la réservation
    testReservation.getReservationLines().add(testReservationLine);
  }

  @Test
  void testGetSalesStatistics() {
    // Arrange
    List<Batch> receivedBatches = Collections.singletonList(testBatch);
    List<Reservation> confirmedReservations = Collections.singletonList(testReservation);

    when(batchRepository.findByStatus(BatchStatus.RECEIVED)).thenReturn(receivedBatches);
    when(reservationRepository.findByStatus(ReservationStatus.CONFIRMED))
        .thenReturn(confirmedReservations);

    // Act
    List<SalesStatisticsView> result = statisticsService.getSalesStatistics(null, null);

    // Assert
    assertNotNull(result);
    assertFalse(result.isEmpty());

    SalesStatisticsView stats = result.get(0);
    assertEquals(testProduct.getId(), stats.getProductId());
    assertEquals(testProduct.getName(), stats.getProductName());
    assertEquals(testProduct.getType().getTitle(), stats.getProductType());
    assertEquals(testBatch.getDepositDate().getYear(), stats.getYear());
    assertEquals(testBatch.getDepositDate().getMonthValue(), stats.getMonth());

    // Vérifier que les quantités sont correctes
    assertEquals(50, stats.getReceivedQuantity());
    assertEquals(10, stats.getSoldQuantity());

    // Vérifier que le revenu est calculé correctement
    assertEquals(10 * 2.50, stats.getTotalRevenue());
  }

  @Test
  void testGetSalesStatisticsWithYearFilter() {
    // Arrange
    List<Batch> receivedBatches = Collections.singletonList(testBatch);
    List<Reservation> confirmedReservations = Collections.singletonList(testReservation);

    int currentYear = LocalDate.now().getYear();

    when(batchRepository.findByStatus(BatchStatus.RECEIVED)).thenReturn(receivedBatches);
    when(reservationRepository.findByStatus(ReservationStatus.CONFIRMED))
        .thenReturn(confirmedReservations);

    // Act
    List<SalesStatisticsView> result = statisticsService.getSalesStatistics(currentYear, null);

    // Assert
    assertNotNull(result);
    assertFalse(result.isEmpty());

    SalesStatisticsView stats = result.get(0);
    assertEquals(currentYear, stats.getYear());
  }

  @Test
  void testGetSalesStatisticsWithMonthFilter() {
    // Arrange
    List<Batch> receivedBatches = Collections.singletonList(testBatch);
    List<Reservation> confirmedReservations = Collections.singletonList(testReservation);

    int currentMonth = LocalDate.now().getMonthValue();

    when(batchRepository.findByStatus(BatchStatus.RECEIVED)).thenReturn(receivedBatches);
    when(reservationRepository.findByStatus(ReservationStatus.CONFIRMED))
        .thenReturn(confirmedReservations);

    // Act
    List<SalesStatisticsView> result = statisticsService.getSalesStatistics(null, currentMonth);

    // Assert
    assertNotNull(result);
    assertFalse(result.isEmpty());

    for (SalesStatisticsView stats : result) {
      assertEquals(currentMonth, stats.getMonth());
    }

    Optional<SalesStatisticsView> currentProductStats =
        result.stream()
            .filter(s -> s.getProductName().equals(testBatch.getProduct().getName()))
            .findFirst();
    assertTrue(currentProductStats.isPresent());
    assertEquals(testBatch.getAvailableQuantity(), currentProductStats.get().getReceivedQuantity());
  }

  @Test
  void testBatchWithNullDepositDate_IsIgnored() {
    // Arrange
    Batch batchWithNullDepositDate = new Batch();
    batchWithNullDepositDate.setId(2L);
    batchWithNullDepositDate.setProduct(testProduct);
    batchWithNullDepositDate.setUnitPrice(2.50);
    batchWithNullDepositDate.setSaleUnit("kg");
    batchWithNullDepositDate.setAvailableQuantity(50);
    batchWithNullDepositDate.setStatus(BatchStatus.RECEIVED);
    batchWithNullDepositDate.setProductionDate(LocalDate.now().minusDays(7));
    batchWithNullDepositDate.setDepositDate(null); // Date de dépôt explicitement null

    List<Batch> receivedBatches = Arrays.asList(testBatch, batchWithNullDepositDate);
    List<Reservation> confirmedReservations = Collections.singletonList(testReservation);

    when(batchRepository.findByStatus(BatchStatus.RECEIVED)).thenReturn(receivedBatches);
    when(reservationRepository.findByStatus(ReservationStatus.CONFIRMED))
        .thenReturn(confirmedReservations);

    // Act
    List<SalesStatisticsView> result = statisticsService.getSalesStatistics(null, null);

    // Assert
    assertNotNull(result);
    assertFalse(result.isEmpty());
    // Vérifier que le batch avec depositDate null n'a pas contribué aux statistiques
    assertEquals(testBatch.getAvailableQuantity(), result.get(0).getReceivedQuantity());
  }

  @Test
  void testReservationWithNullSaleDate_IsIgnored() {
    // Arrange
    Reservation reservationWithNullSaleDate = new Reservation();
    reservationWithNullSaleDate.setId(2L);
    reservationWithNullSaleDate.setClient(testClient);
    reservationWithNullSaleDate.setStatus(ReservationStatus.CONFIRMED);
    reservationWithNullSaleDate.setSaleDate(null); // Date de vente explicitement null

    ReservationLine lineForNullDateReservation = new ReservationLine();
    lineForNullDateReservation.setId(2L);
    lineForNullDateReservation.setReservation(reservationWithNullSaleDate);
    lineForNullDateReservation.setBatch(testBatch);
    lineForNullDateReservation.setQuantity(15); // Quantité différente pour pouvoir vérifier

    List<ReservationLine> lines = new ArrayList<>();
    lines.add(lineForNullDateReservation);
    reservationWithNullSaleDate.setReservationLines(lines);

    List<Batch> receivedBatches = Collections.singletonList(testBatch);
    List<Reservation> confirmedReservations =
        Arrays.asList(testReservation, reservationWithNullSaleDate);

    when(batchRepository.findByStatus(BatchStatus.RECEIVED)).thenReturn(receivedBatches);
    when(reservationRepository.findByStatus(ReservationStatus.CONFIRMED))
        .thenReturn(confirmedReservations);

    // Act
    List<SalesStatisticsView> result = statisticsService.getSalesStatistics(null, null);

    // Assert
    assertNotNull(result);
    assertFalse(result.isEmpty());
    // Vérifier que la quantité vendue correspond uniquement à testReservation valide
    assertEquals(testReservationLine.getQuantity(), result.get(0).getSoldQuantity());
  }

  @Test
  void testReservationLineWithNullBatch_IsIgnored() {
    // Arrange
    ReservationLine lineWithNullBatch = new ReservationLine();
    lineWithNullBatch.setId(2L);
    lineWithNullBatch.setReservation(testReservation);
    lineWithNullBatch.setBatch(null); // Batch explicitement null
    lineWithNullBatch.setQuantity(20);

    List<ReservationLine> lines = new ArrayList<>();
    lines.add(testReservationLine);
    lines.add(lineWithNullBatch);
    testReservation.setReservationLines(lines);

    List<Batch> receivedBatches = Collections.singletonList(testBatch);
    List<Reservation> confirmedReservations = List.of(testReservation);

    when(batchRepository.findByStatus(BatchStatus.RECEIVED)).thenReturn(receivedBatches);
    when(reservationRepository.findByStatus(ReservationStatus.CONFIRMED))
        .thenReturn(confirmedReservations);

    // Act
    List<SalesStatisticsView> result = statisticsService.getSalesStatistics(null, null);

    // Assert
    assertNotNull(result);
    assertFalse(result.isEmpty());
    // Vérifier que seule la ligne avec batch non-null a été comptabilisée (10kg)
    // La ligne avec batch null (20kg) ne devrait pas être comptée
    assertEquals(testReservationLine.getQuantity(), result.get(0).getSoldQuantity());
  }

  @Test
  void testReservationLineWithNullProduct_IsIgnored() {
    // Arrange
    // Nous allons créer un produit séparé pour le second batch
    Product anotherProduct = new Product();
    anotherProduct.setId(2L);
    anotherProduct.setName("Tomate");
    anotherProduct.setType(testProductType);

    Batch batchWithProduct = new Batch();
    batchWithProduct.setId(2L);
    batchWithProduct.setProduct(anotherProduct);
    batchWithProduct.setUnitPrice(3.50);
    batchWithProduct.setSaleUnit("kg");
    batchWithProduct.setAvailableQuantity(30);
    batchWithProduct.setStatus(BatchStatus.RECEIVED);
    batchWithProduct.setDepositDate(LocalDate.now().minusDays(3));

    // Créer une réservation pour ce batch
    ReservationLine lineWithProductBatch = new ReservationLine();
    lineWithProductBatch.setId(3L);
    lineWithProductBatch.setReservation(testReservation);
    lineWithProductBatch.setBatch(batchWithProduct);
    lineWithProductBatch.setQuantity(25);

    // en utilisant Mockito pour le mock approprié - ne conserver que la configuration nécessaire
    Batch mockedBatch = mock(Batch.class);
    when(mockedBatch.getProduct()).thenReturn(null); // Seule configuration nécessaire

    ReservationLine lineWithNullProductBatch = new ReservationLine();
    lineWithNullProductBatch.setId(4L);
    lineWithNullProductBatch.setReservation(testReservation);
    lineWithNullProductBatch.setBatch(mockedBatch);
    lineWithNullProductBatch.setQuantity(15);

    List<ReservationLine> lines = new ArrayList<>();
    lines.add(testReservationLine);
    lines.add(lineWithProductBatch);
    lines.add(lineWithNullProductBatch);
    testReservation.setReservationLines(lines);

    List<Batch> receivedBatches = Arrays.asList(testBatch, batchWithProduct, mockedBatch);
    List<Reservation> confirmedReservations = List.of(testReservation);

    when(batchRepository.findByStatus(BatchStatus.RECEIVED)).thenReturn(receivedBatches);
    when(reservationRepository.findByStatus(ReservationStatus.CONFIRMED))
        .thenReturn(confirmedReservations);

    // Act
    List<SalesStatisticsView> result = statisticsService.getSalesStatistics(null, null);

    // Assert
    assertNotNull(result);
    assertFalse(result.isEmpty());

    // Trouver les statistiques pour chaque produit
    Optional<SalesStatisticsView> carrotStats =
        result.stream().filter(s -> s.getProductName().equals("Carotte")).findFirst();

    Optional<SalesStatisticsView> tomatoStats =
        result.stream().filter(s -> s.getProductName().equals("Tomate")).findFirst();

    // Vérifier que les statistiques sont correctes pour chaque produit
    assertTrue(carrotStats.isPresent());
    assertEquals(
        10, carrotStats.get().getSoldQuantity()); // Seulement la quantité de testReservationLine

    assertTrue(tomatoStats.isPresent());
    assertEquals(25, tomatoStats.get().getSoldQuantity()); // La quantité de lineWithProductBatch

    // Vérifier que la ligne avec batch.product null n'a pas été comptabilisée
    // en vérifiant qu'aucun autre produit n'apparaît dans les résultats
    assertEquals(2, result.size());
  }

  @Test
  void testYearFilterForReceivedBatches() {
    // Arrange
    // Création d'un batch avec une année précédente
    Batch oldBatch = new Batch();
    oldBatch.setId(2L);
    oldBatch.setProduct(testProduct);
    oldBatch.setUnitPrice(2.50);
    oldBatch.setSaleUnit("kg");
    oldBatch.setAvailableQuantity(40);
    oldBatch.setStatus(BatchStatus.RECEIVED);
    oldBatch.setDepositDate(LocalDate.now().minusYears(1)); // Année précédente

    List<Batch> receivedBatches = Arrays.asList(testBatch, oldBatch);
    List<Reservation> confirmedReservations = Collections.singletonList(testReservation);

    when(batchRepository.findByStatus(BatchStatus.RECEIVED)).thenReturn(receivedBatches);
    when(reservationRepository.findByStatus(ReservationStatus.CONFIRMED))
        .thenReturn(confirmedReservations);

    int currentYear = LocalDate.now().getYear();

    // Act
    // Test du filtre d'année (lignes 67-72)
    List<SalesStatisticsView> result = statisticsService.getSalesStatistics(currentYear, null);

    // Assert
    assertNotNull(result);
    // Vérifier que seuls les lots de l'année courante sont inclus
    assertEquals(1, result.size());
    assertEquals(currentYear, result.get(0).getYear());
    // Seule la quantité du lot de l'année courante devrait être comptabilisée
    assertEquals(testBatch.getAvailableQuantity(), result.get(0).getReceivedQuantity());
  }

  @Test
  void testMonthFilterForReservations() {
    // Arrange
    // Création d'une réservation du mois précédent
    Reservation previousMonthReservation = new Reservation();
    previousMonthReservation.setId(2L);
    previousMonthReservation.setClient(testClient);
    previousMonthReservation.setStatus(ReservationStatus.CONFIRMED);
    previousMonthReservation.setSaleDate(LocalDate.now().minusMonths(1));

    ReservationLine previousMonthLine = new ReservationLine();
    previousMonthLine.setId(2L);
    previousMonthLine.setReservation(previousMonthReservation);
    previousMonthLine.setBatch(testBatch);
    previousMonthLine.setQuantity(20);

    previousMonthReservation.setReservationLines(List.of(previousMonthLine));

    List<Batch> receivedBatches = Collections.singletonList(testBatch);
    List<Reservation> confirmedReservations =
        Arrays.asList(testReservation, previousMonthReservation);

    when(batchRepository.findByStatus(BatchStatus.RECEIVED)).thenReturn(receivedBatches);
    when(reservationRepository.findByStatus(ReservationStatus.CONFIRMED))
        .thenReturn(confirmedReservations);

    int currentMonth = LocalDate.now().getMonthValue();

    // Act
    // Test du filtre de mois pour les réservations (lignes 97-98)
    List<SalesStatisticsView> result = statisticsService.getSalesStatistics(null, currentMonth);

    // Assert
    assertNotNull(result);
    // Vérifier que seules les ventes du mois courant sont incluses
    for (SalesStatisticsView stats : result) {
      assertEquals(currentMonth, stats.getMonth());
      // Vérifier que les quantités du mois précédent ne sont pas comptées
      if (stats.getSoldQuantity() > 0) {
        assertEquals(testReservationLine.getQuantity(), stats.getSoldQuantity());
      }
    }
  }

  @Test
  void testInitializationOfNullValues() {
    // Arrange
    // Créer un lot qui n'a pas été vendu (pour tester l'initialisation des valeurs nulles)
    Batch unsoldBatch = new Batch();
    unsoldBatch.setId(2L);
    unsoldBatch.setProduct(testProduct);
    unsoldBatch.setUnitPrice(3.0);
    unsoldBatch.setSaleUnit("kg");
    unsoldBatch.setAvailableQuantity(30);
    unsoldBatch.setStatus(BatchStatus.RECEIVED);
    // Utiliser une date différente pour créer une entrée distincte dans les stats
    unsoldBatch.setDepositDate(LocalDate.now().minusDays(10));

    // Ce lot a été reçu mais n'a pas de ventes associées
    List<Batch> receivedBatches = List.of(unsoldBatch);
    // Pas de réservations pour ce lot
    List<Reservation> confirmedReservations = Collections.emptyList();

    when(batchRepository.findByStatus(BatchStatus.RECEIVED)).thenReturn(receivedBatches);
    when(reservationRepository.findByStatus(ReservationStatus.CONFIRMED))
        .thenReturn(confirmedReservations);

    // Act
    // Teste l'initialisation des valeurs nulles (lignes 128-133)
    List<SalesStatisticsView> result = statisticsService.getSalesStatistics(null, null);

    // Assert
    assertNotNull(result);
    assertFalse(result.isEmpty());

    // Vérifier que les valeurs nulles ont été initialisées à 0
    SalesStatisticsView stats = result.get(0);
    assertEquals(0, stats.getSoldQuantity()); // Devrait être initialisé à 0
    assertEquals(0.0, stats.getTotalRevenue()); // Devrait être initialisé à 0.0

    // Vérifier que la quantité reçue est correcte
    assertEquals(unsoldBatch.getAvailableQuantity(), stats.getReceivedQuantity());
  }

  @Test
  void testStatisticsMapUpdatedCorrectly() {
    // Arrange
    // Création d'un second lot pour le même produit, même mois/année
    // pour tester la mise à jour de la map (ligne 82)
    Batch secondBatch = new Batch();
    secondBatch.setId(2L);
    secondBatch.setProduct(testProduct);
    secondBatch.setUnitPrice(2.50);
    secondBatch.setSaleUnit("kg");
    secondBatch.setAvailableQuantity(25);
    secondBatch.setStatus(BatchStatus.RECEIVED);
    // Même mois et année que testBatch, mais jour différent
    secondBatch.setDepositDate(testBatch.getDepositDate().plusDays(1));

    List<Batch> receivedBatches = Arrays.asList(testBatch, secondBatch);
    List<Reservation> confirmedReservations = Collections.singletonList(testReservation);

    when(batchRepository.findByStatus(BatchStatus.RECEIVED)).thenReturn(receivedBatches);
    when(reservationRepository.findByStatus(ReservationStatus.CONFIRMED))
        .thenReturn(confirmedReservations);

    // Act
    // Test de la mise à jour de la map (ligne 82)
    List<SalesStatisticsView> result = statisticsService.getSalesStatistics(null, null);

    // Assert
    assertNotNull(result);
    // Comme les deux lots ont le même produit et la même année/mois,
    // ils doivent être combinés en une seule entrée statistique
    assertEquals(1, result.size());

    SalesStatisticsView combinedStats = result.get(0);
    // Vérifier que les quantités des deux lots sont additionnées
    assertEquals(
        testBatch.getAvailableQuantity() + secondBatch.getAvailableQuantity(),
        combinedStats.getReceivedQuantity());
  }

  @Test
  void testYearAndMonthFilterForReceivedBatches() {
    // Arrange
    // Création de lots avec différentes dates de dépôt pour tester les lignes 67-69
    Batch currentBatch = new Batch();
    currentBatch.setId(2L);
    currentBatch.setProduct(testProduct);
    currentBatch.setUnitPrice(2.50);
    currentBatch.setSaleUnit("kg");
    currentBatch.setAvailableQuantity(40);
    currentBatch.setStatus(BatchStatus.RECEIVED);
    currentBatch.setDepositDate(LocalDate.now()); // Mois et année actuels

    Batch lastMonthBatch = new Batch();
    lastMonthBatch.setId(3L);
    lastMonthBatch.setProduct(testProduct);
    lastMonthBatch.setUnitPrice(2.50);
    lastMonthBatch.setSaleUnit("kg");
    lastMonthBatch.setAvailableQuantity(30);
    lastMonthBatch.setStatus(BatchStatus.RECEIVED);
    lastMonthBatch.setDepositDate(LocalDate.now().minusMonths(1)); // Mois précédent

    Batch lastYearBatch = new Batch();
    lastYearBatch.setId(4L);
    lastYearBatch.setProduct(testProduct);
    lastYearBatch.setUnitPrice(2.50);
    lastYearBatch.setSaleUnit("kg");
    lastYearBatch.setAvailableQuantity(20);
    lastYearBatch.setStatus(BatchStatus.RECEIVED);
    lastYearBatch.setDepositDate(LocalDate.now().minusYears(1)); // Année précédente

    List<Batch> receivedBatches = Arrays.asList(currentBatch, lastMonthBatch, lastYearBatch);
    when(batchRepository.findByStatus(BatchStatus.RECEIVED)).thenReturn(receivedBatches);
    when(reservationRepository.findByStatus(ReservationStatus.CONFIRMED))
        .thenReturn(Collections.emptyList());

    int currentYear = LocalDate.now().getYear();
    int currentMonth = LocalDate.now().getMonthValue();

    // Act - Test avec année ET mois spécifiés (lignes 67-69, 72)
    List<SalesStatisticsView> result =
        statisticsService.getSalesStatistics(currentYear, currentMonth);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size()); // Seul le lot du mois et année courant devrait être inclus
    assertEquals(currentYear, result.get(0).getYear());
    assertEquals(currentMonth, result.get(0).getMonth());
    assertEquals(currentBatch.getAvailableQuantity(), result.get(0).getReceivedQuantity());
  }

  @Test
  void testYearAndMonthFilterForReservations() {
    // Arrange - Création de réservations à différentes dates pour tester ligne 97
    Reservation currentReservation = new Reservation();
    currentReservation.setId(1L);
    currentReservation.setClient(testClient);
    currentReservation.setStatus(ReservationStatus.CONFIRMED);
    currentReservation.setSaleDate(LocalDate.now()); // Date actuelle

    ReservationLine currentLine = new ReservationLine();
    currentLine.setId(1L);
    currentLine.setReservation(currentReservation);
    currentLine.setBatch(testBatch);
    currentLine.setQuantity(10);
    currentReservation.setReservationLines(Collections.singletonList(currentLine));

    Reservation lastMonthReservation = new Reservation();
    lastMonthReservation.setId(2L);
    lastMonthReservation.setClient(testClient);
    lastMonthReservation.setStatus(ReservationStatus.CONFIRMED);
    lastMonthReservation.setSaleDate(LocalDate.now().minusMonths(1)); // Mois précédent

    ReservationLine lastMonthLine = new ReservationLine();
    lastMonthLine.setId(2L);
    lastMonthLine.setReservation(lastMonthReservation);
    lastMonthLine.setBatch(testBatch);
    lastMonthLine.setQuantity(15);
    lastMonthReservation.setReservationLines(Collections.singletonList(lastMonthLine));

    Reservation lastYearReservation = new Reservation();
    lastYearReservation.setId(3L);
    lastYearReservation.setClient(testClient);
    lastYearReservation.setStatus(ReservationStatus.CONFIRMED);
    lastYearReservation.setSaleDate(LocalDate.now().minusYears(1)); // Année précédente

    ReservationLine lastYearLine = new ReservationLine();
    lastYearLine.setId(3L);
    lastYearLine.setReservation(lastYearReservation);
    lastYearLine.setBatch(testBatch);
    lastYearLine.setQuantity(20);
    lastYearReservation.setReservationLines(Collections.singletonList(lastYearLine));

    List<Reservation> confirmedReservations =
        Arrays.asList(currentReservation, lastMonthReservation, lastYearReservation);
    when(batchRepository.findByStatus(BatchStatus.RECEIVED))
        .thenReturn(Collections.singletonList(testBatch));
    when(reservationRepository.findByStatus(ReservationStatus.CONFIRMED))
        .thenReturn(confirmedReservations);

    int currentYear = LocalDate.now().getYear();
    int currentMonth = LocalDate.now().getMonthValue();

    // Act - Test avec année ET mois spécifiés (ligne 97)
    List<SalesStatisticsView> result =
        statisticsService.getSalesStatistics(currentYear, currentMonth);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(currentYear, result.get(0).getYear());
    assertEquals(currentMonth, result.get(0).getMonth());
    assertEquals(
        currentLine.getQuantity(),
        result.get(0).getSoldQuantity()); // Seule la réservation du mois courant
  }

  @Test
  void testMultipleReservationLinesForSameProduct() {
    // Arrange - Plusieurs lignes de réservation pour un même produit, pour tester lignes 114 et 118
    Reservation reservation = new Reservation();
    reservation.setId(1L);
    reservation.setClient(testClient);
    reservation.setStatus(ReservationStatus.CONFIRMED);
    reservation.setSaleDate(LocalDate.now());

    // Première ligne de réservation
    ReservationLine line1 = new ReservationLine();
    line1.setId(1L);
    line1.setReservation(reservation);
    line1.setBatch(testBatch);
    line1.setQuantity(10);

    // Deuxième ligne de réservation pour le même produit
    Batch anotherBatchSameProduct = new Batch();
    anotherBatchSameProduct.setId(2L);
    anotherBatchSameProduct.setProduct(testProduct); // Même produit
    anotherBatchSameProduct.setUnitPrice(3.50); // Prix différent
    anotherBatchSameProduct.setSaleUnit("kg");
    anotherBatchSameProduct.setAvailableQuantity(30);
    anotherBatchSameProduct.setStatus(BatchStatus.RECEIVED);
    anotherBatchSameProduct.setDepositDate(LocalDate.now().minusDays(3));

    ReservationLine line2 = new ReservationLine();
    line2.setId(2L);
    line2.setReservation(reservation);
    line2.setBatch(anotherBatchSameProduct);
    line2.setQuantity(15);

    // Associer les lignes à la réservation
    List<ReservationLine> lines = new ArrayList<>();
    lines.add(line1);
    lines.add(line2);
    reservation.setReservationLines(lines);

    List<Batch> receivedBatches = Arrays.asList(testBatch, anotherBatchSameProduct);
    List<Reservation> confirmedReservations = Collections.singletonList(reservation);

    when(batchRepository.findByStatus(BatchStatus.RECEIVED)).thenReturn(receivedBatches);
    when(reservationRepository.findByStatus(ReservationStatus.CONFIRMED))
        .thenReturn(confirmedReservations);

    // Act - Test spécifique pour les lignes 114 et 118 (incrémentation des quantités et du revenu)
    List<SalesStatisticsView> result = statisticsService.getSalesStatistics(null, null);

    // Assert
    assertNotNull(result);
    assertEquals(1, result.size()); // Une seule statistique car même produit, même mois/année

    SalesStatisticsView stats = result.get(0);

    // Vérifier que les quantités ont été additionnées (ligne 114)
    int expectedSoldQuantity = line1.getQuantity() + line2.getQuantity();
    assertEquals(expectedSoldQuantity, stats.getSoldQuantity());

    // Vérifier que les revenus ont été additionnés correctement (ligne 118)
    double expectedRevenue =
        (line1.getQuantity() * testBatch.getUnitPrice())
            + (line2.getQuantity() * anotherBatchSameProduct.getUnitPrice());
    assertEquals(expectedRevenue, stats.getTotalRevenue(), 0.001);
  }
}
