package be.vinci.ipl.cae.demo.utils;

import be.vinci.ipl.cae.demo.models.dtos.Credentials;
import be.vinci.ipl.cae.demo.models.dtos.CredentialsManager;
import be.vinci.ipl.cae.demo.models.dtos.CredentialsProducer;
import be.vinci.ipl.cae.demo.models.dtos.CredentialsRegister;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Utility class for validating credentials. */
public final class ValidationUtils {

  private ValidationUtils() {
    throw new UnsupportedOperationException("Utility class");
  }

  private static void validateCommonFields(Credentials credentials) {
    if (credentials == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Credentials cannot be null");
    }
    if (credentials instanceof CredentialsRegister || credentials instanceof CredentialsProducer) {
      if (((CredentialsRegister) credentials).getStreet() == null
          || ((CredentialsRegister) credentials).getStreet().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Street is required");
      }
      if (((CredentialsRegister) credentials).getNumber() == null
          || ((CredentialsRegister) credentials).getNumber().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Street number is required");
      }
      if (((CredentialsRegister) credentials).getPostalCode() == null
          || ((CredentialsRegister) credentials).getPostalCode().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Postal code is required");
      }
      if (((CredentialsRegister) credentials).getCity() == null
          || ((CredentialsRegister) credentials).getCity().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "City is required");
      }
      if (((CredentialsRegister) credentials).getCountry() == null
          || ((CredentialsRegister) credentials).getCountry().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Country is required");
      }
      if (((CredentialsRegister) credentials).getPhoneNumber() == null
          || ((CredentialsRegister) credentials).getPhoneNumber().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number is required");
      }
    }
  }

  private static void validateNameAndFirstname(Credentials credentials) {
    if (credentials instanceof CredentialsRegister
        || credentials instanceof CredentialsManager
        || credentials instanceof CredentialsProducer) {
      if (((CredentialsRegister) credentials).getName() == null
          || ((CredentialsRegister) credentials).getName().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
      }
      if (((CredentialsRegister) credentials).getFirstname() == null
          || ((CredentialsRegister) credentials).getFirstname().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Firstname is required");
      }
    }
  }

  private static void validateEmailAndPassword(Credentials credentials) {
    if (credentials.getEmail() == null || credentials.getEmail().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
    }
    if (credentials.getPassword() == null || credentials.getPassword().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
    }
  }

  /**
   * Validates the given CredentialsRegister object.
   *
   * @param credentials the credentials to validate
   * @throws ResponseStatusException if validation fails
   */
  public static void validateCredentialsRegister(CredentialsRegister credentials) {
    validateCommonFields(credentials);
    validateNameAndFirstname(credentials);
  }

  /**
   * Validates the given Credentials object for login.
   *
   * @param credentials the credentials to validate
   * @throws ResponseStatusException if validation fails
   */
  public static void validateCredentialsLogin(Credentials credentials) {
    if (credentials == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Credentials cannot be null");
    }
    validateEmailAndPassword(credentials);
  }

  /**
   * Validates the given CredentialsManager object.
   *
   * @param credentials the credentials to validate
   * @throws ResponseStatusException if validation fails
   */
  public static void validateCredentialsManager(CredentialsManager credentials) {
    validateCommonFields(credentials);
    validateNameAndFirstname(credentials);
    validateEmailAndPassword(credentials);
  }

  /**
   * Validates the given CredentialsProducer object.
   *
   * @param credentials the credentials to validate
   * @throws ResponseStatusException if validation fails
   */
  public static void validateCredentialsProducer(CredentialsProducer credentials) {
    validateCommonFields(credentials);
    validateNameAndFirstname(credentials);
    if (credentials.getCompany() == null || credentials.getCompany().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Company is required");
    }
    validateEmailAndPassword(credentials);
  }
}
