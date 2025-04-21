
package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.models.entities.Manager;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.ClientRepository;
import be.vinci.ipl.cae.demo.repositories.ManagerRepository;
import be.vinci.ipl.cae.demo.repositories.ProducerRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import be.vinci.ipl.cae.demo.services.AuthsService.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class AuthsServiceTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private ClientRepository clientRepository;
    
    @Mock
    private ProducerRepository producerRepository;
    
    @Mock
    private ManagerRepository managerRepository;
    
    @Mock
    private BCryptPasswordEncoder passwordEncoder;
    
    @InjectMocks
    private AuthsService authsService;
    
    private User mockUser;
    private Client mockClient;
    private Producer mockProducer;
    private Manager mockManager;
    
    @BeforeEach
    public void setUp() {
        // Replace existing stubbing lines like:
        // when(repository.findByX()).thenReturn(y);
        
        // With lenient versions:
        // lenient().when(repository.findByX()).thenReturn(y);
        
        // For example:
        lenient().when(userRepository.findByEmail("admin@example.com")).thenReturn(mockUser);

        // C'est la bonne approche pour une classe abstraite
        mockUser = mock(User.class);
        when(mockUser.getEmail()).thenReturn("test@example.com");
        when(mockUser.getPassword()).thenReturn("hashedPassword");
        when(mockUser.getName()).thenReturn("Test");
        when(mockUser.getFirstname()).thenReturn("User");
        
        // Les autres initialisations peuvent rester avec new car ces classes sont concrètes
        mockClient = new Client();
        mockClient.setEmail("client@example.com");
        mockClient.setPassword("hashedPassword");
        mockClient.setName("Client");
        mockClient.setFirstname("User");
        
        mockProducer = new Producer();
        mockProducer.setEmail("producer@example.com");
        mockProducer.setPassword("hashedPassword");
        mockProducer.setName("Producer");
        mockProducer.setFirstname("User");
        
        mockManager = new Manager();
        mockManager.setEmail("manager@example.com");
        mockManager.setPassword("hashedPassword");
        mockManager.setName("Manager");
        mockManager.setFirstname("User");
    }
    
    @Test
    void createJwtToken_NullEmail_ReturnsNull() {
        // Act
        String token = authsService.createJwtToken(null);
        
        // Assert
        assertNull(token);
    }
    
    @Test
    void createJwtToken_BlankEmail_ReturnsNull() {
        // Act
        String token = authsService.createJwtToken("  ");
        
        // Assert
        assertNull(token);
    }
    
    @Test
    void verifyJwtToken_NullToken_ReturnsNull() {
        // Act
        String result = authsService.verifyJwtToken(null);
        
        // Assert
        assertNull(result);
    }
    
    @Test
    void verifyJwtToken_BlankToken_ReturnsNull() {
        // Act
        String result = authsService.verifyJwtToken("  ");
        
        // Assert
        assertNull(result);
    }
    
    @Test
    void verifyJwtToken_InvalidToken_ReturnsNull() {
        // Act
        String result = authsService.verifyJwtToken("invalid.token.format");
        
        // Assert
        assertNull(result);
    }
    
    @Test
    void isValidClientToken_ValidTokenAndClientExists_ReturnsClient() {
        // Arrange
        String email = "client@example.com";
        String token = authsService.createJwtToken(email);
        
        when(clientRepository.findByEmail(email)).thenReturn(mockClient);
        
        // Act
        Client result = authsService.isValidClientToken(token);
        
        // Assert
        assertNotNull(result);
        assertEquals(email, result.getEmail());
        verify(clientRepository).findByEmail(email);
    }
    
    @Test
    void isValidClientToken_ValidTokenButClientDoesNotExist_ReturnsNull() {
        // Arrange
        String email = "nonexistent@example.com";
        String token = authsService.createJwtToken(email);
        
        when(clientRepository.findByEmail(email)).thenReturn(null);
        
        // Act
        Client result = authsService.isValidClientToken(token);
        
        // Assert
        assertNull(result);
        verify(clientRepository).findByEmail(email);
    }
    
    @Test
    void isValidClientToken_InvalidToken_ReturnsNull() {
        // Act
        Client result = authsService.isValidClientToken("invalid.token");
        
        // Assert
        assertNull(result);
        verify(clientRepository, never()).findByEmail(anyString());
    }
    
    @Test
    void isValidProducerToken_ValidTokenAndProducerExists_ReturnsProducer() {
        // Arrange
        String email = "producer@example.com";
        String token = authsService.createJwtToken(email);
        
        when(producerRepository.findByEmail(email)).thenReturn(mockProducer);
        
        // Act
        Producer result = authsService.isValidProducerToken(token);
        
        // Assert
        assertNotNull(result);
        assertEquals(email, result.getEmail());
        verify(producerRepository).findByEmail(email);
    }
    
    @Test
    void isValidProducerToken_ValidTokenButProducerDoesNotExist_ReturnsNull() {
        // Arrange
        String email = "nonexistent@example.com";
        String token = authsService.createJwtToken(email);
        
        when(producerRepository.findByEmail(email)).thenReturn(null);
        
        // Act
        Producer result = authsService.isValidProducerToken(token);
        
        // Assert
        assertNull(result);
        verify(producerRepository).findByEmail(email);
    }
    
    @Test
    void isValidProducerToken_InvalidToken_ReturnsNull() {
        // Act
        Producer result = authsService.isValidProducerToken("invalid.token");
        
        // Assert
        assertNull(result);
        verify(producerRepository, never()).findByEmail(anyString());
    }
    
    @Test
    void isValidManagerToken_ValidTokenAndManagerExists_ReturnsManager() {
        // Arrange
        String email = "manager@example.com";
        String token = authsService.createJwtToken(email);
        
        when(managerRepository.findByEmail(email)).thenReturn(mockManager);
        
        // Act
        Manager result = authsService.isValidManagerToken(token);
        
        // Assert
        assertNotNull(result);
        assertEquals(email, result.getEmail());
        verify(managerRepository).findByEmail(email);
    }
    
    @Test
    void isValidManagerToken_ValidTokenButManagerDoesNotExist_ReturnsNull() {
        // Arrange
        String email = "nonexistent@example.com";
        String token = authsService.createJwtToken(email);
        
        when(managerRepository.findByEmail(email)).thenReturn(null);
        
        // Act
        Manager result = authsService.isValidManagerToken(token);
        
        // Assert
        assertNull(result);
        verify(managerRepository).findByEmail(email);
    }
    
    @Test
    void isValidManagerToken_InvalidToken_ReturnsNull() {
        // Act
        Manager result = authsService.isValidManagerToken("invalid.token");
        
        // Assert
        assertNull(result);
        verify(managerRepository, never()).findByEmail(anyString());
    }
    
    @Test
    void determineUserRole_ClientEmail_ReturnsClientRole() {
        // Arrange
        String email = "client@example.com";
        when(clientRepository.findByEmail(email)).thenReturn(mockClient);
        
        // Act
        String result = authsService.determineUserRole(email);
        
        // Assert
        assertEquals("Client", result);
    }
    
    @Test
    void determineUserRole_ProducerEmail_ReturnsProducerRole() {
        // Arrange
        String email = "producer@example.com";
        when(clientRepository.findByEmail(email)).thenReturn(null);
        when(managerRepository.findByEmail(email)).thenReturn(null);
        when(producerRepository.findByEmail(email)).thenReturn(mockProducer);
        
        // Act
        String result = authsService.determineUserRole(email);
        
        // Assert
        assertEquals("Producer", result);
    }
    
    @Test
    void determineUserRole_ManagerEmail_ReturnsManagerRole() {
        // Arrange
        String email = "manager@example.com";
        when(clientRepository.findByEmail(email)).thenReturn(null);
        when(managerRepository.findByEmail(email)).thenReturn(mockManager);
        
        // Act
        String result = authsService.determineUserRole(email);
        
        // Assert
        assertEquals("Manager", result);
    }
    
    @Test
    void determineUserRole_VolunteerEmail_ReturnsVolunteerRole() {
        // Arrange
        String email = "volunteer@example.com";
        
        // Act
        String result = authsService.determineUserRole(email);
        
        // Assert
        assertEquals("Volunteer", result);
    }
    
    @Test
    void determineUserRole_AdminEmail_ReturnsAdminRole() {
        // Arrange
        String email = "admin@admin.com";
        when(clientRepository.findByEmail(email)).thenReturn(null);
        when(managerRepository.findByEmail(email)).thenReturn(null);
        when(producerRepository.findByEmail(email)).thenReturn(null);
        
        // Act
        String result = authsService.determineUserRole(email);
        
        // Assert
        assertEquals("Admin", result);
    }
    
    @Test
    void determineUserRole_UnknownEmail_ReturnsUnknownRole() {
        // Arrange
        String email = "unknown@example.com";
        when(clientRepository.findByEmail(email)).thenReturn(null);
        when(managerRepository.findByEmail(email)).thenReturn(null);
        when(producerRepository.findByEmail(email)).thenReturn(null);
        
        // Act
        String result = authsService.determineUserRole(email);
        
        // Assert
        assertEquals("Unknown", result);
    }
    
    @Test
    void determineUserRoleEnum_ClientEmail_ReturnsClientRole() {
        // Arrange
        String email = "client@example.com";
        when(clientRepository.findByEmail(email)).thenReturn(mockClient);
        
        // Act
        Role result = authsService.determineUserRoleEnum(email);
        
        // Assert
        assertEquals(Role.CLIENT, result);
    }
    
    @Test
    void login_NonexistentUser_ReturnsNull() {
        // Arrange
        String email = "nonexistent@example.com";
        String password = "password";
        
        when(userRepository.findByEmail(email)).thenReturn(null);
        
        // Act
        AuthenticatedUser result = authsService.login(email, password);
        
        // Assert
        assertNull(result);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }
    
    @Test
    void login_InvalidPassword_ReturnsNull() {
        // Arrange
        String email = "test@example.com";
        String password = "wrongpassword";
        
        when(userRepository.findByEmail(email)).thenReturn(mockUser);
        when(passwordEncoder.matches(password, mockUser.getPassword())).thenReturn(false);
        
        // Act
        AuthenticatedUser result = authsService.login(email, password);
        
        // Assert
        assertNull(result);
        verify(passwordEncoder).matches(password, mockUser.getPassword());
    }

    @Test
    void login_ValidCredentials_ReturnsFullAuthenticatedUser() {
        // Arrange
        String email = "test@example.com";
        String password = "correctpassword";
        
        when(userRepository.findByEmail(email)).thenReturn(mockUser);
        when(passwordEncoder.matches(password, mockUser.getPassword())).thenReturn(true);
        when(clientRepository.findByEmail(email)).thenReturn(mockClient);
        
        // Act
        AuthenticatedUser result = authsService.login(email, password);
        
        // Assert
        assertNotNull(result);
        assertEquals(email, result.getEmail());
        assertEquals(mockUser.getName(), result.getName());
        assertEquals(mockUser.getFirstname(), result.getFirstname());
        assertNotNull(result.getToken());
        assertEquals("Client", result.getRole());
    }
    
    @Test
    void securityConstants_HasCorrectValues() {
        // Assert
        assertEquals("hasRole('ROLE_CLIENT')", AuthsService.SecurityConstants.HAS_ROLE_CLIENT);
        assertEquals("hasRole('ROLE_MANAGER')", AuthsService.SecurityConstants.HAS_ROLE_MANAGER);
        assertEquals("hasRole('ROLE_PRODUCER')", AuthsService.SecurityConstants.HAS_ROLE_PRODUCER);
        assertEquals("hasRole('ROLE_VOLUNTEER')", AuthsService.SecurityConstants.HAS_ROLE_VOLUNTEER);
        assertEquals("hasRole('ROLE_ADMIN')", AuthsService.SecurityConstants.HAS_ROLE_ADMIN);
    }
    
    @Test
    void determineUserRole_VolunteerEmail_ReturnsVolunteerRole_Optimized() {
        // Arrange
        String email = "volunteer@example.com";
        
        // Act
        String result = authsService.determineUserRole(email);
        
        // Assert
        assertEquals("Volunteer", result);
    }

    @Test
    void roleEnum_GetAuthority_ReturnsCorrectFormat() {
        // Test pour chaque valeur de l'enum
        assertEquals("ROLE_CLIENT", AuthsService.Role.CLIENT.getAuthority());
        assertEquals("ROLE_PRODUCER", AuthsService.Role.PRODUCER.getAuthority());
        assertEquals("ROLE_MANAGER", AuthsService.Role.MANAGER.getAuthority());
        assertEquals("ROLE_ADMIN", AuthsService.Role.ADMIN.getAuthority());
        assertEquals("ROLE_VOLUNTEER", AuthsService.Role.VOLUNTEER.getAuthority());
    }

    @Test
    void roleEnum_GetDisplayName_ReturnsCorrectValue() {
        // Test pour vérifier que getDisplayName() fonctionne
        assertEquals("Client", AuthsService.Role.CLIENT.getDisplayName());
        assertEquals("Producer", AuthsService.Role.PRODUCER.getDisplayName());
        assertEquals("Manager", AuthsService.Role.MANAGER.getDisplayName());
        assertEquals("Admin", AuthsService.Role.ADMIN.getDisplayName());
        assertEquals("Volunteer", AuthsService.Role.VOLUNTEER.getDisplayName());
    }
}

