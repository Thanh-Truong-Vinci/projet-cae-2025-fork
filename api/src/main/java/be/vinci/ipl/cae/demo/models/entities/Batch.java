package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Batch entity representing a batch of products. */
@Entity
@Table(name = "batches")
@Data
@NoArgsConstructor
public class Batch {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @ManyToOne
  @JoinColumn(name = "manager_id", nullable = true)
  private Manager manager;

  @ManyToOne
  @JoinColumn(name = "producer_id", nullable = false)
  private Producer producer;

  @ManyToOne
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;

  @ManyToOne
  @JoinColumn(name = "photo_id", nullable = true)
  private Photo photo;

  @Column(name = "availability_date", nullable = false)
  private LocalDate availabilityDate;

  @Column(name = "unit_price", nullable = false)
  private Double unitPrice;

  @Column(name = "sale_unit", nullable = false)
  private String saleUnit;

  @Column(name = "available_quantity", nullable = false)
  private Integer availableQuantity;

  @Column(name = "status", nullable = false)
  @Enumerated(EnumType.STRING)
  private BatchStatus status;

  @Column(name = "notification_id", nullable = true)
  private Long notificationId;

  @Column(name = "deposit_date", nullable = true)
  private LocalDate depositDate;

  @Column(name = "production_date", nullable = false)
  private LocalDate productionDate;

  @Version private Long version;
}
