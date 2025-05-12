package be.vinci.ipl.cae.demo.models.dtos.requests;

import lombok.Data;

/** DTO for changing reservation line quantity that includes version for optimistic locking. */
@Data
public class ChangeQuantityRequest {
  private Long reservationLineId;
  private Integer quantity;
  private Long version;
}
