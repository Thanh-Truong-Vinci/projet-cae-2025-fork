package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/** Manager entity. */
@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@NoArgsConstructor
public class Manager extends User {

  @ManyToOne
  @JoinColumn(name = "manager")
  private Manager manager;
}

