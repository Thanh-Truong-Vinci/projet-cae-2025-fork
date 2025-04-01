package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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
  @JoinColumn(name = "manager_id", nullable = false)
  private Manager manager;

  @ManyToOne
  @JoinColumn(name = "producer_id", nullable = false)
  private Producer producer;

  @ManyToOne
  @JoinColumn(name = "product_id", nullable = false)
  private Product product;

  @Column(name = "photo_url")
  private String photo;

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

  @ManyToOne
  @JoinColumn(name = "notification_id")
  private Notification notification;

  @Column(name = "deposit_date", nullable = false)
  private LocalDate depositDate;
}
