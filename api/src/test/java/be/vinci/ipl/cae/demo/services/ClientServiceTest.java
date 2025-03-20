/*
 * package be.vinci.ipl.cae.demo.services;
 * 
 * import static org.junit.jupiter.api.Assertions.*;
 * import static org.mockito.Mockito.*;
 * 
 * import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
 * import be.vinci.ipl.cae.demo.models.entities.Client;
 * import be.vinci.ipl.cae.demo.repositories.ClientRepository;
 * import com.auth0.jwt.JWT;
 * import com.auth0.jwt.algorithms.Algorithm;
 * import com.auth0.jwt.exceptions.JWTCreationException;
 * import java.time.LocalDate;
 * import org.junit.jupiter.api.Test;
 * import org.junit.jupiter.api.extension.ExtendWith;
 * import org.mockito.ArgumentCaptor;
 * import org.mockito.InjectMocks;
 * import org.mockito.Mock;
 * import org.mockito.MockedStatic;
 * import org.mockito.junit.jupiter.MockitoExtension;
 * import org.springframework.http.HttpStatus;
 * import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
 * import org.springframework.web.server.ResponseStatusException;
 * 
 * @ExtendWith(MockitoExtension.class)
 * class ClientServiceTest {
 * 
 * @Mock
 * private BCryptPasswordEncoder passwordEncoder;
 * 
 * @Mock
 * private ClientRepository clientRepository;
 * 
 * @InjectMocks
 * private ClientService clientService;
 * 
 * @Test
 * void createJwtToken_ValidEmail_ReturnsAuthenticatedUser() {
 * // Arrange
 * String email = "user@example.com";
 * 
 * // Act
 * AuthenticatedUser result = clientService.createJwtToken(email);
 * 
 * // Assert
 * assertNotNull(result);
 * assertEquals(email, result.getEmail());
 * assertNotNull(result.getToken());
 * assertTrue(result.getToken().length() > 0);
 * }
 * 
 * @Test
 * void createJwtToken_NullEmail_ThrowsException() {
 * // Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class,
 * () -> clientService.createJwtToken(null));
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * }
 * 
 * @Test
 * void createJwtToken_BlankEmail_ThrowsException() {
 * // Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class,
 * () -> clientService.createJwtToken("  "));
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * }
 * 
 * @Test
 * void verifyJwtToken_ValidToken_ReturnsEmail() {
 * // Arrange
 * String email = "user@example.com";
 * String token = clientService.createJwtToken(email).getToken();
 * 
 * // Act
 * String result = clientService.verifyJwtToken(token);
 * 
 * // Assert
 * assertEquals(email, result);
 * }
 * 
 * @Test
 * void verifyJwtToken_NullToken_ReturnsNull() {
 * // Act
 * String result = clientService.verifyJwtToken(null);
 * 
 * // Assert
 * assertNull(result);
 * }
 * 
 * @Test
 * void verifyJwtToken_BlankToken_ReturnsNull() {
 * // Act
 * String result = clientService.verifyJwtToken(" ");
 * 
 * // Assert
 * assertNull(result);
 * }
 * 
 * @Test
 * void verifyJwtToken_InvalidToken_ReturnsNull() {
 * // Act
 * String result = clientService.verifyJwtToken("invalidToken");
 * 
 * // Assert
 * assertNull(result);
 * }
 * 
 * @Test
 * void login_ValidCredentials_ReturnsAuthenticatedUser() {
 * // Arrange
 * String email = "user@example.com";
 * String password = "password";
 * String hashedPassword = "hashedPassword";
 * 
 * Client client = new Client();
 * client.setEmail(email);
 * client.setPassword(hashedPassword);
 * 
 * when(clientRepository.findByEmail(email)).thenReturn(client);
 * when(passwordEncoder.matches(password, hashedPassword)).thenReturn(true);
 * 
 * // Act
 * AuthenticatedUser result = clientService.login(email, password);
 * 
 * // Assert
 * assertNotNull(result);
 * assertEquals(email, result.getEmail());
 * assertNotNull(result.getToken());
 * }
 * 
 * @Test
 * void login_NullEmail_ReturnsNull() {
 * // Act
 * AuthenticatedUser result = clientService.login(null, "password");
 * 
 * // Assert
 * assertNull(result);
 * verify(clientRepository, never()).findByEmail(any());
 * }
 * 
 * @Test
 * void login_NullPassword_ReturnsNull() {
 * // Act
 * AuthenticatedUser result = clientService.login("user@example.com", null);
 * 
 * // Assert
 * assertNull(result);
 * verify(clientRepository, never()).findByEmail(any());
 * }
 * 
 * @Test
 * void login_UserNotFound_ReturnsNull() {
 * // Arrange
 * String email = "nonexistent@example.com";
 * when(clientRepository.findByEmail(email)).thenReturn(null);
 * 
 * // Act
 * AuthenticatedUser result = clientService.login(email, "password");
 * 
 * // Assert
 * assertNull(result);
 * verify(passwordEncoder, never()).matches(any(), any());
 * }
 * 
 * @Test
 * void login_IncorrectPassword_ReturnsNull() {
 * // Arrange
 * String email = "user@example.com";
 * String password = "wrongpassword";
 * String hashedPassword = "hashedPassword";
 * 
 * Client client = new Client();
 * client.setEmail(email);
 * client.setPassword(hashedPassword);
 * 
 * when(clientRepository.findByEmail(email)).thenReturn(client);
 * when(passwordEncoder.matches(password, hashedPassword)).thenReturn(false);
 * 
 * // Act
 * AuthenticatedUser result = clientService.login(email, password);
 * 
 * // Assert
 * assertNull(result);
 * }
 * 
 * @Test
 * void register_ValidData_ReturnsAuthenticatedUser() {
 * // Arrange
 * String email = "user@example.com";
 * String password = "Password123";
 * String hashedPassword = "hashedPassword";
 * 
 * when(clientRepository.findByEmail(email)).thenReturn(null);
 * when(passwordEncoder.encode(password)).thenReturn(hashedPassword);
 * 
 * // Act
 * AuthenticatedUser result = clientService.register(
 * "User", "Example", email, password,
 * "User Street", "1", "1000",
 * "User City", "User Country", "123456789"
 * );
 * 
 * // Assert
 * assertNotNull(result);
 * assertEquals(email, result.getEmail());
 * assertNotNull(result.getToken());
 * 
 * ArgumentCaptor<Client> clientCaptor = ArgumentCaptor.forClass(Client.class);
 * verify(clientRepository).save(clientCaptor.capture());
 * 
 * Client savedClient = clientCaptor.getValue();
 * assertEquals("User", savedClient.getName());
 * assertEquals("Example", savedClient.getFirstname());
 * assertEquals(email, savedClient.getEmail());
 * assertEquals(hashedPassword, savedClient.getPassword());
 * assertEquals("User Street", savedClient.getStreet());
 * assertEquals("1", savedClient.getNumber());
 * assertEquals("1000", savedClient.getPostalCode());
 * assertEquals("User City", savedClient.getCity());
 * assertEquals("User Country", savedClient.getCountry());
 * assertEquals("123456789", savedClient.getPhoneNumber());
 * assertNotNull(savedClient.getDateInscription());
 * }
 * 
 * @Test
 * void register_EmailAlreadyExists_ReturnsNull() {
 * // Arrange
 * String email = "existing@example.com";
 * 
 * when(clientRepository.findByEmail(email)).thenReturn(new Client());
 * 
 * // Act
 * AuthenticatedUser result = clientService.register(
 * "User", "Example", email, "Password123",
 * "User Street", "1", "1000",
 * "User City", "User Country", "123456789"
 * );
 * 
 * // Assert
 * assertNull(result);
 * verify(clientRepository, never()).save(any(Client.class));
 * }
 * 
 * @Test
 * void register_NullName_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * null, "Example", "user@example.com", "Password123",
 * "User Street", "1", "1000",
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Name is required"));
 * }
 * 
 * @Test
 * void register_BlankName_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * " ", "Example", "user@example.com", "Password123",
 * "User Street", "1", "1000",
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Name is required"));
 * }
 * 
 * @Test
 * void register_InvalidEmail_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "invalid-email", "Password123",
 * "User Street", "1", "1000",
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Invalid email format"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_MissingFirstname_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", null, "user@example.com", "Password123",
 * "User Street", "1", "1000",
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Firstname is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_BlankFirstname_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", " ", "user@example.com", "Password123",
 * "User Street", "1", "1000",
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Firstname is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_NullEmail_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", null, "Password123",
 * "User Street", "1", "1000",
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Email is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_BlankEmail_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", " ", "Password123",
 * "User Street", "1", "1000",
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Email is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_NullPassword_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "user@example.com", null,
 * "User Street", "1", "1000",
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Password is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_BlankPassword_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "user@example.com", " ",
 * "User Street", "1", "1000",
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Password is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_NullStreet_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "user@example.com", "Password123",
 * null, "1", "1000",
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Street is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_BlankStreet_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "user@example.com", "Password123",
 * " ", "1", "1000",
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Street is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_NullNumber_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "user@example.com", "Password123",
 * "User Street", null, "1000",
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Number is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_BlankNumber_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "user@example.com", "Password123",
 * "User Street", " ", "1000",
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Number is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_NullPostalCode_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "user@example.com", "Password123",
 * "User Street", "1", null,
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Postal code is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_BlankPostalCode_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "user@example.com", "Password123",
 * "User Street", "1", " ",
 * "User City", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Postal code is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_NullCity_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "user@example.com", "Password123",
 * "User Street", "1", "1000",
 * null, "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("City is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_BlankCity_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "user@example.com", "Password123",
 * "User Street", "1", "1000",
 * " ", "User Country", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("City is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_NullCountry_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "user@example.com", "Password123",
 * "User Street", "1", "1000",
 * "User City", null, "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Country is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_BlankCountry_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "user@example.com", "Password123",
 * "User Street", "1", "1000",
 * "User City", " ", "123456789"
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Country is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_NullPhoneNumber_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "user@example.com", "Password123",
 * "User Street", "1", "1000",
 * "User City", "User Country", null
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Phone number is required"));
 * }
 * 
 * @Test
 * void validateRegistrationFields_BlankPhoneNumber_ThrowsException() {
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class, () ->
 * clientService.register(
 * "User", "Example", "user@example.com", "Password123",
 * "User Street", "1", "1000",
 * "User City", "User Country", " "
 * )
 * );
 * 
 * assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Phone number is required"));
 * }
 * 
 * @Test
 * void createJwtToken_WhenTokenCreationFails_ThrowsException() {
 * // In this test, we need to simulate a failure in JWT token creation
 * try (MockedStatic<JWT> mockedJWT = mockStatic(JWT.class)) {
 * // Arrange
 * mockedJWT.when(() -> JWT.create())
 * .thenThrow(new JWTCreationException("Failed to create JWT", new
 * Exception()));
 * 
 * // Act & Assert
 * ResponseStatusException exception =
 * assertThrows(ResponseStatusException.class,
 * () -> clientService.createJwtToken("user@example.com"));
 * 
 * assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
 * assertTrue(exception.getReason().contains("Token generation failed"));
 * }
 * }
 * 
 * @Test
 * void readOneFromEmail_ValidEmail_ReturnsClient() {
 * // Arrange
 * String email = "user@example.com";
 * Client client = new Client();
 * client.setEmail(email);
 * 
 * when(clientRepository.findByEmail(email)).thenReturn(client);
 * 
 * // Act
 * Client result = clientService.readOneFromEmail(email);
 * 
 * // Assert
 * assertNotNull(result);
 * assertEquals(email, result.getEmail());
 * }
 * 
 * @Test
 * void readOneFromEmail_NullEmail_ReturnsNull() {
 * // Act
 * Client result = clientService.readOneFromEmail(null);
 * 
 * // Assert
 * assertNull(result);
 * verify(clientRepository, never()).findByEmail(any());
 * }
 * 
 * @Test
 * void readOneFromEmail_BlankEmail_ReturnsNull() {
 * // Act
 * Client result = clientService.readOneFromEmail(" ");
 * 
 * // Assert
 * assertNull(result);
 * verify(clientRepository, never()).findByEmail(any());
 * }
 * 
 * @Test
 * void createOne_ValidData_CreatesClient() {
 * // Arrange
 * String email = "user@example.com";
 * String password = "password";
 * String hashedPassword = "hashedPassword";
 * 
 * when(passwordEncoder.encode(password)).thenReturn(hashedPassword);
 * 
 * // Act
 * clientService.createOne(
 * "User", "Example", email, password,
 * "User Street", "1", "1000",
 * "User City", "User Country", "123456789"
 * );
 * 
 * // Assert
 * ArgumentCaptor<Client> clientCaptor = ArgumentCaptor.forClass(Client.class);
 * verify(clientRepository).save(clientCaptor.capture());
 * 
 * Client savedClient = clientCaptor.getValue();
 * assertEquals("User", savedClient.getName());
 * assertEquals("Example", savedClient.getFirstname());
 * assertEquals(email, savedClient.getEmail());
 * assertEquals(hashedPassword, savedClient.getPassword());
 * assertEquals(LocalDate.now(), savedClient.getDateInscription());
 * }
 * 
 * @Test
 * void isValidEmail_ValidEmail_ReturnsTrue() {
 * // Act & Assert
 * assertTrue(clientService.isValidEmail("user@example.com"));
 * assertTrue(clientService.isValidEmail("user.name+tag@example.co.uk"));
 * }
 * 
 * @Test
 * void isValidEmail_InvalidEmail_ReturnsFalse() {
 * // Act & Assert
 * assertFalse(clientService.isValidEmail("invalid-email"));
 * assertFalse(clientService.isValidEmail("user@"));
 * assertFalse(clientService.isValidEmail("@example.com"));
 * assertFalse(clientService.isValidEmail(null));
 * }
 * }
 */