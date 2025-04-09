package be.vinci.ipl.cae.demo.exceptions;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;

/**
 * GlobalExceptionHandler to handle exceptions globally.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

  /**
   * Handle ResourceNotFoundException.
   *
   * @param ex      the exception.
   * @param request the request.
   * @return the response entity.
   */
  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException ex,
      WebRequest request) {

    if (ex.getMessage() == null) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    ErrorDetails errorDetails = new ErrorDetails(HttpStatus.NOT_FOUND.value(), ex.getMessage(),
        request.getDescription(false));

    return new ResponseEntity<>(errorDetails, HttpStatus.NOT_FOUND);
  }

  /**
   * Handle ResponseStatusException.
   *
   * @param ex      the exception.
   * @param request the request.
   * @return the response entity.
   */
  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<?> handleResponseStatusException(ResponseStatusException ex,
      WebRequest request) {

    if (ex.getReason() == null) {
      return new ResponseEntity<>(ex.getStatusCode());
    }

    ErrorDetails errorDetails = new ErrorDetails(ex.getStatusCode().value(), ex.getReason(),
        request.getDescription(false));
    return new ResponseEntity<>(errorDetails, ex.getStatusCode());
  }

  /**
   * Handle all other exceptions.
   *
   * @param ex      the exception.
   * @param request the request.
   * @return the response entity.
   */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> handleGlobalException(Exception ex, WebRequest request) {
    ErrorDetails errorDetails = new ErrorDetails(HttpStatus.INTERNAL_SERVER_ERROR.value(),
        ex.getMessage(), request.getDescription(false));
    return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
  }

}