package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/** CredentialsRegister DTO. */
@Data
@NoArgsConstructor
public class CredentialsRegister {

  private String name;
  private String firstname;
  private String email;
  private String password;
  private String civility;
  private String street;
  private String number;
  private String box;
  private String postalCode;
  private String city;
  private String country;
  private String phoneNumber;
}
