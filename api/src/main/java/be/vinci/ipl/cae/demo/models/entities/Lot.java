package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

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
  private Manager manager;

  @ManyToOne
  @JoinColumn(name = "producteur", nullable = false)
  private Producer producer;

  @ManyToOne
  @JoinColumn(name = "produit", nullable = false)
  private Product product;

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
  private Notification notification;

  @Column(name = "date_depot", nullable = false)
  private LocalDate depositDate;
}
