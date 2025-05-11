package be.vinci.ipl.cae.demo.exceptions;

/** BadRequestException to handle invalid request parameters or syntax. */
public class BadRequestException extends RuntimeException {

  /** Constructor for BadRequestException. */
  public BadRequestException() {
    super();
  }

  /**
   * Constructor for BadRequestException.
   *
   * @param message the message.
   */
  public BadRequestException(String message) {
    super(message);
  }
}
