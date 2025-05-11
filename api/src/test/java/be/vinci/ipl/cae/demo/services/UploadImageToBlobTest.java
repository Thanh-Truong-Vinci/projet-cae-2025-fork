package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.anyMap;
import static org.mockito.Mockito.anyString;

import be.vinci.ipl.cae.demo.repositories.PhotoRepository;
import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedConstruction.MockInitializer;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class UploadImageToBlobTest {

  @Mock private PhotoRepository photoRepository;

  @Mock private MultipartFile mockImage;

  @Mock private BlobClientBuilder mockBlobClientBuilder;

  @Mock private BlobClient mockBlobClient;

  private PhotoService photoService;

  // Helper method to mock construction of a class
  private static <T> AutoCloseable mockConstruction(
      Class<T> classToMock, MockInitializer<T> initializer) {
    return Mockito.mockConstruction(classToMock, initializer);
  }

  @BeforeEach
  void setUp() {
    photoService =
        new PhotoService(
            photoRepository, "https://test-endpoint.com", "test-sas-token", "test-container");
  }

  @Test
  void testDirectUploadImageToBlob() throws Exception {
    // Préparer les mocks pour le test
    byte[] imageData = "test image data".getBytes();
    InputStream imageStream = new ByteArrayInputStream(imageData);

    // Configuration du mock image
    when(mockImage.getOriginalFilename()).thenReturn("test.jpg");
    when(mockImage.getContentType()).thenReturn("image/jpeg");
    when(mockImage.getInputStream()).thenReturn(imageStream);
    when(mockImage.getSize()).thenReturn((long) imageData.length);

    // Mock pour BlobClientBuilder et BlobClient avec réflexion
    // Cette partie est nécessaire pour mocker une classe que vous instanciez directement dans votre
    // code
    try (var mockedConstruction =
        mockConstruction(
            BlobClientBuilder.class,
            (mock, context) -> {
              when(mock.endpoint(anyString())).thenReturn(mock);
              when(mock.sasToken(anyString())).thenReturn(mock);
              when(mock.containerName(anyString())).thenReturn(mock);
              when(mock.blobName(anyString())).thenReturn(mock);
              when(mock.buildClient()).thenReturn(mockBlobClient);
            })) {
      // Simuler le comportement du blobClient
      when(mockBlobClient.getBlobUrl())
          .thenReturn("https://test-endpoint.com/test-container/image-uuid");

      // Accéder à la méthode privée par réflexion
      Method uploadMethod =
          PhotoService.class.getDeclaredMethod("uploadImageToBlob", MultipartFile.class);
      uploadMethod.setAccessible(true);

      // Exécuter la méthode
      String result = (String) uploadMethod.invoke(photoService, mockImage);

      // Vérifier le résultat
      assertEquals("https://test-endpoint.com/test-container/image-uuid", result);

      // Vérifier que les méthodes du mock ont été appelées
      verify(mockImage).getOriginalFilename();
      verify(mockImage).getContentType();
      verify(mockImage).getInputStream();
      verify(mockImage).getSize();

      // Vérifier que le client blob a été utilisé correctement
      verify(mockBlobClient).upload(any(InputStream.class), anyLong(), anyBoolean());
      verify(mockBlobClient).setMetadata(anyMap());
      verify(mockBlobClient).setHttpHeaders(any(BlobHttpHeaders.class));
      verify(mockBlobClient).getBlobUrl();
    }
  }

  @Test
  void createPhoto_WithValidImage_UploadsAndReturnsPhoto() throws Exception {
    // Arrange
    String productName = "Test Product";
    String expectedUrl = "https://test-blob-url.com/image";

    // Configurer mockImage
    when(mockImage.isEmpty()).thenReturn(false);

    // Mocker uploadImageToBlob pour éviter l'appel réel
    PhotoService spyService = spy(photoService);
    doReturn(expectedUrl).when(spyService).uploadImageToBlob(any(MultipartFile.class));

    // Configurer repository
    when(photoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    var result = spyService.createPhoto(productName, mockImage);

    // Assert
    assertNotNull(result);
    assertEquals(productName, result.getProductName());
    assertEquals(expectedUrl, result.getImageLocation());

    // Vérifier que uploadImageToBlob a été appelé
    verify(spyService).uploadImageToBlob(mockImage);
    verify(photoRepository).save(any());
  }

  @Test
  void uploadImageToBlob_HandlesIOException() throws Exception {
    // Arrange - provoquer une IOException lors de l'appel à getInputStream()
    when(mockImage.getOriginalFilename()).thenReturn("test.jpg");
    when(mockImage.getInputStream()).thenThrow(new IOException("Test IO error"));

    // Accéder à la méthode privée par réflexion
    Method uploadMethod =
        PhotoService.class.getDeclaredMethod("uploadImageToBlob", MultipartFile.class);
    uploadMethod.setAccessible(true);

    // Act & Assert - capturer l'exception de réflexion et vérifier sa cause
    try {
      uploadMethod.invoke(photoService, mockImage);
      fail("La méthode aurait dû lancer une exception");
    } catch (InvocationTargetException e) {
      // Vérifier que la cause est une RuntimeException
      assertInstanceOf(RuntimeException.class, e.getCause());
      // Vérifier que cette RuntimeException contient bien une IOException
      assertInstanceOf(IOException.class, e.getCause().getCause());
      assertEquals("Test IO error", e.getCause().getCause().getMessage());
    }
  }

  // Removed custom MockInitializer interface as MockedConstruction.MockInitializer<T> will be used
  // directly
}
