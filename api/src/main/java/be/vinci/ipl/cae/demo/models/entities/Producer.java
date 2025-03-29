package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Producer entity. */
@Entity
@Data
@NoArgsConstructor
public class Producer extends UserWithAddress {

  @Column(nullable = false)
  private String company;
}
