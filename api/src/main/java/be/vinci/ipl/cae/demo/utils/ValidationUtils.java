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
    
    // Handle different credential types appropriately
    if (credentials instanceof CredentialsRegister) {
      CredentialsRegister register = (CredentialsRegister) credentials;
      validateAddressFields(register);
    } else if (credentials instanceof CredentialsProducer) {
      CredentialsProducer producer = (CredentialsProducer) credentials;
      validateAddressFields(producer);
    }
  }

  // Helper method to validate address fields
  private static void validateAddressFields(Object credentials) {
    String street = null;
    String number = null;
    String postalCode = null;
    String city = null;
    String country = null;
    String phoneNumber = null;
    
    // Get values based on the actual type
    if (credentials instanceof CredentialsRegister) {
      CredentialsRegister register = (CredentialsRegister) credentials;
      street = register.getStreet();
      number = register.getNumber();
      postalCode = register.getPostalCode();
      city = register.getCity();
      country = register.getCountry();
      phoneNumber = register.getPhoneNumber();
    } else if (credentials instanceof CredentialsProducer) {
      CredentialsProducer producer = (CredentialsProducer) credentials;
      street = producer.getStreet();
      number = producer.getNumber();
      postalCode = producer.getPostalCode();
      city = producer.getCity();
      country = producer.getCountry();
      phoneNumber = producer.getPhoneNumber();
    }
    
    // Validate fields
    if (street == null || street.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Street is required");
    }
    if (number == null || number.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Street number is required");
    }
    if (postalCode == null || postalCode.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Postal code is required");
    }
    if (city == null || city.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "City is required");
    }
    if (country == null || country.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Country is required");
    }
    if (phoneNumber == null || phoneNumber.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number is required");
    }
  }

  private static void validateNameAndFirstname(Credentials credentials) {
    String name = null;
    String firstname = null;
    
    if (credentials instanceof CredentialsRegister) {
      CredentialsRegister register = (CredentialsRegister) credentials;
      name = register.getName();
      firstname = register.getFirstname();
    } else if (credentials instanceof CredentialsManager) {
      CredentialsManager manager = (CredentialsManager) credentials;
      name = manager.getName();
      firstname = manager.getFirstname();
    } else if (credentials instanceof CredentialsProducer) {
      CredentialsProducer producer = (CredentialsProducer) credentials;
      name = producer.getName();
      firstname = producer.getFirstname();
    }
    
    if (name == null || name.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
    }
    if (firstname == null || firstname.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Firstname is required");
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
