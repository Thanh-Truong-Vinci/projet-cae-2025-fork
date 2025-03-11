package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * User entity.
 */
@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_client")
  private Long id;

  @Column(nullable = false)
  private String nom;

  @Column(nullable = false)
  private String prenom;

  @Column(nullable = false)
  private String rue;

  @Column(name = "numero_rue", nullable = false)
  private String numeroRue;

  private String boite;

  @Column(name = "code_postal", nullable = false)
  private String codePostal;

  @Column(nullable = false)
  private String commune;

  @Column(nullable = false)
  private String pays;

  private String tel;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String mdp;

  @Column(name = "date_inscription", nullable = false)
  private LocalDate dateInscription;
}
