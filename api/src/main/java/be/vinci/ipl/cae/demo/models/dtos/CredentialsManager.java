package be.vinci.ipl.cae.demo.models.dtos;

import lombok.NoArgsConstructor;
import lombok.Data;

/**
 * CredentialsManager DTO.
 */
@Data
@NoArgsConstructor
public class CredentialsManager {
    private String name;
    private String firstname;
    private String email;
    private String password;
}
