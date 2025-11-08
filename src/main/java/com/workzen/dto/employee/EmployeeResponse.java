package com.workzen.dto.employee;

import com.workzen.enums.EmployeeStatus;
import com.workzen.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeResponse {
    
    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private LocalDate dateOfJoining;
    private Role role;
    private String department; // Changed to String
    private EmployeeStatus status;
    private Double salary;
    private String designation; // Already String
    private ManagerInfo manager;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String bankAccountNumber;
    private String bankName;
    private String ifscCode;
    private String panNumber;
    private String profilePictureUrl;
    private boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ManagerInfo {
        private Long id;
        private String employeeId;
        private String firstName;
        private String lastName;
        private String fullName;
        private String designation;
    }
}
