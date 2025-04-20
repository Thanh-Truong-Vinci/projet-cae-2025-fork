package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Photo;
import be.vinci.ipl.cae.demo.repositories.PhotoRepository;
import com.azure.storage.blob.BlobClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service class for managing photos.
 */
@Service
public class PhotoService {

  private final String blobServiceEndpoint;
  private final String sasToken;
  private final String containerName;
  private final PhotoRepository photoRepository;

  /**
   * Constructor for PhotoService.
   *
   * @param photoRepository     the repository for managing photo entities
   * @param blobServiceEndpoint the endpoint for the Azure Blob service
   * @param sasToken            the SAS token for accessing the Azure Blob service
   * @param containerName       the name of the container in Azure Blob storage
   */
  public PhotoService(
      PhotoRepository photoRepository,
      @Value("${azure.blob.service-endpoint}") String blobServiceEndpoint,
      @Value("${azure.blob.sas-token}") String sasToken,
      @Value("${azure.blob.container-name}") String containerName) {

    this.photoRepository = photoRepository;
    this.blobServiceEndpoint = blobServiceEndpoint;
    this.sasToken = sasToken;
    this.containerName = containerName;
  }

  /**
   * Retrieve all photos from the database.
   *
   * @return a list of all photos
   */
  public List<Photo> getAllPhotos() {
    return (List<Photo>) photoRepository.findAll();
  }

  /**
   * Retrieve a photo by its ID.
   *
   * @param id the ID of the photo to retrieve
   * @return the photo if found, null otherwise
   */
  public Photo getPhotoById(Long id) {
    return photoRepository.findById(id).orElse(null);
  }

  /**
   * Create a photo entry and upload the image to Azure Blob storage.
   *
   * @param product the product name associated with the photo
   * @param image   the image file to be uploaded
   * @return the created Photo entity
   */
  public Photo createPhoto(String product, MultipartFile image) {
    Photo photo = new Photo();
    photo.setProductName(product);
    if (image != null && !image.isEmpty()) {
      String blobUrl = uploadImageToBlob(image);
      photo.setImageLocation(blobUrl);
    }
    return photoRepository.save(photo);
  }

  /**
   * Upload an image to a blob on Azure storage with a generated UUID as filename. The image is
   * uploaded to the "images" folder. The original filename is stored in the metadata.
   *
   * @param image the image file to be uploaded
   * @return the blob URL of the uploaded image
   */
  private String uploadImageToBlob(MultipartFile image) {
    String imageUuid = UUID.randomUUID().toString();
    Map<String, String> metadata = new HashMap<>();

    metadata.put("originalFileName", image.getOriginalFilename());
    BlobClientBuilder blobClientBuilder =
        new BlobClientBuilder()
            .endpoint(blobServiceEndpoint)
            .sasToken(sasToken)
            .containerName(containerName)
            .blobName(imageUuid);

    try {
      blobClientBuilder.buildClient().upload(image.getInputStream(), image.getSize(), true);
      blobClientBuilder.buildClient().setMetadata(metadata);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
    blobClientBuilder
        .buildClient()
        .setHttpHeaders(new BlobHttpHeaders().setContentType(image.getContentType()));

    return blobClientBuilder.buildClient().getBlobUrl();
  }
}
