package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * CredentialsManager DTO.
 */
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class CredentialsManager extends Credentials {

  private String name;
  private String firstname;
}
