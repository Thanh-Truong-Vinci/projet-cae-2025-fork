package be.vinci.ipl.cae.demo.exceptions;

/** PessimisticLockException to handle concurrency control violations. */
public class PessimisticLockException extends RuntimeException {

  /** Constructor for PessimisticLockException. */
  public PessimisticLockException() {
    super();
  }

  /**
   * Constructor for PessimisticLockException.
   *
   * @param message the message.
   */
  public PessimisticLockException(String message) {
    super(message);
  }
}
