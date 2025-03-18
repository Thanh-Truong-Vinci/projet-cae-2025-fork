package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Manager entity.
 */
@Entity
@Table(name = "managers")
@Data
@NoArgsConstructor
public class Manager {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_manager")
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String lastName;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(name = "date_inscription", nullable = false)
  private LocalDate dateInscription;

  @ManyToOne
  @JoinColumn(name = "manager_id", nullable = true)
  private Manager manager;
}
