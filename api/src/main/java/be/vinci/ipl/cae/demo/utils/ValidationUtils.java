package be.vinci.ipl.cae.demo.utils;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Utility class for common validation methods.
 */
public final class ValidationUtils {

  /**
   * Private constructor to prevent instantiation.
   */
  private ValidationUtils() {
    // Utility class should not be instantiated
  }

  /**
   * Validates that an email is not null or blank.
   *
   * @param email the email to validate
   * @throws ResponseStatusException if email is null or blank
   */
  public static void validateEmail(String email) {
    if (email == null || email.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
    }
  }

  /**
   * Validates that a password is not null or blank.
   *
   * @param password the password to validate
   * @throws ResponseStatusException if password is null or blank
   */
  public static void validatePassword(String password) {
    if (password == null || password.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
    }
  }

  /**
   * Validates both email and password in one call.
   *
   * @param email the email to validate
   * @param password the password to validate
   * @throws ResponseStatusException if email or password is invalid
   */
  public static void validateCredentials(String email, String password) {
    validateEmail(email);
    validatePassword(password);
  }
}