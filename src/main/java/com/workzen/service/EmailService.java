package com.workzen.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    @Value("${spring.mail.username:noreply@workzen.com}")
    private String fromEmail;
    
    @Value("${app.company.name:WorkZen HRMS}")
    private String companyName;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    public void sendWelcomeEmail(String toEmail, String employeeId, String firstName, String lastName, String tempPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to " + companyName + " - Your Account Details");
            
            // Create context for Thymeleaf template
            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("lastName", lastName);
            context.setVariable("fullName", firstName + " " + lastName);
            context.setVariable("employeeId", employeeId);
            context.setVariable("email", toEmail);
            context.setVariable("tempPassword", tempPassword);
            context.setVariable("companyName", companyName);
            context.setVariable("loginUrl", frontendUrl + "/login");
            context.setVariable("currentYear", LocalDateTime.now().getYear());
            context.setVariable("createdDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));
            
            // Process the template
            String htmlContent = templateEngine.process("email/welcome-employee", context);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", toEmail);
            
        } catch (MessagingException e) {
            log.error("Failed to send welcome email to: {} - Error: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }
    
    public void sendPasswordResetEmail(String toEmail, String employeeId, String firstName, String newPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(companyName + " - Password Reset");
            
            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("employeeId", employeeId);
            context.setVariable("newPassword", newPassword);
            context.setVariable("companyName", companyName);
            context.setVariable("loginUrl", frontendUrl + "/login");
            context.setVariable("currentYear", LocalDateTime.now().getYear());
            
            String htmlContent = templateEngine.process("email/password-reset", context);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", toEmail);
            
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to: {} - Error: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
    
    public void sendAccountActivationEmail(String toEmail, String employeeId, String firstName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(companyName + " - Account Activated");
            
            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("employeeId", employeeId);
            context.setVariable("companyName", companyName);
            context.setVariable("loginUrl", frontendUrl + "/login");
            context.setVariable("currentYear", LocalDateTime.now().getYear());
            
            String htmlContent = templateEngine.process("email/account-activation", context);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Account activation email sent successfully to: {}", toEmail);
            
        } catch (MessagingException e) {
            log.error("Failed to send account activation email to: {} - Error: {}", toEmail, e.getMessage());
            // Don't throw exception for activation email as it's not critical
        }
    }
}
