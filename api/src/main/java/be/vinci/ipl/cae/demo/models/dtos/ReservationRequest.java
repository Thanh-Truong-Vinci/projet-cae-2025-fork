package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/** DTO for reservation requests. */
@Data
@NoArgsConstructor
public class ReservationRequest {

  private Long batchId;
  private int quantity;
}
