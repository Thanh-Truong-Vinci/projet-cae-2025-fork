package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import java.util.Date;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthsService {

    private static final String JWT_SECRET = "ilovemypizza!";
    private static final long LIFETIME_JWT = 24 * 60 * 60 * 1000; // 24 hours

    private static final Algorithm algorithm = Algorithm.HMAC256(JWT_SECRET);

    public AuthenticatedUser createJwtToken(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email cannot be null or empty");
        }
        try {
            String token = JWT.create()
                    .withIssuer("auth0")
                    .withClaim("email", email)
                    .withIssuedAt(new Date())
                    .withExpiresAt(new Date(System.currentTimeMillis() + LIFETIME_JWT))
                    .sign(algorithm);
            AuthenticatedUser authenticatedUser = new AuthenticatedUser();
            authenticatedUser.setEmail(email);
            authenticatedUser.setToken(token);
            return authenticatedUser;
        } catch (JWTCreationException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Token generation failed: " + e.getMessage(), e);
        }
    }

    public String verifyJwtToken(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        try {
            return JWT.require(algorithm)
                    .withIssuer("auth0")
                    .build()
                    .verify(token)
                    .getClaim("email")
                    .asString();
        } catch (JWTVerificationException e) {
            // Handle verification exceptions including token expiration
            return null;
        }
    }
}
