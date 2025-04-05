package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.Photo;
import be.vinci.ipl.cae.demo.services.PhotoService;
import be.vinci.ipl.cae.demo.models.dtos.NewPhoto;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

/** Controller to upload an image. */
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
   * @param  product the name of the product
   * @param  image the image to upload
   */
  @PostMapping({"", "/"})
  public Photo putPhoto(@RequestPart("product") NewPhoto newPhoto,
                       @RequestPart("image") MultipartFile image) {
    if (product == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }
     return photoService.createPhoto(newPhoto.getProduct(), image);
  }
}

