package com.workzen.controller;

import com.workzen.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/test/email")
@RequiredArgsConstructor
public class EmailTestController {
    
    private final TemplateEngine templateEngine;
    private final EmailService emailService;
    
    /**
     * Preview the welcome email HTML without sending it
     * Access: http://localhost:8081/api/test/email/preview-welcome
     */
    @GetMapping("/preview-welcome")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> previewWelcomeEmail() {
        Context context = new Context();
        context.setVariable("firstName", "John");
        context.setVariable("lastName", "Doe");
        context.setVariable("fullName", "John Doe");
        context.setVariable("employeeId", "JODO2024001");
        context.setVariable("email", "john.doe@example.com");
        context.setVariable("tempPassword", "TempPass123!");
        context.setVariable("companyName", "WorkZen HRMS");
        context.setVariable("loginUrl", "http://localhost:5173/login");
        context.setVariable("currentYear", LocalDateTime.now().getYear());
        context.setVariable("createdDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));
        
        String htmlContent = templateEngine.process("email/welcome-employee", context);
        
        return ResponseEntity.ok()
                .header("Content-Type", "text/html; charset=UTF-8")
                .body(htmlContent);
    }
    
    /**
     * Preview the password reset email HTML
     * Access: http://localhost:8081/api/test/email/preview-password-reset
     */
    @GetMapping("/preview-password-reset")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> previewPasswordResetEmail() {
        Context context = new Context();
        context.setVariable("firstName", "John");
        context.setVariable("employeeId", "JODO2024001");
        context.setVariable("newPassword", "NewPass456!");
        context.setVariable("companyName", "WorkZen HRMS");
        context.setVariable("loginUrl", "http://localhost:5173/login");
        context.setVariable("currentYear", LocalDateTime.now().getYear());
        
        String htmlContent = templateEngine.process("email/password-reset", context);
        
        return ResponseEntity.ok()
                .header("Content-Type", "text/html; charset=UTF-8")
                .body(htmlContent);
    }
    
    /**
     * Preview the account activation email HTML
     * Access: http://localhost:8081/api/test/email/preview-activation
     */
    @GetMapping("/preview-activation")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> previewActivationEmail() {
        Context context = new Context();
        context.setVariable("firstName", "John");
        context.setVariable("employeeId", "JODO2024001");
        context.setVariable("companyName", "WorkZen HRMS");
        context.setVariable("loginUrl", "http://localhost:5173/login");
        context.setVariable("currentYear", LocalDateTime.now().getYear());
        
        String htmlContent = templateEngine.process("email/account-activation", context);
        
        return ResponseEntity.ok()
                .header("Content-Type", "text/html; charset=UTF-8")
                .body(htmlContent);
    }
    
    /**
     * Test sending actual email (requires email to be enabled)
     * POST http://localhost:8081/api/test/email/send-test
     * Body: { "toEmail": "your-email@gmail.com" }
     */
    @PostMapping("/send-test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> sendTestEmail(@RequestBody TestEmailRequest request) {
        try {
            emailService.sendWelcomeEmail(request.toEmail(), "Test User");
            return ResponseEntity.ok("Test email sent successfully to: " + request.toEmail());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }
    
    public record TestEmailRequest(String toEmail) {}
}
