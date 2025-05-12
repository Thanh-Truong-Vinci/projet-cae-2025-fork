package be.vinci.ipl.cae.demo.models.dtos.requests;

import lombok.Data;

/** DTO for reservation status change requests that includes version for optimistic locking. */
@Data
public class ReservationStatusRequest {
  private Long reservationId;
  private Long version;
}
