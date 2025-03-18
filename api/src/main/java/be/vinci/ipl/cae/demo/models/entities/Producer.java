package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Producer entity.
 */
@Entity
@Table(name = "producers")
@Data
@NoArgsConstructor
public class Producer extends User {

  @Column(nullable = false)
  private String company;

  @Column(nullable = false)
  private String street;

  @Column(name = "street_number", nullable = false)
  private String streetNumber;

  private String box;

  @Column(name = "postal_code", nullable = false)
  private String postalCode;

  @Column(nullable = false)
  private String city;

  @Column(nullable = false)
  private String country;

  private String phoneNumber;
}
