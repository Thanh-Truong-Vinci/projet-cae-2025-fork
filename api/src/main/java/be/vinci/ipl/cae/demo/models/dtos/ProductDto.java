package be.vinci.ipl.cae.demo.models.dtos;

/**
 * Data Transfer Object for Product.
 */
public class ProductDto {
  private String type;
  private String name;
  private String description;
  private String photo;

  /**
   * Gets the type of the product.
   * 
   * @return the type of the product
   */
  public String getType() {
    return type;
  }

  /**
   * Sets the type of the product.
   * 
   * @param type the type of the product
   */
  public void setType(String type) {
    this.type = type;
  }

  /**
   * Gets the name of the product.
   * 
   * @return the name of the product
   */
  public String getName() {
    return name;
  }

  /**
   * Sets the name of the product.
   * 
   * @param name the name of the product
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * Gets the description of the product.
   * 
   * @return the description of the product
   */
  public String getDescription() {
    return description;
  }

  /**
   * Sets the description of the product.
   * 
   * @param description the description of the product
   */
  public void setDescription(String description) {
    this.description = description;
  }

  /**
   * Gets the photo of the product.
   * 
   * @return the photo of the product
   */
  public String getPhoto() {
    return photo;
  }

  /**
   * Sets the photo of the product.
   * 
   * @param photo the photo of the product
   */
  public void setPhoto(String photo) {
    this.photo = photo;
  }
}
