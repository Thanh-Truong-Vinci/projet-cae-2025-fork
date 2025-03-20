package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Manager entity.
 */
@Entity
@Table(name = "managers")
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