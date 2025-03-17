package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.Credentials;
import be.vinci.ipl.cae.demo.models.dtos.CredentialsRegister;
import be.vinci.ipl.cae.demo.models.dtos.TokenRequest;
import be.vinci.ipl.cae.demo.services.ClientService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private ClientService clientService;

    @InjectMocks
    private AuthController authController;

    @Test
    void register_ValidCredentials_ReturnsAuthenticatedUser() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("User");
        credentials.setFirstname("Example");
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");
        credentials.setStreet("User Street");
        credentials.setNumber("1");
        credentials.setPostalCode("1000");
        credentials.setCity("User City");
        credentials.setCountry("User Country");
        credentials.setPhoneNumber("123456789");

        AuthenticatedUser authenticatedUser = new AuthenticatedUser();
        authenticatedUser.setEmail("user@example.com");
        authenticatedUser.setToken("token");

        when(clientService.register(anyString(), anyString(), anyString(), anyString(), anyString(), 
                                   anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(authenticatedUser);

        // Act
        AuthenticatedUser result = authController.register(credentials);

        // Assert
        assertNotNull(result);
        assertEquals("user@example.com", result.getEmail());
        assertEquals("token", result.getToken());
        
        verify(clientService).register(
            credentials.getName(),
            credentials.getFirstname(),
            credentials.getEmail(),
            credentials.getPassword(),
            credentials.getStreet(),
            credentials.getNumber(),
            credentials.getPostalCode(),
            credentials.getCity(),
            credentials.getCountry(),
            credentials.getPhoneNumber()
        );
    }

    @Test
    void register_NullCredentials_ThrowsBadRequest() {
        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(null));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Credentials cannot be null"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void register_MissingName_ThrowsBadRequest() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setFirstname("Example");
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");
        credentials.setStreet("User Street");
        credentials.setNumber("1");
        credentials.setPostalCode("1000");
        credentials.setCity("User City");
        credentials.setCountry("User Country");
        credentials.setPhoneNumber("123456789");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Name is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void register_EmailAlreadyInUse_ThrowsConflict() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("User");
        credentials.setFirstname("Example");
        credentials.setEmail("existing@example.com");
        credentials.setPassword("password");
        credentials.setStreet("User Street");
        credentials.setNumber("1");
        credentials.setPostalCode("1000");
        credentials.setCity("User City");
        credentials.setCountry("User Country");
        credentials.setPhoneNumber("123456789");

        when(clientService.register(anyString(), anyString(), anyString(), anyString(), anyString(), 
                                   anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(null);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Email is already in use"));
    }

    @Test
    void register_ServiceThrowsException_PropagatesException() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("User");
        credentials.setFirstname("Example");
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");
        credentials.setStreet("User Street");
        credentials.setNumber("1");
        credentials.setPostalCode("1000");
        credentials.setCity("User City");
        credentials.setCountry("User Country");
        credentials.setPhoneNumber("123456789");

        ResponseStatusException serviceException = 
            new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email format");
        when(clientService.register(anyString(), anyString(), anyString(), anyString(), anyString(), 
                                   anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenThrow(serviceException);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals(serviceException, exception);
    }

    @Test
    void login_ValidCredentials_ReturnsAuthenticatedUser() {
        // Arrange
        Credentials credentials = new Credentials();
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");

        AuthenticatedUser authenticatedUser = new AuthenticatedUser();
        authenticatedUser.setEmail("user@example.com");
        authenticatedUser.setToken("token");

        when(clientService.login("user@example.com", "password")).thenReturn(authenticatedUser);

        // Act
        AuthenticatedUser result = authController.login(credentials);

        // Assert
        assertNotNull(result);
        assertEquals("user@example.com", result.getEmail());
        assertEquals("token", result.getToken());
        
        verify(clientService).login("user@example.com", "password");
    }

    @Test
    void login_NullCredentials_ThrowsBadRequest() {
        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.login(null));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Credentials cannot be null"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void login_MissingEmail_ThrowsBadRequest() {
        // Arrange
        Credentials credentials = new Credentials();
        credentials.setPassword("password");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.login(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Email is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void login_MissingPassword_ThrowsBadRequest() {
        // Arrange
        Credentials credentials = new Credentials();
        credentials.setEmail("user@example.com");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.login(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Password is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void login_InvalidCredentials_ThrowsUnauthorized() {
        // Arrange
        Credentials credentials = new Credentials();
        credentials.setEmail("user@example.com");
        credentials.setPassword("wrongpassword");

        when(clientService.login("user@example.com", "wrongpassword")).thenReturn(null);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.login(credentials));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Invalid email or password"));
    }

    @Test
    void refreshToken_ValidToken_ReturnsAuthenticatedUser() {
        // Arrange
        TokenRequest request = new TokenRequest();
        request.setToken("validToken");

        AuthenticatedUser authenticatedUser = new AuthenticatedUser();
        authenticatedUser.setEmail("user@example.com");
        authenticatedUser.setToken("newToken");

        when(clientService.verifyJwtToken("validToken")).thenReturn("user@example.com");
        when(clientService.createJwtToken("user@example.com")).thenReturn(authenticatedUser);

        // Act
        AuthenticatedUser result = authController.refreshToken(request);

        // Assert
        assertNotNull(result);
        assertEquals("user@example.com", result.getEmail());
        assertEquals("newToken", result.getToken());
        
        verify(clientService).verifyJwtToken("validToken");
        verify(clientService).createJwtToken("user@example.com");
    }

    @Test
    void refreshToken_NullRequest_ThrowsBadRequest() {
        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.refreshToken(null));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Token is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void refreshToken_BlankToken_ThrowsBadRequest() {
        // Arrange
        TokenRequest request = new TokenRequest();
        request.setToken(" ");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.refreshToken(request));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Token is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void refreshToken_InvalidToken_ThrowsUnauthorized() {
        // Arrange
        TokenRequest request = new TokenRequest();
        request.setToken("invalidToken");

        when(clientService.verifyJwtToken("invalidToken")).thenReturn(null);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.refreshToken(request));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Invalid or expired token"));
        
        verify(clientService).verifyJwtToken("invalidToken");
        verifyNoMoreInteractions(clientService);
    }

    @Test
    void refreshToken_ServiceThrowsException_ThrowsInternalServerError() {
        // Arrange
        TokenRequest request = new TokenRequest();
        request.setToken("validToken");

        when(clientService.verifyJwtToken("validToken")).thenThrow(new RuntimeException("Unexpected error"));

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.refreshToken(request));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Token refresh failed"));
        
        verify(clientService).verifyJwtToken("validToken");
        verifyNoMoreInteractions(clientService);
    }

    @Test
    void register_MissingFirstname_ThrowsBadRequest() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("User");
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");
        credentials.setStreet("User Street");
        credentials.setNumber("1");
        credentials.setPostalCode("1000");
        credentials.setCity("User City");
        credentials.setCountry("User Country");
        credentials.setPhoneNumber("123456789");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Firstname is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void register_MissingEmail_ThrowsBadRequest() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("User");
        credentials.setFirstname("Example");
        credentials.setPassword("password");
        credentials.setStreet("User Street");
        credentials.setNumber("1");
        credentials.setPostalCode("1000");
        credentials.setCity("User City");
        credentials.setCountry("User Country");
        credentials.setPhoneNumber("123456789");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Email is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void register_MissingPassword_ThrowsBadRequest() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("User");
        credentials.setFirstname("Example");
        credentials.setEmail("user@example.com");
        credentials.setStreet("User Street");
        credentials.setNumber("1");
        credentials.setPostalCode("1000");
        credentials.setCity("User City");
        credentials.setCountry("User Country");
        credentials.setPhoneNumber("123456789");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Password is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void register_MissingStreet_ThrowsBadRequest() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("User");
        credentials.setFirstname("Example");
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");
        credentials.setNumber("1");
        credentials.setPostalCode("1000");
        credentials.setCity("User City");
        credentials.setCountry("User Country");
        credentials.setPhoneNumber("123456789");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Street is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void register_MissingNumber_ThrowsBadRequest() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("User");
        credentials.setFirstname("Example");
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");
        credentials.setStreet("User Street");
        credentials.setPostalCode("1000");
        credentials.setCity("User City");
        credentials.setCountry("User Country");
        credentials.setPhoneNumber("123456789");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Street number is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void register_MissingPostalCode_ThrowsBadRequest() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("User");
        credentials.setFirstname("Example");
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");
        credentials.setStreet("User Street");
        credentials.setNumber("1");
        credentials.setCity("User City");
        credentials.setCountry("User Country");
        credentials.setPhoneNumber("123456789");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Postal code is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void register_MissingCity_ThrowsBadRequest() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("User");
        credentials.setFirstname("Example");
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");
        credentials.setStreet("User Street");
        credentials.setNumber("1");
        credentials.setPostalCode("1000");
        credentials.setCountry("User Country");
        credentials.setPhoneNumber("123456789");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("City is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void register_MissingCountry_ThrowsBadRequest() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("User");
        credentials.setFirstname("Example");
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");
        credentials.setStreet("User Street");
        credentials.setNumber("1");
        credentials.setPostalCode("1000");
        credentials.setCity("User City");
        credentials.setPhoneNumber("123456789");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Country is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void register_GenericException_ThrowsInternalServerError() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("User");
        credentials.setFirstname("Example");
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");
        credentials.setStreet("User Street");
        credentials.setNumber("1");
        credentials.setPostalCode("1000");
        credentials.setCity("User City");
        credentials.setCountry("User Country");
        credentials.setPhoneNumber("123456789");

        when(clientService.register(anyString(), anyString(), anyString(), anyString(), anyString(), 
                                   anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenThrow(new RuntimeException("Database connection error"));

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Registration failed"));
    }
    
    @Test
    void login_GenericException_ThrowsInternalServerError() {
        // Arrange
        Credentials credentials = new Credentials();
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");

        when(clientService.login(anyString(), anyString()))
                .thenThrow(new RuntimeException("Database connection error"));

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.login(credentials));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Login failed"));
    }
    
    @Test
    void register_EmptyCredentialFields_ThrowsBadRequest() {
        // Arrange - Testing with empty strings instead of null
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("");
        credentials.setFirstname("Example");
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");
        credentials.setStreet("User Street");
        credentials.setNumber("1");
        credentials.setPostalCode("1000");
        credentials.setCity("User City");
        credentials.setCountry("User Country");
        credentials.setPhoneNumber("123456789");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Name is required"));
        
        verifyNoInteractions(clientService);
    }
    
    @Test
    void refreshToken_NullTokenInRequest_ThrowsBadRequest() {
        // Arrange
        TokenRequest request = new TokenRequest();
        // token is null by default

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.refreshToken(request));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Token is required"));
        
        verifyNoInteractions(clientService);
    }
    
    @Test
    void login_EmptyCredentialFields_ThrowsBadRequest() {
        // Arrange - Testing with empty strings instead of null
        Credentials credentials = new Credentials();
        credentials.setEmail("");
        credentials.setPassword("password");

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.login(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Email is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void register_MissingPhoneNumber_ThrowsBadRequest() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("User");
        credentials.setFirstname("Example");
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");
        credentials.setStreet("User Street");
        credentials.setNumber("1");
        credentials.setPostalCode("1000");
        credentials.setCity("User City");
        credentials.setCountry("User Country");
        // Phone number is missing

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Phone number is required"));
        
        verifyNoInteractions(clientService);
    }

    @Test
    void register_EmptyPhoneNumber_ThrowsBadRequest() {
        // Arrange
        CredentialsRegister credentials = new CredentialsRegister();
        credentials.setName("User");
        credentials.setFirstname("Example");
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");
        credentials.setStreet("User Street");
        credentials.setNumber("1");
        credentials.setPostalCode("1000");
        credentials.setCity("User City");
        credentials.setCountry("User Country");
        credentials.setPhoneNumber(""); // Empty phone number

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, 
            () -> authController.register(credentials));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Phone number is required"));
        
        verifyNoInteractions(clientService);
    }
}