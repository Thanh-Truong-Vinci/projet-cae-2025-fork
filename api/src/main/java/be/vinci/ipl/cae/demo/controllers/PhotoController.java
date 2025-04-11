package be.vinci.ipl.cae.demo.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.models.dtos.NewPhoto;
import be.vinci.ipl.cae.demo.models.entities.Photo;
import be.vinci.ipl.cae.demo.services.PhotoService;

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
   * Endpoint to retrieve all photos.
   *
   * @return a list of all photos
   */
  @GetMapping({ "", "/" })
  public List<Photo> getAllPhotos() {
    return photoService.getAllPhotos();
  }

  /**
   * Endpoint to upload a photo.
   *
   * @param newPhoto name of the product
   * @param image    the image to upload
   * @return the created photo entity
   * @throws ConflictException if newPhoto is null
   */
  @PostMapping({ "", "/" })
  public Photo putPhoto(
      @RequestPart("photo") NewPhoto newPhoto, @RequestPart("image") MultipartFile image) {
    if (newPhoto == null) {
      throw new ConflictException("Photo information cannot be null");
    }
    return photoService.createPhoto(newPhoto.getProduct(), image);
  }
}
