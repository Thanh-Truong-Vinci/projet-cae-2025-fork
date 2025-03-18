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
}
