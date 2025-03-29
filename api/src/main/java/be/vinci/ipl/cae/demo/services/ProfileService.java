package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/** Profile Service. */
@Service
public class ProfileService {

  private final UserRepository userRepository;
  private final BCryptPasswordEncoder passwordEncoder;

  /**
   * Constructor.
   *
   * @param userRepository the user repository
   */
  public ProfileService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  /**
   * Change the current password.
   *
   * @param email the email that wants to change his password
   * @param password the password
   * @return true if the password changes, false otherwise
   */
  public boolean changePassword(String email, String password) {
    if (userRepository.updatePassword(passwordEncoder.encode(password), email) > 0) {
      return true;
    }
    return false;
  }
}
