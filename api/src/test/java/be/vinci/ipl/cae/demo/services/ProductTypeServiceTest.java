package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class ProductTypeServiceTest {

    @Mock
    private ProductTypeRepository productTypeRepository;

    @InjectMocks
    private ProductTypeService productTypeService;

    private ProductType testProductType;

    @BeforeEach
    void setUp() {
        // Configuration commune pour les tests
        testProductType = new ProductType();
        testProductType.setId(1L);
        testProductType.setTitle("Légume");
    }

    @Test
    void createProductType_ShouldReturnCreatedProductType() {
        // Arrange
        String title = "Légume";
        when(productTypeRepository.save(any(ProductType.class))).thenReturn(testProductType);

        // Act
        ProductType result = productTypeService.createProductType(title);

        // Assert
        assertNotNull(result);
        assertEquals(title, testProductType.getTitle());
        verify(productTypeRepository).save(any(ProductType.class));
    }

    @Test
    void addProductType_WhenTitleDoesNotExist_ShouldCreateProductType() {
        // Arrange
        String title = "Légume";
        when(productTypeRepository.findByTitle(title)).thenReturn(null);

        // Act
        productTypeService.addProductType(title);

        // Assert
        verify(productTypeRepository).findByTitle(title);
        verify(productTypeRepository).save(any(ProductType.class));
    }

    @Test
    void addProductType_WhenTitleAlreadyExists_ShouldThrowException() {
        // Arrange
        String title = "Légume";
        when(productTypeRepository.findByTitle(title)).thenReturn(testProductType);

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            productTypeService.addProductType(title);
        });

        assertEquals("Product type already exists", exception.getMessage());
        verify(productTypeRepository).findByTitle(title);
        verify(productTypeRepository, never()).save(any(ProductType.class));
    }

    @Test
    void deleteProductType_WhenIdExists_ShouldDeleteProductType() {
        // Arrange
        Long id = 1L;
        when(productTypeRepository.existsById(id)).thenReturn(true);

        // Act
        productTypeService.deleteProductType(id);

        // Assert
        verify(productTypeRepository).existsById(id);
        verify(productTypeRepository).deleteById(id);
    }

    @Test
    void deleteProductType_WhenIdDoesNotExist_ShouldThrowException() {
        // Arrange
        Long id = 1L;
        when(productTypeRepository.existsById(id)).thenReturn(false);

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            productTypeService.deleteProductType(id);
        });

        assertEquals("Product type not found", exception.getMessage());
        verify(productTypeRepository).existsById(id);
        verify(productTypeRepository, never()).deleteById(anyLong());
    }

    @Test
    void getAllProductTypes_ShouldReturnAllProductTypes() {
        // Arrange
        ProductType productType1 = new ProductType();
        productType1.setId(1L);
        productType1.setTitle("Légume");

        ProductType productType2 = new ProductType();
        productType2.setId(2L);
        productType2.setTitle("Fruit");

        List<ProductType> productTypes = Arrays.asList(productType1, productType2);
        when(productTypeRepository.findAll()).thenReturn(productTypes);

        // Act
        Iterable<ProductType> result = productTypeService.getAllProductTypes();

        // Assert
        assertNotNull(result);
        assertEquals(2, ((List<ProductType>) result).size());
        verify(productTypeRepository).findAll();
    }

    @Test
    void getProductTypeById_WhenIdExists_ShouldReturnProductType() {
        // Arrange
        Long id = 1L;
        when(productTypeRepository.findById(id)).thenReturn(Optional.of(testProductType));

        // Act
        ProductType result = productTypeService.getProductTypeById(id);

        // Assert
        assertNotNull(result);
        assertEquals(id, result.getId());
        assertEquals("Légume", result.getTitle());
        verify(productTypeRepository).findById(id);
    }

    @Test
    void getProductTypeById_WhenIdDoesNotExist_ShouldReturnNull() {
        // Arrange
        Long id = 999L;
        when(productTypeRepository.findById(id)).thenReturn(Optional.empty());

        // Act
        ProductType result = productTypeService.getProductTypeById(id);

        // Assert
        assertNull(result);
        verify(productTypeRepository).findById(id);
    }
}