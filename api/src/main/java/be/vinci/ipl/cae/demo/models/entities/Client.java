package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Client entity.
 */
@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
public class Client extends UserWithAddress {
}