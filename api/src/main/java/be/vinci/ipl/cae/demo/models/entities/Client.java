package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Client entity.
 */
@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
public class Client extends User {

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