package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.repositories.ClientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ClientServiceTest {

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private ClientService clientService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_ValidData_ReturnsAuthenticatedUser() {
        String email = "user@example.com";
        String password = "password";
        String hashedPassword = "hashedPassword";

        when(clientRepository.findByEmail(email)).thenReturn(null);
        when(passwordEncoder.encode(password)).thenReturn(hashedPassword);

        AuthenticatedUser result = clientService.register("User", "Example", email, password, "User Street", "1", "1000", "User City", "User Country", "123456789");

        assertNotNull(result);
        assertEquals(email, result.getEmail());
        verify(clientRepository, times(1)).save(any(Client.class));
    }

    @Test
    void register_ExistingEmail_ReturnsNull() {
        String email = "user@example.com";

        when(clientRepository.findByEmail(email)).thenReturn(new Client());

        AuthenticatedUser result = clientService.register("User", "Example", email, "password", "User Street", "1", "1000", "User City", "User Country", "123456789");

        assertNull(result);
        verify(clientRepository, never()).save(any(Client.class));
    }

    @Test
    void login_ValidCredentials_ReturnsAuthenticatedUser() {
        String email = "user@example.com";
        String password = "password";
        String hashedPassword = "hashedPassword";

        Client client = new Client();
        client.setEmail(email);
        client.setPassword(hashedPassword);

        when(clientRepository.findByEmail(email)).thenReturn(client);
        when(passwordEncoder.matches(password, hashedPassword)).thenReturn(true);

        AuthenticatedUser result = clientService.login(email, password);

        assertNotNull(result);
        assertEquals(email, result.getEmail());
    }

    @Test
    void login_InvalidCredentials_ReturnsNull() {
        String email = "user@example.com";
        String password = "password";

        when(clientRepository.findByEmail(email)).thenReturn(null);

        AuthenticatedUser result = clientService.login(email, password);

        assertNull(result);
    }

    @Test
    void createJwtToken_ValidEmail_ReturnsAuthenticatedUser() {
        String email = "user@example.com";

        AuthenticatedUser result = clientService.createJwtToken(email);

        assertNotNull(result);
        assertEquals(email, result.getEmail());
        assertNotNull(result.getToken());
    }

    @Test
    void verifyJwtToken_ValidToken_ReturnsEmail() {
        String email = "user@example.com";
        String token = clientService.createJwtToken(email).getToken();

        String result = clientService.verifyJwtToken(token);

        assertEquals(email, result);
    }

    @Test
    void verifyJwtToken_InvalidToken_ReturnsNull() {
        String token = "invalidToken";

        String result = clientService.verifyJwtToken(token);

        assertNull(result);
    }
}