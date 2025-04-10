package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * UserWithAddress entity.
 */
@Entity
@Data
@NoArgsConstructor
public abstract class UserWithAddress extends User {

  @Column(nullable = false)
  private String street;

  @Column(name = "number", nullable = false)
  private String number;

  @Column(nullable = true)
  private String box;

  @Column(name = "postal_code", nullable = false)
  private String postalCode;

  @Column(nullable = false)
  private String city;

  @Column(nullable = false)
  private String country;

  @Column(nullable = false)
  private String phoneNumber;
}
