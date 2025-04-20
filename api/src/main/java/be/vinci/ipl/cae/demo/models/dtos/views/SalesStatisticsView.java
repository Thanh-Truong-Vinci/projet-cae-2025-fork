package be.vinci.ipl.cae.demo.models.dtos.views;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO représentant les statistiques de ventes pour le tableau de bord des gestionnaires. Contient
 * les données agrégées par produit, année et mois pour l'analyse des quantités reçues et vendues.
 */
@Data
@NoArgsConstructor
public class SalesStatisticsView {

  private Long productId;
  private String productName;
  private String productType;
  private Integer year;
  private Integer month;
  private Integer receivedQuantity;
  private Integer soldQuantity;
  private String unitType;
  private Double totalRevenue;
}
