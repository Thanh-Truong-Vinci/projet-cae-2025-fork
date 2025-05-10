package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.views.SalesStatisticsView;
import be.vinci.ipl.cae.demo.services.AuthsService.SecurityConstants;
import be.vinci.ipl.cae.demo.services.StatisticsService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Contrôleur pour gérer les requêtes liées aux statistiques. Expose les endpoints pour récupérer
 * les données analytiques de la coopérative.
 */
@RestController
@RequestMapping("/statistics")
public class StatisticsController {

  private final StatisticsService statisticsService;

  /**
   * Constructeur du contrôleur StatisticsController.
   *
   * @param statisticsService le service de statistiques à injecter
   */
  public StatisticsController(StatisticsService statisticsService) {
    this.statisticsService = statisticsService;
  }

  /**
   * Récupère les statistiques de ventes, optionnellement filtrées par année, mois et/ou produit.
   *
   * @param year l'année pour laquelle récupérer les statistiques (optionnel)
   * @param month le mois pour lequel récupérer les statistiques (optionnel)
   * @param productId l'identifiant du produit pour lequel récupérer les statistiques (optionnel)
   * @return la liste des statistiques de ventes
   */
  @GetMapping("/sales")
  @PreAuthorize(SecurityConstants.HAS_ROLE_MANAGER)
  public List<SalesStatisticsView> getSalesStatistics(
      @RequestParam(required = false) Integer year, 
      @RequestParam(required = false) Integer month,
      @RequestParam(required = false) Long productId) {
    return statisticsService.getSalesStatistics(year, month, productId);
  }
}
