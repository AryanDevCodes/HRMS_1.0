package com.workzen.controller;

import com.workzen.config.JwtService;
import com.workzen.dto.auth.AuthenticationResponse;
import com.workzen.dto.auth.LoginRequest;
import com.workzen.entity.Employee;
import com.workzen.enums.Role;
import com.workzen.enums.EmployeeStatus;
import com.workzen.service.AttendanceService;
import com.workzen.service.EmployeeService;
import com.workzen.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final EmployeeService employeeService;
    private final JwtService jwtService;
    private final AttendanceService attendanceService;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @Valid @RequestBody LoginRequest request
    ) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        // Get user details
        Employee employee = (Employee) authentication.getPrincipal();
        
        // Mark attendance automatically on login
        try {
            attendanceService.markAttendanceOnLogin(employee);
        } catch (Exception e) {
            // Log error but don't fail login
            System.err.println("Failed to mark attendance for employee " + employee.getEmail() + ": " + e.getMessage());
        }
        
        // Generate tokens
        String accessToken = jwtService.generateToken(employee);
        String refreshToken = jwtService.generateRefreshToken(employee);
        
        // Build user info
        AuthenticationResponse.UserInfo userInfo = AuthenticationResponse.UserInfo.builder()
                .id(employee.getId())
                .employeeId(employee.getEmployeeCode())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .role(employee.getRole().name())
                .department(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .designation(employee.getDesignation() != null ? employee.getDesignation().getName() : null)
                .build();
        
        // Build response
        AuthenticationResponse response = AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(86400L) // 24 hours in seconds
                .isFirstLogin(employee.getIsFirstLogin())
                .user(userInfo)
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping(value = "/signup", consumes = "multipart/form-data")
    public ResponseEntity<AuthenticationResponse> signup(
            @RequestParam("companyName") String companyName,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("password") String password,
            @RequestParam("loginId") String loginId,
            @RequestParam(value = "role", required = false, defaultValue = "HR_MANAGER") String roleParam,
            @RequestParam(value = "logo", required = false) MultipartFile logo
    ) {
        try {
            // Parse and validate role - only HR_MANAGER and ADMIN are allowed for signup
            Role role;
            try {
                role = Role.valueOf(roleParam.toUpperCase());
                if (role != Role.HR_MANAGER && role != Role.ADMIN) {
                    throw new RuntimeException("Invalid role. Only HR_MANAGER and ADMIN roles are allowed for signup.");
                }
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role. Only HR_MANAGER and ADMIN roles are allowed for signup.");
            }
            
            // Check if email already exists
            if (employeeService.findByEmail(email).isPresent()) {
                throw new RuntimeException("Email already registered");
            }
            
            // Split name into first and last name
            String[] nameParts = name.trim().split("\\s+");
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? String.join(" ", java.util.Arrays.copyOfRange(nameParts, 1, nameParts.length)) : "";
            
            // Handle logo file upload
            String logoUrl = null;
            if (logo != null && !logo.isEmpty()) {
                // Validate file type
                if (!fileStorageService.isValidImageFile(logo)) {
                    throw new RuntimeException("Invalid file type. Please upload an image file (JPEG, PNG, GIF, WebP)");
                }
                
                // Validate file size (5MB max)
                if (!fileStorageService.isValidFileSize(logo, 5 * 1024 * 1024)) {
                    throw new RuntimeException("File size too large. Maximum size is 5MB");
                }
                
                // Store the logo and get URL
                try {
                    logoUrl = fileStorageService.storeCompanyLogo(logo);
                } catch (Exception e) {
                    throw new RuntimeException("Failed to upload logo: " + e.getMessage());
                }
            }
            
            // Create new employee
            Employee employee = Employee.builder()
                    .employeeCode(loginId)
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .phone(phone)
                    .password(passwordEncoder.encode(password))
                    .role(role) // Use validated role (HR_MANAGER or ADMIN only)
                    .status(EmployeeStatus.ACTIVE)
                    .companyName(companyName)
                    .companyLogoUrl(logoUrl)
                    .build();
            
            // Save employee
            Employee savedEmployee = employeeService.createEmployee(employee);
            
            // Generate tokens
            String accessToken = jwtService.generateToken(savedEmployee);
            String refreshToken = jwtService.generateRefreshToken(savedEmployee);
            
            // Build user info
            AuthenticationResponse.UserInfo userInfo = AuthenticationResponse.UserInfo.builder()
                    .id(savedEmployee.getId())
                    .employeeId(savedEmployee.getEmployeeCode())
                    .firstName(savedEmployee.getFirstName())
                    .lastName(savedEmployee.getLastName())
                    .email(savedEmployee.getEmail())
                    .role(savedEmployee.getRole().name())
                    .department(savedEmployee.getDepartment() != null ? savedEmployee.getDepartment().getName() : null)
                    .designation(savedEmployee.getDesignation() != null ? savedEmployee.getDesignation().getName() : null)
                    .build();
            
            // Build response
            AuthenticationResponse response = AuthenticationResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .expiresIn(86400L)
                    .user(userInfo)
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Signup failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refreshToken(
            @RequestHeader("Authorization") String refreshToken
    ) {
        if (refreshToken == null || !refreshToken.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }
        
        String token = refreshToken.substring(7);
        String userEmail = jwtService.extractUsername(token);
        
        if (userEmail != null) {
            Employee employee = employeeService.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (jwtService.isTokenValid(token, employee)) {
                String newAccessToken = jwtService.generateToken(employee);
                String newRefreshToken = jwtService.generateRefreshToken(employee);
                
                AuthenticationResponse.UserInfo userInfo = AuthenticationResponse.UserInfo.builder()
                        .id(employee.getId())
                        .employeeId(employee.getEmployeeCode())
                        .firstName(employee.getFirstName())
                        .lastName(employee.getLastName())
                        .email(employee.getEmail())
                        .role(employee.getRole().name())
                        .department(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                        .designation(employee.getDesignation() != null ? employee.getDesignation().getName() : null)
                        .build();
                
                AuthenticationResponse response = AuthenticationResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(newRefreshToken)
                        .expiresIn(86400L)
                        .user(userInfo)
                        .build();
                
                return ResponseEntity.ok(response);
            }
        }
        
        return ResponseEntity.badRequest().build();
    }
    
        
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthenticationResponse.UserInfo> getCurrentUser(Authentication authentication) {
        Employee employee = (Employee) authentication.getPrincipal();
        
        AuthenticationResponse.UserInfo userInfo = AuthenticationResponse.UserInfo.builder()
                .id(employee.getId())
                .employeeId(employee.getEmployeeCode())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .role(employee.getRole().name())
                .department(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .designation(employee.getDesignation() != null ? employee.getDesignation().getName() : null)
                .build();
        
        return ResponseEntity.ok(userInfo);
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody com.workzen.dto.ChangePasswordRequest request,
            Authentication authentication
    ) {
        try {
            System.out.println("Change password request received for email: " + request.getEmail());
            
            // Get employee - either from authentication or by email
            Employee employee;
            
            if (authentication != null && authentication.isAuthenticated() && 
                !(authentication.getPrincipal() instanceof String)) {
                // User is authenticated
                employee = (Employee) authentication.getPrincipal();
                System.out.println("User authenticated via token: " + employee.getEmail());
            } else {
                // User is not authenticated (first-time login) - find by email if provided in request
                // For this case, we need the email in the request
                if (request.getEmail() == null || request.getEmail().isEmpty()) {
                    System.out.println("Email missing in request for unauthenticated user");
                    return ResponseEntity.badRequest().body(new ErrorResponse("Email is required for password change"));
                }
                
                System.out.println("Looking up employee by email: " + request.getEmail());
                Optional<Employee> employeeOpt = employeeService.findByEmail(request.getEmail());
                if (employeeOpt.isEmpty()) {
                    System.out.println("Employee not found for email: " + request.getEmail());
                    return ResponseEntity.badRequest().body(new ErrorResponse("Employee not found"));
                }
                employee = employeeOpt.get();
                System.out.println("Found employee: " + employee.getEmail() + ", isFirstLogin: " + employee.getIsFirstLogin());
            }
            
            // Validate current password
            System.out.println("Validating current password for: " + employee.getEmail());
            System.out.println("Current password from request (length): " + request.getCurrentPassword().length());
            System.out.println("Stored password hash (first 20 chars): " + employee.getPassword().substring(0, Math.min(20, employee.getPassword().length())));
            
            boolean passwordMatches = passwordEncoder.matches(request.getCurrentPassword(), employee.getPassword());
            System.out.println("Password match result: " + passwordMatches);
            
            if (!passwordMatches) {
                System.out.println("Password validation failed for: " + employee.getEmail());
                return ResponseEntity.badRequest().body(new ErrorResponse("Current password is incorrect"));
            }
            
            System.out.println("Password validated successfully for: " + employee.getEmail());
            
            // Validate new password and confirm password match
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.badRequest().body(new ErrorResponse("New password and confirm password do not match"));
            }
            
            // Validate new password is not same as current password
            if (request.getCurrentPassword().equals(request.getNewPassword())) {
                return ResponseEntity.badRequest().body(new ErrorResponse("New password must be different from current password"));
            }
            
            // Validate password strength
            if (request.getNewPassword().length() < 8) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Password must be at least 8 characters long"));
            }
            
            // Update password
            employee.setPassword(passwordEncoder.encode(request.getNewPassword()));
            
            // Set isFirstLogin to false if it's the first login
            if (Boolean.TRUE.equals(employee.getIsFirstLogin())) {
                employee.setIsFirstLogin(false);
            }
            
            employeeService.saveEmployee(employee);
            
            return ResponseEntity.ok(new SuccessResponse("Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to change password: " + e.getMessage()));
        }
    }
    
    // Helper classes for response
    @Data
    @AllArgsConstructor
    private static class ErrorResponse {
        private String error;
    }
    
    @Data
    @AllArgsConstructor
    private static class SuccessResponse {
        private String message;
    }
}

