package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** NewNotification DTO. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewNotification {

  private String message;

  private String reasonOfReject;

  private Long batchId;
}
