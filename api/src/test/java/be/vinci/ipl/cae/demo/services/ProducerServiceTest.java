package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.repositories.ProducerRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.concurrent.atomic.AtomicReference;

@ExtendWith(MockitoExtension.class)
class ProducerServiceTest {

    @Mock
    private ProducerRepository producerRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private ProducerService producerService;
    
    private String testName;
    private String testFirstname;
    private String testCompany;
    private String testEmail;
    private String testPassword;
    private String testStreet;
    private String testNumber;
    private String testBox;
    private String testPostalCode;
    private String testCity;
    private String testCountry;
    private String testPhoneNumber;

    @BeforeEach
    void setUp() {
        // Configurer les données de test
        testName = "Dupont";
        testFirstname = "Jean";
        testCompany = "Ferme Bio";
        testEmail = "jean.dupont@test.com";
        testPassword = "password123";
        testStreet = "Rue de la Ferme";
        testNumber = "123";
        testBox = "A";
        testPostalCode = "1000";
        testCity = "Bruxelles";
        testCountry = "Belgique";
        testPhoneNumber = "0123456789";
        
        // Configurer le comportement du passwordEncoder
        when(passwordEncoder.encode(any())).thenReturn("encoded_password");
    }

    @Test
    void createProducer_ShouldCreateAndSaveProducer() {
        // Arrange
        AtomicReference<Producer> capturedProducer = new AtomicReference<>();
        
        // Configure le mock pour capturer l'argument
        when(producerRepository.save(any(Producer.class))).thenAnswer(invocation -> {
            capturedProducer.set(invocation.getArgument(0));
            return capturedProducer.get();
        });
        
        // Act
        producerService.createProducer(
            testName,
            testFirstname,
            testCompany,
            testEmail,
            testPassword,
            testStreet,
            testNumber,
            testBox,
            testPostalCode,
            testCity,
            testCountry,
            testPhoneNumber
        );
        
        // Assert
        verify(producerRepository).save(any(Producer.class));
        verify(passwordEncoder).encode(testPassword);
        
        assertNotNull(capturedProducer.get());
        assertEquals(testName, capturedProducer.get().getName());
        assertEquals(testFirstname, capturedProducer.get().getFirstname());
        assertEquals(testCompany, capturedProducer.get().getCompany());
        assertEquals(testEmail, capturedProducer.get().getEmail());
        assertEquals("encoded_password", capturedProducer.get().getPassword());
        assertEquals(testStreet, capturedProducer.get().getStreet());
        assertEquals(testNumber, capturedProducer.get().getNumber());
        assertEquals(testBox, capturedProducer.get().getBox());
        assertEquals(testPostalCode, capturedProducer.get().getPostalCode());
        assertEquals(testCity, capturedProducer.get().getCity());
        assertEquals(testCountry, capturedProducer.get().getCountry());
        assertEquals(testPhoneNumber, capturedProducer.get().getPhoneNumber());
        assertNotNull(capturedProducer.get().getDateInscription());
    }

    @Test
    void registerProducer_WhenEmailDoesNotExist_ShouldReturnTrue() {
        // Arrange
        when(userRepository.findByEmail(testEmail)).thenReturn(null);
        
        // Act
        boolean result = producerService.registerProducer(
            testName,
            testFirstname,
            testCompany,
            testEmail,
            testPassword,
            testStreet,
            testNumber,
            testBox,
            testPostalCode,
            testCity,
            testCountry,
            testPhoneNumber
        );
        
        // Assert
        assertTrue(result);
        verify(userRepository).findByEmail(testEmail);
        verify(producerRepository).save(any(Producer.class));
    }

    @Test
    void registerProducer_WhenEmailExists_ShouldReturnFalse() {
        // Arrange
        // Configurer le mock pour retourner null la première fois (permettre le premier enregistrement)
        // puis retourner un producteur existant la deuxième fois (bloquer le second enregistrement)
        when(userRepository.findByEmail(testEmail))
            .thenReturn(null)  // Premier appel - l'email n'existe pas encore
            .thenReturn(new Producer());  // Second appel - l'email existe maintenant
        
        // Act
        // Premier enregistrement - devrait réussir
        boolean firstResult = producerService.registerProducer(
            testName,
            testFirstname,
            testCompany,
            testEmail,
            testPassword,
            testStreet,
            testNumber,
            testBox,
            testPostalCode,
            testCity,
            testCountry,
            testPhoneNumber
        );
        
        // Second enregistrement avec le même email - devrait échouer
        boolean secondResult = producerService.registerProducer(
            testName,
            testFirstname,
            testCompany,
            testEmail,
            testPassword,
            testStreet,
            testNumber,
            testBox,
            testPostalCode,
            testCity,
            testCountry,
            testPhoneNumber
        );
        
        // Assert
        assertTrue(firstResult);  // Premier enregistrement réussi
        assertFalse(secondResult);  // Second enregistrement échoué
        
        // Vérifier que findByEmail a été appelé deux fois
        verify(userRepository, times(2)).findByEmail(testEmail);
        
        // Vérifier que save n'a été appelé qu'une seule fois (pour le premier enregistrement)
        verify(producerRepository, times(1)).save(any(Producer.class));
    }

}