package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDate;

/**
 * Data Transfer Object for Batch.
 */
public class BatchDto {
  private Long producerId;
  private Long productId;
  private String photo;
  private LocalDate availabilityDate;
  private Double unitPrice;
  private String saleUnit;
  private Integer availableQuantity;

  /**
   * Gets the producer ID.
   *
   * @return the producer ID
   */
  public Long getProducerId() {
    return producerId;
  }

  /**
   * Sets the producer ID.
   *
   * @param producerId the producer ID to set
   */
  public void setProducerId(Long producerId) {
    this.producerId = producerId;
  }

  /**
   * Gets the product ID.
   *
   * @return the product ID
   */
  public Long getProductId() {
    return productId;
  }

  /**
   * Sets the product ID.
   *
   * @param productId the product ID to set
   */
  public void setProductId(Long productId) {
    this.productId = productId;
  }

  /**
   * Gets the photo.
   *
   * @return the photo
   */
  public String getPhoto() {
    return photo;
  }

  /**
   * Sets the photo.
   *
   * @param photo the photo to set
   */
  public void setPhoto(String photo) {
    this.photo = photo;
  }

  /**
   * Gets the availability date.
   *
   * @return the availability date
   */
  public LocalDate getAvailabilityDate() {
    return availabilityDate;
  }

  /**
   * Sets the availability date.
   *
   * @param availabilityDate the availability date to set
   */
  public void setAvailabilityDate(LocalDate availabilityDate) {
    this.availabilityDate = availabilityDate;
  }

  /**
   * Gets the unit price.
   *
   * @return the unit price
   */
  public Double getUnitPrice() {
    return unitPrice;
  }

  /**
   * Sets the unit price.
   *
   * @param unitPrice the unit price to set
   */
  public void setUnitPrice(Double unitPrice) {
    this.unitPrice = unitPrice;
  }

  /**
   * Gets the sale unit.
   *
   * @return the sale unit
   */
  public String getSaleUnit() {
    return saleUnit;
  }

  /**
   * Sets the sale unit.
   *
   * @param saleUnit the sale unit to set
   */
  public void setSaleUnit(String saleUnit) {
    this.saleUnit = saleUnit;
  }

  /**
   * Gets the available quantity.
   *
   * @return the available quantity
   */
  public Integer getAvailableQuantity() {
    return availableQuantity;
  }

  /**
   * Sets the available quantity.
   *
   * @param availableQuantity the available quantity to set
   */
  public void setAvailableQuantity(Integer availableQuantity) {
    this.availableQuantity = availableQuantity;
  }
}
