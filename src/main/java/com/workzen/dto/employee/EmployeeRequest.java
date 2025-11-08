package com.workzen.dto.employee;

import com.workzen.enums.EmployeeStatus;
import com.workzen.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeRequest {
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private LocalDate dateOfJoining;
    
    @NotNull(message = "Role is required")
    private Role role;
    
    private Long departmentId;
    private Long designationId;
    private EmployeeStatus status;
    private Double salary;
    private Long managerId;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String bankAccountNumber;
    private String bankName;
    private String ifscCode;
    private String panNumber;
}
