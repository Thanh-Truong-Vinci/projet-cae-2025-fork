package be.vinci.ipl.cae.demo.models.entities;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lot entity representing a batch of products.
 */
@Entity
@Table(name = "lots")
@Data
@NoArgsConstructor
public class Lot {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_lot")
  private Long id;

  @ManyToOne
  @JoinColumn(name = "gestionnaire", nullable = false)
  private Long manager;

  @ManyToOne
  @JoinColumn(name = "producteur", nullable = false)
  private Long producer;

  @ManyToOne
  @JoinColumn(name = "produit", nullable = false)
  private Long product;

  @Column(name = "photo", nullable = true)
  private String photo;

  @Column(name = "date_disponibilite", nullable = false)
  private LocalDate availabilityDate;

  @Column(name = "prix_unitaire", nullable = false)
  private Double unitPrice;

  @Column(name = "unite_vente", nullable = false)
  private String saleUnit;

  @Column(name = "quantite_disponible", nullable = false)
  private Integer availableQuantity;

  @Column(nullable = false)
  private String statut; // e.g., "approuvé", "en attente", "refusé", "supprimé"

  @ManyToOne
  @JoinColumn(name = "notification", nullable = true)
  private Long notification;

  @Column(name = "date_depot", nullable = false)
  private LocalDate depositDate;
}
