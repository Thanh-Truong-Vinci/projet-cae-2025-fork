package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CredentialsRegister DTO.
 */
@Data
@NoArgsConstructor
public class CredentialsProfile {

  private String email;
  private String currentPassword;
  private String newPassword;
}
