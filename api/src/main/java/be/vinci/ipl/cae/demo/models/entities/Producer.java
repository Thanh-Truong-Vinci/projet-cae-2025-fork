package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Producer entity.
 */
@Entity
@Table(name = "producers")
@Data
@NoArgsConstructor
public class Producer {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_producer")
  private Long id;

  @Column(nullable = false)
  private String firstName;

  @Column(nullable = false)
  private String name;

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

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false, unique = true)
  private String login;

  @Column(nullable = false)
  private String password;

  @Column(name = "date_inscription", nullable = false)
  private LocalDate dateInscription;
}
