package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * UserWithAddress entity.
 */
@Entity
@Table(name = "user_with_address")
@Data
@NoArgsConstructor
public abstract class UserWithAddress extends User {

  @Column(nullable = false)
  private String street;

  @Column(name = "number", nullable = false)
  private String number;

  private String box;

  @Column(name = "postal_code", nullable = false)
  private String postalCode;

  @Column(nullable = false)
  private String city;

  @Column(nullable = false)
  private String country;

  private String phoneNumber;
}
