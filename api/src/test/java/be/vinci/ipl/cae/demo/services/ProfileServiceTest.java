package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private ProfileService profileService;

    private static final String TEST_EMAIL = "test@example.com";
    private static final String CURRENT_PASSWORD = "currentPassword";
    private static final String NEW_PASSWORD = "newPassword";
    private static final String ENCODED_PASSWORD = "encodedCurrentPassword";
    private static final String NEW_ENCODED_PASSWORD = "encodedNewPassword";

    private User testUser;

    @BeforeEach
    void setUp() {
        // Don't use mock() for testUser if you plan to call real methods on it
        testUser = new Client();  // Use a real User object instead of a mock
        testUser.setEmail(TEST_EMAIL);
        testUser.setPassword(ENCODED_PASSWORD);
    }

    @Test
    void whenCurrentPasswordMatches_thenUpdatePassword() {
        // Arrange
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(testUser);
        when(passwordEncoder.matches(CURRENT_PASSWORD, ENCODED_PASSWORD)).thenReturn(true);
        when(passwordEncoder.encode(NEW_PASSWORD)).thenReturn(NEW_ENCODED_PASSWORD);

        // Act
        profileService.changePassword(TEST_EMAIL, CURRENT_PASSWORD, NEW_PASSWORD);

        // Assert
        verify(userRepository).updatePassword(NEW_ENCODED_PASSWORD, TEST_EMAIL);
    }

    @Test
    void whenCurrentPasswordDoesNotMatch_thenDoNotUpdatePassword() {
        // Arrange
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(testUser);
        when(passwordEncoder.matches(CURRENT_PASSWORD, ENCODED_PASSWORD)).thenReturn(false);

        // Act
        profileService.changePassword(TEST_EMAIL, CURRENT_PASSWORD, NEW_PASSWORD);

        // Assert
        verify(userRepository, never()).updatePassword(anyString(), anyString());
    }

    @Test
    void whenUserNotFound_thenHandleNullPointerException() {
        // Arrange
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(null);
        
        // We expect a NullPointerException when trying to get the password from a null user
        try {
            // Act
            profileService.changePassword(TEST_EMAIL, CURRENT_PASSWORD, NEW_PASSWORD);
            
            // If we get here, no exception was thrown, which is unexpected
            fail("Should have thrown NullPointerException");
        } catch (NullPointerException e) {
            // This is expected
        }
        
        // Assert
        verify(userRepository, never()).updatePassword(anyString(), anyString());
    }
}