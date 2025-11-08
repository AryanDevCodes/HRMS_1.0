package com.workzen.controller;

import com.workzen.config.JwtService;
import com.workzen.service.CustomUserDetailsService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Map;

@org.springframework.stereotype.Component
@RequiredArgsConstructor
public class AuthRefreshController {

    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    // This helper method is intentionally not mapped to an HTTP endpoint to avoid
    // colliding with the existing /api/auth/refresh mapping in AuthController.
    public ResponseEntity<?> refreshTokenInternal(HttpServletRequest request, Map<String, String> body) {
        String refreshToken = null;

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            refreshToken = authHeader.substring(7);
        }

        if (refreshToken == null && body != null) {
            refreshToken = body.get("refreshToken");
        }

        if (refreshToken == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "refresh_token_missing"));
        }

        try {
            String username = jwtService.extractUsername(refreshToken);
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

            if (!jwtService.isTokenValid(refreshToken, userDetails)) {
                return ResponseEntity.status(401).body(Map.of("error", "invalid_refresh_token"));
            }

            String newAccessToken = jwtService.generateToken(userDetails);
            String newRefreshToken = jwtService.generateRefreshToken(userDetails);

            return ResponseEntity.ok(Map.of(
                    "accessToken", newAccessToken,
                    "refreshToken", newRefreshToken
            ));
        } catch (ExpiredJwtException eje) {
            return ResponseEntity.status(401).body(Map.of("error", "refresh_token_expired"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "unable_to_refresh", "message", e.getMessage()));
        }
    }
}