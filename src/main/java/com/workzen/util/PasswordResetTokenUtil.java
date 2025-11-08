package com.workzen.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Date;

@Component
public class PasswordResetTokenUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${app.password-reset.expiration:86400000}") // 24 hours default
    private long tokenExpiration;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Generate password reset token for an employee
     */
    public String generatePasswordResetToken(String employeeCode, String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("employeeCode", employeeCode)
                .claim("type", "PASSWORD_RESET")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + tokenExpiration))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    /**
     * Generate full reset password URL
     */
    public String generateResetPasswordLink(String employeeCode, String email) {
        String token = generatePasswordResetToken(employeeCode, email);
        return frontendUrl + "/change-password?token=" + token;
    }

    /**
     * Validate reset token
     */
    public boolean isValidResetToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(jwtSecret)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    /**
     * Extract email from reset token
     */
    public String extractEmailFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(jwtSecret)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    /**
     * Extract employeeCode from reset token
     */
    public String extractEmployeeCodeFromToken(String token) {
        return (String) Jwts.parser()
                .setSigningKey(jwtSecret)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("employeeCode");
    }
    
}
