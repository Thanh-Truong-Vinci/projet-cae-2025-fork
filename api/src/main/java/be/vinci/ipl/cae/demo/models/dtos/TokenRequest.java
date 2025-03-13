package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for receiving the token.
 */
@Data
@NoArgsConstructor
public class TokenRequest {
  private String token;
}