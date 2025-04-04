package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Photo;
import be.vinci.ipl.cae.demo.repositories.PhotoRepository;
import com.azure.storage.blob.BlobClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/** Service class for managing photos. */
@Service
public class PhotoService {
    
    private final String blobServiceEndpoint;
    private final String sasToken;
    private final String containerName;
    private final PhotoRepository photoRepository;

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

    public Photo ceartePhoto(@RequestBody String product, MultipartFile image){
    Photo photo = new Photo();
        photo.setProductName(product);
        if (image != null && !image.isEmpty()) {
            String blobUrl = uploadImageToBlob(image);
            photo.setImageLocation(blobUrl);
        }
        return photoRepository.save(photo);
    }

    /**
     * Upload an image to a blob on Azure storage with a generated UUID as filename.
     * The image is uploaded to the "images" folder.
     * The original filename is stored in the metadata.
     * @return the blob url
     */
    private String uploadImageToBlob(MultipartFile image) {
        String imageUUID = UUID.randomUUID().toString();
        Map<String, String> metadata = new HashMap<>();

        metadata.put("originalFileName", image.getOriginalFilename());
        BlobClientBuilder blobClientBuilder = new BlobClientBuilder()
                .endpoint(blobServiceEndpoint)
                .sasToken(sasToken)
                .containerName(containerName)
                .blobName(imageUUID);

        try {
            blobClientBuilder.buildClient().upload(image.getInputStream(), image.getSize(), true);
            blobClientBuilder.buildClient().setMetadata(metadata);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        blobClientBuilder.buildClient()
                .setHttpHeaders(new BlobHttpHeaders().setContentType(image.getContentType()));

        return blobClientBuilder.buildClient().getBlobUrl();
    }
}
