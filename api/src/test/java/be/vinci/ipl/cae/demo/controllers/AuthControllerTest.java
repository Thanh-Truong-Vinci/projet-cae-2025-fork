package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.Credentials;
import be.vinci.ipl.cae.demo.models.dtos.CredentialsRegister;
import be.vinci.ipl.cae.demo.models.dtos.TokenRequest;
import be.vinci.ipl.cae.demo.services.ClientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    @Mock
    private ClientService clientService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_ValidCredentials_ReturnsAuthenticatedUser() {
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

        when(clientService.register(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(authenticatedUser);

        AuthenticatedUser result = authController.register(credentials);

        assertNotNull(result);
        assertEquals("user@example.com", result.getEmail());
        assertEquals("token", result.getToken());
    }

    @Test
    void register_InvalidCredentials_ThrowsBadRequest() {
        CredentialsRegister credentials = new CredentialsRegister();

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            authController.register(credentials);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void login_ValidCredentials_ReturnsAuthenticatedUser() {
        Credentials credentials = new Credentials();
        credentials.setEmail("user@example.com");
        credentials.setPassword("password");

        AuthenticatedUser authenticatedUser = new AuthenticatedUser();
        authenticatedUser.setEmail("user@example.com");
        authenticatedUser.setToken("token");

        when(clientService.login(anyString(), anyString())).thenReturn(authenticatedUser);

        AuthenticatedUser result = authController.login(credentials);

        assertNotNull(result);
        assertEquals("user@example.com", result.getEmail());
        assertEquals("token", result.getToken());
    }

    @Test
    void login_InvalidCredentials_ThrowsUnauthorized() {
        Credentials credentials = new Credentials();
        credentials.setEmail("user@example.com");
        credentials.setPassword("wrongpassword");

        when(clientService.login(anyString(), anyString())).thenReturn(null);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            authController.login(credentials);
        });

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    void refreshToken_ValidToken_ReturnsAuthenticatedUser() {
        TokenRequest request = new TokenRequest();
        request.setToken("validToken");

        AuthenticatedUser authenticatedUser = new AuthenticatedUser();
        authenticatedUser.setEmail("user@example.com");
        authenticatedUser.setToken("newToken");

        when(clientService.verifyJwtToken(anyString())).thenReturn("user@example.com");
        when(clientService.createJwtToken(anyString())).thenReturn(authenticatedUser);

        AuthenticatedUser result = authController.refreshToken(request);

        assertNotNull(result);
        assertEquals("user@example.com", result.getEmail());
        assertEquals("newToken", result.getToken());
    }

    @Test
    void refreshToken_InvalidToken_ThrowsUnauthorized() {
        TokenRequest request = new TokenRequest();
        request.setToken("invalidToken");

        when(clientService.verifyJwtToken(anyString())).thenReturn(null);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            authController.refreshToken(request);
        });

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }
}