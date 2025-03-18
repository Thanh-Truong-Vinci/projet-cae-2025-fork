package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User entity.
 */
@MappedSuperclass
@Data
@NoArgsConstructor
public abstract class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_user")
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String firstname;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(name = "date_inscription", nullable = false)
  private LocalDate dateInscription;

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
