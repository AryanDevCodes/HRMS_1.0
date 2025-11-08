package com.workzen.controller;

import com.workzen.config.JwtService;
import com.workzen.dto.auth.AuthenticationResponse;
import com.workzen.dto.auth.LoginRequest;
import com.workzen.entity.Employee;
import com.workzen.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final EmployeeService employeeService;
    private final JwtService jwtService;
    
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
                .user(userInfo)
                .build();
        
        return ResponseEntity.ok(response);
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
}
