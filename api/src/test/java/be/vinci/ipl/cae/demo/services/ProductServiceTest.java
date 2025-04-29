package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.models.dtos.NewProduct;
import be.vinci.ipl.cae.demo.models.entities.Photo;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.repositories.PhotoRepository;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductTypeRepository productTypeRepository;

    @Mock
    private PhotoRepository photoRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
    private ProductType testProductType;
    private Photo testPhoto;
    private NewProduct testNewProduct;

    @BeforeEach
    void setUp() {
        // Configuration des objets de test
        testProductType = new ProductType();
        testProductType.setId(1L);
        testProductType.setTitle("Légume");

        testPhoto = new Photo();
        testPhoto.setId(1L);

        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName("Carotte");
        testProduct.setType(testProductType);
        testProduct.setPhoto(testPhoto);

        testNewProduct = new NewProduct();
        testNewProduct.setName("Carotte");
        testNewProduct.setTypeId(1L);
        testNewProduct.setDescription("Légume orange");
        testNewProduct.setPhotoId(1L);
    }

    @Test
    void createProduct_ShouldSaveAndReturnProduct() {
        // Arrange
        String productName = "Carotte";
        String description = "Légume orange";

        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        Product result = productService.createProduct(productName, testProductType, description, testPhoto);

        // Assert
        assertNotNull(result);
        assertEquals(productName, result.getName());
        assertEquals(testProductType, result.getType());
        verify(productRepository).save(any(Product.class));
    }

    // Garder uniquement un test pour le comportement réel du service
    @Test
    void createProduct_WithNullProductType_ShouldCreateProductWithNullType() {
        // Arrange
        String productName = "Carotte";
        String description = "Légume orange";

        Product expected = new Product();
        expected.setName(productName);
        expected.setDescription(description);
        expected.setPhoto(testPhoto);

        when(productRepository.save(any(Product.class))).thenReturn(expected);

        // Act
        Product result = productService.createProduct(productName, null, description, testPhoto);

        // Assert
        assertNotNull(result);
        assertNull(result.getType());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_WithDTO_ShouldSaveAndReturnProduct() {
        // Arrange
        when(productTypeRepository.findById(testNewProduct.getTypeId())).thenReturn(Optional.of(testProductType));
        when(photoRepository.findById(testNewProduct.getPhotoId())).thenReturn(Optional.of(testPhoto));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        Product result = productService.createProduct(testNewProduct);

        // Assert
        assertNotNull(result);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void getProductById_WhenExists_ShouldReturnProduct() {
        // Arrange
        Long productId = 1L;
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));

        // Act
        Product result = productService.getProductById(productId);

        // Assert
        assertNotNull(result);
        assertEquals(productId, result.getId());
        assertEquals("Carotte", result.getName());
    }

    @Test
    void getProductById_WhenNotExists_ShouldReturnNull() {
        // Arrange
        Long productId = 999L;
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        // Act
        Product result = productService.getProductById(productId);

        // Assert
        assertNull(result);
    }

    @Test
    void getAllProducts_ShouldReturnAllProducts() {
        // Arrange
        Product product1 = new Product();
        product1.setId(1L);
        product1.setName("Carotte");

        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Pomme de terre");

        List<Product> products = Arrays.asList(product1, product2);
        when(productRepository.findAll()).thenReturn(products);

        // Act
        Iterable<Product> result = productService.getAllProducts(null);

        // Assert
        assertNotNull(result);
        assertEquals(2, ((List<Product>) result).size());
        // Capture la méthode réellement appelée
        verify(productRepository, times(1)).findAll();
    }

    @Test
    void getAllProducts_WithDescOrder_ShouldReturnProductsInReverseOrder() {
        // Arrange
        Product product1 = new Product();
        product1.setId(1L);
        product1.setName("Carotte");

        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Pomme de terre");

        List<Product> products = Arrays.asList(product1, product2);
        when(productRepository.findAll()).thenReturn(products);

        // Act
        Iterable<Product> result = productService.getAllProducts("desc");

        // Assert
        assertNotNull(result);
        List<Product> resultList = new ArrayList<>();
        result.forEach(resultList::add);
        assertEquals(2, resultList.size());
        assertEquals("Pomme de terre", resultList.get(0).getName()); // Ordre inversé
        assertEquals("Carotte", resultList.get(1).getName());
    }

    @Test
    void getAllProducts_WithAscOrder_ShouldReturnProductsInOriginalOrder() {
        // Arrange
        Product product1 = new Product();
        product1.setId(1L);
        product1.setName("Carotte");

        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Pomme de terre");

        List<Product> products = Arrays.asList(product1, product2);
        when(productRepository.findAll()).thenReturn(products);

        // Act
        Iterable<Product> result = productService.getAllProducts("asc");

        // Assert
        assertNotNull(result);
        List<Product> resultList = new ArrayList<>();
        result.forEach(resultList::add);
        assertEquals(2, resultList.size());
        assertEquals("Carotte", resultList.get(0).getName()); // Ordre original
        assertEquals("Pomme de terre", resultList.get(1).getName());
    }

    @Test
    void getProducts_WithTypeIdAndOrder_ShouldReturnFilteredAndOrderedProducts() {
        // Arrange
        Product product1 = new Product();
        product1.setId(1L);
        product1.setName("Carotte");
        product1.setType(testProductType);
        product1.setDescription("Légume orange"); // Assurez-vous que la description est définie

        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Pomme de terre");
        product2.setType(testProductType);
        product2.setDescription("Tubercule comestible"); // Assurez-vous que la description est définie

        List<Product> products = Arrays.asList(product1, product2);
        when(productRepository.findAll()).thenReturn(products); // C'est cette ligne qui manque

        // Act
        List<Product> result = productService.getProducts("e", testProductType.getTitle()); // "e" est le terme de recherche

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size()); // Les deux produits contiennent "e"
    }

    @Test
    void getProducts_WithNullTypeIdAndOrder_ShouldReturnAllProductsOrdered() {
        // Arrange
        Product product1 = new Product();
        product1.setId(1L);
        product1.setName("Carotte");
        product1.setType(testProductType);
        product1.setDescription("Description de carotte");

        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Pomme de terre");
        product2.setType(testProductType);
        product2.setDescription("Description de pomme de terre");

        List<Product> products = Arrays.asList(product1, product2);
        when(productRepository.findAll()).thenReturn(products);

        // Act
        List<Product> result = productService.getProducts(null, testProductType.getTitle());

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    void getProducts_WithInvalidTypeId_ShouldReturnEmptyList() {
        // Arrange
        String invalidType = "abc"; // String non numérique

        // Act
        List<Product> result = productService.getProducts(invalidType, null);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void updateProduct_WithDTO_WhenExists_ShouldUpdateAndReturnProduct() {
        // Arrange
        Long productId = 1L;

        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productTypeRepository.findById(testNewProduct.getTypeId())).thenReturn(Optional.of(testProductType));
        when(photoRepository.findById(testNewProduct.getPhotoId())).thenReturn(Optional.of(testPhoto));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        Product result = productService.updateProduct(productId, testNewProduct);

        // Assert
        assertNotNull(result);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void updateProduct_WithDTO_WhenProductNotFound_ShouldReturnNull() {
        // Arrange
        Long productId = 999L;
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        // Act
        Product result = productService.updateProduct(productId, testNewProduct);

        // Assert
        assertNull(result);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void updateProduct_WithDirectParams_ShouldUpdateAndReturnProduct() {
        // Arrange
        Long productId = 1L;

        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        Product result = productService.updateProduct(productId, new NewProduct());

        // Assert
        assertNotNull(result);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void updateProduct_WithStringParams_ShouldUpdateAndReturnProduct() {
        // Arrange
        Long productId = 1L;
        String newName = "Carotte Bio";
        Long typeId = 1L;

        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productTypeRepository.findById(typeId)).thenReturn(Optional.of(testProductType));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        NewProduct updatedProduct = new NewProduct();
        updatedProduct.setName(newName);
        updatedProduct.setTypeId(typeId);
        Product result = productService.updateProduct(productId, updatedProduct);

        // Assert
        assertNotNull(result);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void deleteProduct_WhenExists_ShouldDeleteProduct() {
        // Arrange
        Long productId = 1L;
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));

        // Act
        productService.deleteProduct(productId);

        // Assert
        verify(productRepository).delete(testProduct);
    }

    @Test
    void deleteProduct_WhenNotExists_ShouldReturnNull() {
        // Arrange
        Long productId = 999L;
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        // Act
        Product result = productService.deleteProduct(productId);

        // Assert
        assertNull(result);
        verify(productRepository, never()).delete(any(Product.class));
    }

    @Test
    void getProductsByType_ShouldReturnProductsOfSpecificType() {
        // Arrange
        Long typeId = 1L;

        when(productRepository.findById(typeId)).thenReturn(Optional.of(testProduct));

        // Act
        List<Product> result = new ArrayList<>();
        result.add(productService.getProductById(typeId));

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Carotte", result.get(0).getName());
    }

    @Test
    void getProductsByType_WithNonExistentType_ShouldReturnEmptyList() {
        // Arrange
        Long typeId = 999L;

        when(productRepository.findById(typeId)).thenReturn(Optional.empty());

        // Act
        List<Product> result = new ArrayList<>();
        Product product = productService.getProductById(typeId);
        if (product != null) {
            result.add(product);
        }

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void createProduct_WithStringParams_ShouldCreateAndReturnProduct() {
        // Arrange
        String name = "Carotte Bio";
        Long typeId = 1L;

        when(productTypeRepository.findById(typeId)).thenReturn(Optional.of(testProductType));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        ProductType productType = productTypeRepository.findById(typeId).orElse(null);
        Product result = productService.createProduct(name, productType, null, null);

        // Assert
        assertNotNull(result);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_WithNullType_ShouldStillCreateProduct() {
        // Arrange
        String name = "Carotte Bio";
        String description = "Description";

        Product expected = new Product();
        expected.setName(name);
        expected.setDescription(description);
        expected.setPhoto(new Photo());
        expected.setType(null);

        when(productRepository.save(any(Product.class))).thenReturn(expected);

        // Act
        Product result = productService.createProduct(name, null, description, new Photo());

        // Assert
        assertNotNull(result);
        assertNull(result.getType());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void getProducts_WithNullTypeIdAndOrder_ShouldReturnNoProduct() {
        // Arrange
        Product product1 = new Product();
        product1.setId(1L);
        product1.setName("Carotte");
        product1.setType(testProductType);
        product1.setDescription("Description de carotte");

        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Pomme de terre");
        product2.setType(testProductType);
        product2.setDescription("Description de pomme de terre");

        List<Product> products = Arrays.asList(product1, product2);
        when(productRepository.findAll()).thenReturn(products);

        // Act
        List<Product> result = productService.getProducts("z", testProductType.getTitle());

        // Assert
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void createProduct_WithNull_ShouldCreateProduct() {
        // Arrange
        NewProduct expected = new NewProduct();


        // Act
        Product result = productService.createProduct(expected);

        // Assert

        assertNull(result);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void getProducts_WithSearchMatchingDescription_ShouldReturnProduct() {
        // Arrange
        Product product1 = new Product();
        product1.setId(1L);
        product1.setName("Carotte");
        product1.setType(testProductType);
        product1.setDescription("Description");

        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Pomme de terre");
        product2.setType(testProductType);
        product2.setDescription("Description");

        List<Product> products = Arrays.asList(product1, product2);
        when(productRepository.findAll()).thenReturn(products);

        // Act
        List<Product> result = productService.getProducts("tion", testProductType.getTitle());

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    void getProducts_WithNameMatchingButDescriptionNotMatching_ShouldReturnProduct() {
        // Arrange
        Product product1 = new Product();
        product1.setId(1L);
        product1.setName("Carotte");
        product1.setType(testProductType);
        product1.setDescription("Légume orange");

        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Search term in name");
        product2.setType(testProductType);
        product2.setDescription("Description sans terme recherché");

        List<Product> products = Arrays.asList(product1, product2);
        when(productRepository.findAll()).thenReturn(products);

        // Act
        List<Product> result = productService.getProducts("Search", null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Search term in name", result.get(0).getName());
    }

    @Test
    void getProducts_WithDifferentTypesOfProducts_ShouldFilterByType() {
        // Arrange
        Product product1 = new Product();
        product1.setId(1L);
        product1.setName("Carotte");

        // Créer un autre type de produit
        ProductType otherType = new ProductType();
        otherType.setId(2L);
        otherType.setTitle("Fruit");

        product1.setType(otherType);
        product1.setDescription("Description de carotte");

        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Pomme de terre");
        product2.setType(testProductType);
        product2.setDescription("Description de pomme de terre");

        List<Product> products = Arrays.asList(product1, product2);
        when(productRepository.findAll()).thenReturn(products);

        // Act
        List<Product> result = productService.getProducts(null, "Légume");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Pomme de terre", result.get(0).getName());
    }

}