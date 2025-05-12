package be.vinci.ipl.cae.demo.exceptions;

/** OptimisticLockException to handle resource not found exceptions. */
public class OptimisticLockException extends RuntimeException {

  /** Constructor for OptimisticLockException. */
  public OptimisticLockException() {
    super();
  }

  /**
   * Constructor for OptimisticLockException.
   *
   * @param message the message.
   */
  public OptimisticLockException(String message) {
    super(message);
  }
}
