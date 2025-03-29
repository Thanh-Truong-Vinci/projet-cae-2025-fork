package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Photo;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/** Photo repository. */
@Repository
public interface PhotoRepository extends CrudRepository<Photo, Long> {}
