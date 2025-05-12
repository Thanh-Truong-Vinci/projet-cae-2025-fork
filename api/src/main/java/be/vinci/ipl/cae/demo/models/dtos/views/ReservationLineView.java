package be.vinci.ipl.cae.demo.models.dtos.views;

import be.vinci.ipl.cae.demo.models.entities.ReservationLine;
import lombok.Data;

/**
 * Data Transfer Object (DTO) representing a reservation line view. This class simplifies the
 * ReservationLine entity for display purposes, avoiding circular references in JSON serialization.
 */
@Data
public class ReservationLineView {

  private Long id;
  private Integer quantity;
  private Long batchId;
  private Long productId;
  private String productName;
  private double unitPrice;
  private String imageLocation;
  private String unitType;
  /**
   * Constructor for ReservationLineView. Creates a reservation line view from a ReservationLine
   * entity.
   *
   * @param reservationLine the ReservationLine entity to convert
   */
  public ReservationLineView(ReservationLine reservationLine) {
    this.id = reservationLine.getId();
    this.quantity = reservationLine.getQuantity();
    this.batchId = reservationLine.getBatch().getId();
    this.productId = reservationLine.getBatch().getProduct().getId();
    this.productName = reservationLine.getBatch().getProduct().getName();
    this.unitPrice = reservationLine.getBatch().getUnitPrice();
    this.imageLocation = reservationLine.getBatch().getPhoto().getImageLocation();
    this.unitType = reservationLine.getBatch().getSaleUnit();
  }
}
