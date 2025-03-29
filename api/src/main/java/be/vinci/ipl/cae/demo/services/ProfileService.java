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
   * @param currentPassword the current password
   * @param newPassword the new password
   * @return 1 if the password changes, 0 otherwise
   */
  public int changePassword(String email, String currentPassword, String newPassword) {
    if (!passwordEncoder.matches(
        currentPassword, userRepository.findByEmail(email).getPassword())) {
      return 0;
    }
    return userRepository.updatePassword(passwordEncoder.encode(newPassword), email);
  }
}
