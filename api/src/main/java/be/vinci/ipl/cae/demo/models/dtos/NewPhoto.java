package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la création d'une photo.
 */
@Data
@NoArgsConstructor
public class NewPhoto {
    private String product;
}