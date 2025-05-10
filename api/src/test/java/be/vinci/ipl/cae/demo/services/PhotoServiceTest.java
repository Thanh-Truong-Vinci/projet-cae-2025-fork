package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.models.entities.Photo;
import be.vinci.ipl.cae.demo.repositories.PhotoRepository;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PhotoServiceTest {

  @Mock private PhotoRepository photoRepository;

  @Mock private MultipartFile mockImage;

  private PhotoService photoService;

  @BeforeEach
  void setUp() {
    // Créer une sous-classe anonyme de PhotoService qui surcharge uploadImageToBlob
    photoService =
        new PhotoService(photoRepository, "test-endpoint", "test-token", "test-container") {
          @Override
          protected String uploadImageToBlob(MultipartFile image) {
            // Éviter l'appel réel à Azure
            return "http://test-blob-url.com/test-image";
          }
        };
  }

  @Test
  void getAllPhotos_ReturnsAllPhotos() {
    // Arrange
    Photo photo1 = new Photo();
    photo1.setId(1L);
    photo1.setProductName("Product 1");
    photo1.setImageLocation("http://example.com/image1.jpg");

    Photo photo2 = new Photo();
    photo2.setId(2L);
    photo2.setProductName("Product 2");
    photo2.setImageLocation("http://example.com/image2.jpg");

    List<Photo> expectedPhotos = Arrays.asList(photo1, photo2);
    when(photoRepository.findAll()).thenReturn(expectedPhotos);

    // Act
    List<Photo> actualPhotos = photoService.getAllPhotos();

    // Assert
    assertEquals(expectedPhotos, actualPhotos);
  }

  @Test
  void getPhotoById_ExistingId_ReturnsPhoto() {
    // Arrange
    Photo expectedPhoto = new Photo();
    expectedPhoto.setId(1L);
    expectedPhoto.setProductName("Test Product");
    expectedPhoto.setImageLocation("http://example.com/image.jpg");

    when(photoRepository.findById(1L)).thenReturn(Optional.of(expectedPhoto));

    // Act
    Photo actualPhoto = photoService.getPhotoById(1L);

    // Assert
    assertEquals(expectedPhoto, actualPhoto);
  }

  @Test
  void getPhotoById_NonexistentId_ReturnsNull() {
    // Arrange
    when(photoRepository.findById(999L)).thenReturn(Optional.empty());

    // Act
    Photo result = photoService.getPhotoById(999L);

    // Assert
    assertNull(result);
  }

  @Test
  void createPhoto_WithValidImage_UploadsImageAndCreatesPhoto() throws IOException {
    // Arrange
    String productName = "Test Product";

    // Configure mockImage uniquement si nécessaire
    when(mockImage.isEmpty()).thenReturn(false);

    // Configure repository save
    when(photoRepository.save(any(Photo.class)))
        .thenAnswer(
            invocation -> {
              Photo savedPhoto = invocation.getArgument(0);
              savedPhoto.setId(1L); // Simuler la génération d'ID
              return savedPhoto;
            });

    // Act
    Photo result = photoService.createPhoto(productName, mockImage);

    // Assert
    assertNotNull(result);
    assertEquals(1L, result.getId());
    assertEquals(productName, result.getProductName());
    assertEquals("http://test-blob-url.com/test-image", result.getImageLocation());
  }

  @Test
  void createPhoto_WithNullImage_CreatesPhotoWithoutUploadingImage() {
    // Arrange
    String productName = "Test Product";

    // Configure repository save
    when(photoRepository.save(any(Photo.class)))
        .thenAnswer(
            invocation -> {
              Photo savedPhoto = invocation.getArgument(0);
              savedPhoto.setId(1L); // Simuler la génération d'ID
              return savedPhoto;
            });

    // Act
    Photo result = photoService.createPhoto(productName, null);

    // Assert
    assertNotNull(result);
    assertEquals(1L, result.getId());
    assertEquals(productName, result.getProductName());
    assertNull(result.getImageLocation());
  }

  @Test
  void createPhoto_WithEmptyImage_CreatesPhotoWithoutUploadingImage() throws IOException {
    // Arrange
    String productName = "Test Product";

    // Configure mockImage uniquement si nécessaire
    when(mockImage.isEmpty()).thenReturn(true);

    // Configure repository save
    when(photoRepository.save(any(Photo.class)))
        .thenAnswer(
            invocation -> {
              Photo savedPhoto = invocation.getArgument(0);
              savedPhoto.setId(1L); // Simuler la génération d'ID
              return savedPhoto;
            });

    // Act
    Photo result = photoService.createPhoto(productName, mockImage);

    // Assert
    assertNotNull(result);
    assertEquals(1L, result.getId());
    assertEquals(productName, result.getProductName());
    assertNull(result.getImageLocation());
  }
}
