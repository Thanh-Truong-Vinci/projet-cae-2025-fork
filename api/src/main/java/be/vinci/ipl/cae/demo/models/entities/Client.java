package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Entity;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Client entity.
 */
@Entity
@Data
@NoArgsConstructor
public class Client extends UserWithAddress {
  private String civility;
}
