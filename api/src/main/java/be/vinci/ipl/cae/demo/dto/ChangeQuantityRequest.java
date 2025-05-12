package be.vinci.ipl.cae.demo.dto;

public class ChangeQuantityRequest {
  private Long reservationLineId;
  private Integer quantity;
  private Long version;

  // Getters et setters
  public Long getReservationLineId() {
    return reservationLineId;
  }

  public void setReservationLineId(Long reservationLineId) {
    this.reservationLineId = reservationLineId;
  }

  public Integer getQuantity() {
    return quantity;
  }

  public void setQuantity(Integer quantity) {
    this.quantity = quantity;
  }

  public Long getVersion() {
    return version;
  }

  public void setVersion(Long version) {
    this.version = version;
  }
}
