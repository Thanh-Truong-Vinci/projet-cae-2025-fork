package be.vinci.ipl.cae.demo.models.dtos.views;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** BatchView DTO pour l'affichage fusionné des lots avec même produit et prix. */
@Data
@NoArgsConstructor
public class BatchView {
    private Long productId;
    private String productName;
    private String productType;
    private Double unitPrice;
    private String saleUnit;
    private Integer totalQuantity;
    private String imageLocation;
    private String companyName;
    private LocalDate earliestProductionDate; // Pour le tri
    private List<Long> batchIds = new ArrayList<>();
    private List<Integer> batchQuantities = new ArrayList<>(); // Quantités correspondant à chaque batch
}
