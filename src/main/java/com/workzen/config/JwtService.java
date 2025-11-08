package com.workzen.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import org.springframework.security.core.userdetails.UserDetails;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private final SecretKey secretKey;
    private final long expirationMillis;

    public JwtService(@Value("${jwt.secret:}") String secret,
                      @Value("${jwt.expiration:86400000}") long expirationMillis) {
        this.expirationMillis = expirationMillis;
        SecretKey key = null;

        if (secret == null || secret.isBlank()) {
            log.warn("`jwt.secret` is not set or empty. Generating a temporary signing key (NOT for production).");
            key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        } else {
            byte[] keyBytes;
            try {
                keyBytes = Decoders.BASE64.decode(secret);
            } catch (Exception e) {
                keyBytes = secret.getBytes(StandardCharsets.UTF_8);
            }
            if (keyBytes.length < 32) {
                log.error("Provided `jwt.secret` is too short ({} bytes). Must be >= 32 bytes for HS256.", keyBytes.length);
                throw new IllegalStateException("`jwt.secret` too short: provide a 256-bit (32 byte) key or base64-encoded equivalent");
            }
            key = Keys.hmacShaKeyFor(keyBytes);
        }

        this.secretKey = key;
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Convenience overload to generate an access token from a UserDetails (e.g. Employee).
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(userDetails.getUsername());
    }

    /**
     * Generate a refresh token for the given user. Refresh tokens typically have a
     * longer expiry than access tokens. Here we use 7x the access-token expiry.
     */
    public String generateRefreshToken(UserDetails userDetails) {
        long refreshExpiration = expirationMillis * 7L; // 7 days if default was 1 day
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    /**
     * Validate that the token belongs to the provided user and is not expired.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            if (username == null || !username.equals(userDetails.getUsername())) {
                return false;
            }
            Date expiration = parseClaims(token).getExpiration();
            return expiration == null || expiration.after(new Date());
        } catch (Exception ex) {
            return false;
        }
    }
}