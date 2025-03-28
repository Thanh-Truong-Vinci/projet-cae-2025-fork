package be.vinci.ipl.cae.demo.configuration;

import be.vinci.ipl.cae.demo.models.entities.Client;
import be.vinci.ipl.cae.demo.repositories.ClientRepository;
import be.vinci.ipl.cae.demo.services.AuthsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

/** JwtAuthenticationFilter to handle user authentication. */
@Configuration
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private static final String AUTHORIZATION_HEADER = "Authorization";
  private static final String ROLE_ADMIN = "ROLE_ADMIN";
  private static final String ADMIN_EMAIL = "admin";
  // TODO replace "admin" with the email of the admin user

  private final AuthsService authsService;
  private final ClientRepository clientRepository;

  /**
   * Constructor for JwtAuthenticationFilter.
   *
   * @param authsService the injected AuthsService.
   * @param clientRepository the injected ClientRepository.
   */
  public JwtAuthenticationFilter(AuthsService authsService, ClientRepository clientRepository) {
    this.authsService = authsService;
    this.clientRepository = clientRepository;
  }

  /**
   * Filter to handle user authentication.
   *
   * @param request the request.
   * @param response the response.
   * @param filterChain the filter chain.
   * @throws ServletException the servlet exception.
   * @throws IOException the IO exception.
   */
  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain)
      throws ServletException, IOException {
    String token = request.getHeader(AUTHORIZATION_HEADER);
    if (token != null) {
      String email = authsService.verifyJwtToken(token);
      if (email != null) {
        Client user = clientRepository.findByEmail(email);
        if (user != null) {
          List<GrantedAuthority> authorities = new ArrayList<>();
          if (ADMIN_EMAIL.equals(email)) {
            authorities.add(new SimpleGrantedAuthority(ROLE_ADMIN));
          }
          UsernamePasswordAuthenticationToken authentication =
              new UsernamePasswordAuthenticationToken(user, null, authorities);
          authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authentication);
        }
      }
    }
    filterChain.doFilter(request, response);
  }
}
