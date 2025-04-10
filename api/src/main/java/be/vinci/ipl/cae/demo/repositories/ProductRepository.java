package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Product;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Interface de repository pour les entités `Product`.
 */
@Repository
public interface ProductRepository extends CrudRepository<Product, Long> {

  /**
   * Récupère tous les produits classés par ID en ordre décroissant.
   *
   * @return un Iterable de Produits triés par ID en ordre décroissant
   */
  Iterable<Product> findAllByOrderByIdDesc();

  /**
   * Récupère le produit avec l'ID spécifié.
   *
   * @param id l'ID du produit à chercher
   * @return le produit avec l'ID spécifié
   */
  Product findProductById(Long id);
}
