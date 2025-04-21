package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/** Request object for changing the quantity of a reservation line. */
@Data
@NoArgsConstructor
public class ChangeQuantityRequest {
  private Long reservationLineId;
  private Integer quantity;
}
