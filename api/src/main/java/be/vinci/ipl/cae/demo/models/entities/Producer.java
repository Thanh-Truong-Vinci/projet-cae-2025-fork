package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Producer entity.
 */
@Entity
@Table(name = "producers")
@Data
@NoArgsConstructor
public class Producer extends UserWithAddress {

  @Column(nullable = false)
  private String company;
}
