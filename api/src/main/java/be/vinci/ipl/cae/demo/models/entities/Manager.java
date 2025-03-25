package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Entity;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

/**
 * Manager entity.
 */
@Entity
@Data
@NoArgsConstructor
public class Manager extends User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_manager")
  private Long id;

  @ManyToOne
  @JoinColumn(name = "manager_id", nullable = true)
  private Manager manager;
}