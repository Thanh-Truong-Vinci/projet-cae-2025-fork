package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for batch rejection details.
 */
@Data
@NoArgsConstructor
public class BatchReject {
  private Long batchId;
  private String notificationMessage;
}
