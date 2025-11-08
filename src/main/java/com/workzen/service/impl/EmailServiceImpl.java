package com.workzen.service.impl;

import com.workzen.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.File;

@Service
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "spring.mail.enabled", havingValue = "true")
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Value("${app.company.name}")
    private String companyName;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // ============================================
    // Simple Email (Plain Text)
    // ============================================
    @Override
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            javaMailSender.send(message);
            log.info("Simple email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send simple email to {}: {}", to, e.getMessage());
            // Don't throw exception to prevent employee creation from failing
        }
    }

    // ============================================
    // HTML Email
    // ============================================
    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            javaMailSender.send(message);
            log.info("HTML email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
            // Don't throw exception to prevent employee creation from failing
        }
    }

    // ============================================
    // Email with Attachment
    // ============================================
    @Override
    public void sendEmailWithAttachment(String to, String subject, String text, String attachmentPath) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text);
            
            File attachment = new File(attachmentPath);
            if (attachment.exists()) {
                helper.addAttachment(attachment.getName(), attachment);
            } else {
                log.warn("Attachment file not found: {}", attachmentPath);
            }
            
            javaMailSender.send(message);
            log.info("Email with attachment sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email with attachment to {}: {}", to, e.getMessage());
            // Don't throw exception
        }
    }

    // ============================================
    // Welcome Email (Original)
    // ============================================
    @Override
    public void sendWelcomeEmail(String to, String userName) {
        String subject = "Welcome to " + companyName;
        String htmlContent = buildWelcomeEmailTemplate(userName);
        sendHtmlEmail(to, subject, htmlContent);
    }

    private String buildWelcomeEmailTemplate(String userName) {
        return """
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #4CAF50;">Welcome to %s</h1>
                        <p>Dear %s,</p>
                        <p>Your account has been successfully created. You can now login to the system using your credentials.</p>
                        <p><strong>Important:</strong> Please change your password upon first login for security purposes.</p>
                        <p><a href="%s/login" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Go to Login</a></p>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                        <p>If you have any questions, please contact our HR department.</p>
                        <p>Best regards,<br/>%s Team</p>
                    </div>
                </body>
            </html>
            """.formatted(companyName, userName, frontendUrl, companyName);
    }

    // ============================================
    // NEW: Welcome Email with Credentials & Reset Link
    // ============================================
    @Override
    public void sendWelcomeEmailWithCredentials(String to, String employeeName, 
                                                 String employeeCode, String defaultPassword, 
                                                 String resetPasswordLink) {
        String subject = "Welcome to " + companyName + " - Your Login Credentials";
        String htmlContent = buildWelcomeEmailWithCredentialsTemplate(
            employeeName, employeeCode, defaultPassword, resetPasswordLink
        );
        sendHtmlEmail(to, subject, htmlContent);
        log.info("Welcome email with credentials sent to: {} (Employee ID: {})", to, employeeCode);
    }

    private String buildWelcomeEmailWithCredentialsTemplate(String employeeName, 
                                                             String employeeCode, 
                                                             String defaultPassword, 
                                                             String resetPasswordLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #4CAF50 0%%, #45a049 100%%); color: white; padding: 30px; border-radius: 5px 5px 0 0; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 5px 5px; }
                    .credentials-box { background: #fff; border: 2px solid #4CAF50; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .credential-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .credential-row:last-child { border-bottom: none; }
                    .credential-label { font-weight: bold; color: #666; }
                    .credential-value { font-family: 'Courier New', monospace; color: #4CAF50; background: #f0f0f0; padding: 5px 10px; border-radius: 3px; }
                    .warning-box { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; color: #856404; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: bold; }
                    .button-secondary { background-color: #2196F3; }
                    .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
                    .security-tips { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; }
                    .security-tips h4 { color: #2196F3; margin-top: 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">Welcome to %s</h1>
                        <p style="margin: 10px 0 0 0;">Your account is ready to use</p>
                    </div>
                    
                    <div class="content">
                        <p>Dear <strong>%s</strong>,</p>
                        
                        <p>Congratulations! Your account has been successfully created in the <strong>%s</strong> system. Below are your login credentials:</p>
                        
                        <div class="credentials-box">
                            <div class="credential-row">
                                <span class="credential-label">Employee ID:</span>
                                <span class="credential-value">%s</span>
                            </div>
                            <div class="credential-row">
                                <span class="credential-label">Default Password:</span>
                                <span class="credential-value">%s</span>
                            </div>
                        </div>
                        
                        <div class="warning-box">
                            <strong>⚠️ IMPORTANT SECURITY NOTICE:</strong>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>This is a temporary password provided for your initial login.</li>
                                <li>You <strong>MUST</strong> change this password on your first login.</li>
                                <li>Never share your credentials with anyone.</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s/login" class="button">🔐 Login to System</a>
                            <a href="%s" class="button button-secondary">🔄 Set New Password</a>
                        </div>
                        
                        <div class="security-tips">
                            <h4>🛡️ Security Tips:</h4>
                            <ul>
                                <li>Create a strong password with uppercase, lowercase, numbers, and special characters</li>
                                <li>Never use easily guessable passwords</li>
                                <li>Always logout before leaving your computer</li>
                            </ul>
                        </div>
                        
                        <h3 style="color: #4CAF50; margin-top: 30px;">How to Login:</h3>
                        <ol>
                            <li>Visit %s/login</li>
                            <li>Enter your Employee ID: <code>%s</code></li>
                            <li>Enter the Default Password provided above</li>
                            <li>Change your password immediately</li>
                        </ol>
                        
                        <div class="footer">
                            <p>This is an automated email. Please do not reply directly to this message.</p>
                            <p>%s | All rights reserved © 2025</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                companyName,                    // Welcome header
                employeeName,                   // Dear name
                companyName,                    // System name
                employeeCode,                   // Employee ID value
                defaultPassword,                // Password value
                frontendUrl,                    // Login button URL
                resetPasswordLink,              // Reset password button URL
                frontendUrl,                    // Login instruction URL
                employeeCode,                   // Employee ID in instructions
                companyName                     // Footer
            );
    }

    // ============================================
    // Password Reset Email
    // ============================================
    @Override
    public void sendPasswordResetEmail(String to, String resetLink) {
        String subject = companyName + " - Password Reset Request";
        String htmlContent = buildPasswordResetTemplate(resetLink);
        sendHtmlEmail(to, subject, htmlContent);
    }

    private String buildPasswordResetTemplate(String resetLink) {
        return """
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #FF9800;">Password Reset Request</h1>
                        <p>You have requested to reset your password. Click the button below to proceed:</p>
                        <p><a href="%s" style="display: inline-block; padding: 10px 20px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                        <p><strong>Note:</strong> This link will expire in 24 hours.</p>
                        <p>If you did not request this, please ignore this email.</p>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                        <p>%s</p>
                    </div>
                </body>
            </html>
            """.formatted(resetLink, companyName);
    }

    // ============================================
    // Payslip Email
    // ============================================
    @Override
    public void sendPayslipEmail(String to, String payslipPath, String monthYear) {
        String subject = companyName + " - Payslip for " + monthYear;
        String text = "Your payslip for " + monthYear + " is attached.";
        sendEmailWithAttachment(to, subject, text, payslipPath);
    }

    // ============================================
    // Leave Approval Email
    // ============================================
    @Override
    public void sendLeaveApprovalEmail(String to, String employeeName, String leaveType, String status) {
        String subject = companyName + " - Leave Request " + status;
        String htmlContent = buildLeaveApprovalTemplate(employeeName, leaveType, status);
        sendHtmlEmail(to, subject, htmlContent);
    }

    private String buildLeaveApprovalTemplate(String employeeName, String leaveType, String status) {
        String statusColor = "APPROVED".equals(status) ? "#4CAF50" : "#FF5252";
        return """
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: %s;">Leave Request %s</h1>
                        <p>Dear %s,</p>
                        <p>Your %s request has been <strong style="color: %s;">%s</strong>.</p>
                        <p>For more details, please login to your account.</p>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                        <p>%s</p>
                    </div>
                </body>
            </html>
            """.formatted(statusColor, status, employeeName, leaveType, statusColor, status, companyName);
    }

    // ============================================
    // Attendance Report Email
    // ============================================
    @Override
    public void sendAttendanceReportEmail(String to, String employeeName, String reportData) {
        String subject = companyName + " - Attendance Report";
        String htmlContent = buildAttendanceReportTemplate(employeeName, reportData);
        sendHtmlEmail(to, subject, htmlContent);
    }

    private String buildAttendanceReportTemplate(String employeeName, String reportData) {
        return """
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #2196F3;">Attendance Report</h1>
                        <p>Dear %s,</p>
                        <p>Your attendance report is ready:</p>
                        <pre style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">%s</pre>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                        <p>%s</p>
                    </div>
                </body>
            </html>
            """.formatted(employeeName, reportData, companyName);
    }
    
    // ============================================
    // Account Activation Email
    // ============================================
    @Override
    public void sendAccountActivationEmail(String to, String employeeCode, String firstName) {
        String subject = companyName + " - Account Activated";
        String htmlContent = buildAccountActivationTemplate(employeeCode, firstName);
        sendHtmlEmail(to, subject, htmlContent);
    }

    private String buildAccountActivationTemplate(String employeeCode, String firstName) {
        return """
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #4CAF50;">Account Activated Successfully</h1>
                        <p>Dear %s,</p>
                        <p>Your account (Employee ID: <strong>%s</strong>) has been activated successfully.</p>
                        <p>You can now access all system features.</p>
                        <p><a href="%s/login" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Login Now</a></p>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                        <p>If you have any questions, please contact HR department.</p>
                        <p>Best regards,<br/>%s Team</p>
                    </div>
                </body>
            </html>
            """.formatted(firstName, employeeCode, frontendUrl, companyName);
    }
}

