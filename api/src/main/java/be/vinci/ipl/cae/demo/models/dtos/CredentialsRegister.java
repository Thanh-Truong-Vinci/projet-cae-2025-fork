package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CredentialsRegister DTO.
 */
@Data
@NoArgsConstructor
public class CredentialsRegister {

  private String nom;
  private String prenom;
  private String email;
  private String password;
  private String rue;
  private String numeroRue;
  private String codePostal;
  private String commune;
  private String pays;
  private String tel;
}
