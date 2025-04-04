package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.Photo;
import be.vinci.ipl.cae.demo.services.PhotoService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
   * @param photo the photo to be uploaded
   */
  @PostMapping({"", "/"})
  public void putPhoto(@RequestBody Photo photo) {
    System.out.println(photoService); // TODO remove, here only for testing
  }
}

