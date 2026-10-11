package be.vinci.ipl.cae.demo.configuration; // Vérifie que c'est bien ton package

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE) // Très important : s'exécute AVANT Spring Security
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Autoriser les identifiants/tokens (obligatoire pour ton système de login)
        config.setAllowCredentials(true);
        // Autoriser toutes les origines (GitHub Pages)
        config.setAllowedOriginPatterns(List.of("*"));
        // Autoriser tous les en-têtes (Authorization, etc.)
        config.setAllowedHeaders(List.of("*"));
        // Autoriser toutes les méthodes
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}