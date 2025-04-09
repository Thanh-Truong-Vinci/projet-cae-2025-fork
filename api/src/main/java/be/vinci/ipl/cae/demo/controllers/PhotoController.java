package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NewPhoto;
import be.vinci.ipl.cae.demo.models.entities.Photo;
import be.vinci.ipl.cae.demo.services.PhotoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller to upload an image.
 */
@RestController
@RequestMapping("/photo")
public class PhotoController {

  private final PhotoService photoService;

  /**
   * Constructor for PhotoController.
   *
   * @param photoService the photo service to be used
   */
  public PhotoController(PhotoService photoService) {
    this.photoService = photoService;
  }

  /**
   * Endpoint to upload a photo.
   *
   * @param newPhoto name of the product
   * @param image    the image to upload
   */
  @PostMapping({"", "/"})
  public Photo putPhoto(
      @RequestPart("photo") NewPhoto newPhoto, @RequestPart("image") MultipartFile image) {
    if (newPhoto == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }
    return photoService.createPhoto(newPhoto.getProduct(), image);
  }
}
