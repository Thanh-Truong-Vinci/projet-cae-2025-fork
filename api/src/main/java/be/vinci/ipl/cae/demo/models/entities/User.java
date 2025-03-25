package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
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
}