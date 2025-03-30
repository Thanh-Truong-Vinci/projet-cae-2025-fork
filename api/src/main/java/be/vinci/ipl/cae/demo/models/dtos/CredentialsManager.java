package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/** CredentialsManager DTO. */
@Data
@NoArgsConstructor
public class CredentialsManager extends Credentials {
  private String name;
  private String firstname;
}
