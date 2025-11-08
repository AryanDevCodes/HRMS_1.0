package com.workzen.service;


public interface EmailService {

    void sendSimpleEmail(String to, String subject, String text);
    void sendHtmlEmail(String to, String subject, String htmlContent);

    void sendEmailWithAttachment(String to, String subject, String text, String attachmentPath);

    void sendWelcomeEmail(String to, String userName);

    void sendPasswordResetEmail(String to, String resetLink);

    void sendPayslipEmail(String to, String payslipPath, String monthYear);

    void sendLeaveApprovalEmail(String to, String employeeName, String leaveType, String status);

    void sendAttendanceReportEmail(String to, String employeeName, String reportData);
    
    // Welcome email with Employee ID, Password, and Reset Link
    void sendWelcomeEmailWithCredentials(String to, String employeeName, 
                                         String employeeCode, String defaultPassword, 
                                         String resetPasswordLink);
    
    // Account activation email
    void sendAccountActivationEmail(String to, String employeeCode, String firstName);


}
