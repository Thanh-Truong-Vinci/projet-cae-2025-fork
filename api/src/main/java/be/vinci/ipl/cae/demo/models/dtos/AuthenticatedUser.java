package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthenticatedUser DTO.
 */
@Data
@NoArgsConstructor
public class AuthenticatedUser { 
  private String email;
  private String name;
  private String firstname;
  private String token;
  private String role;

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }
}
