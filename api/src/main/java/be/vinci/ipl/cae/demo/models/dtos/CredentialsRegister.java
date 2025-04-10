package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * CredentialsRegister DTO.
 */
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class CredentialsRegister extends Credentials {

  private String name;
  private String firstname;
  private String civility;
  private String street;
  private String number;
  private String box;
  private String postalCode;
  private String city;
  private String country;
  private String phoneNumber;
}
