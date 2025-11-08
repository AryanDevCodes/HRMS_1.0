package com.workzen.controller;

import com.workzen.dto.employee.EmployeeRequest;
import com.workzen.dto.employee.EmployeeResponse;
import com.workzen.entity.Department;
import com.workzen.entity.Designation;
import com.workzen.entity.Employee;
import com.workzen.enums.EmployeeStatus;
import com.workzen.enums.Role;
import com.workzen.service.DepartmentService;
import com.workzen.service.DesignationService;
import com.workzen.service.EmployeeIdGeneratorService;
import com.workzen.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmployeeController {
    
    private final EmployeeService employeeService;
    private final DepartmentService departmentService;
    private final DesignationService designationService;
    
    // Create employee - Admin only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeCreationResponse> createEmployee(
            @Valid @RequestBody EmployeeRequest request
    ) {
        try {
            Employee employee = mapToEntity(request);
            Employee savedEmployee = employeeService.createEmployee(employee);
            
            EmployeeCreationResponse response = EmployeeCreationResponse.builder()
                    .success(true)
                    .message("Employee created successfully. Welcome email sent to " + savedEmployee.getEmail())
                    .employee(mapToResponse(savedEmployee))
                    .emailSent(true)
                    .build();
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            EmployeeCreationResponse response = EmployeeCreationResponse.builder()
                    .success(false)
                    .message("Failed to create employee: " + e.getMessage())
                    .emailSent(false)
                    .build();
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Resend welcome email - Admin only
    @PostMapping("/{id}/resend-welcome-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> resendWelcomeEmail(@PathVariable Long id) {
        try {
            employeeService.resendWelcomeEmail(id);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Welcome email sent successfully")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to send welcome email: " + e.getMessage())
                    .build());
        }
    }
    
    // Reset employee password - Admin only
    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> resetEmployeePassword(@PathVariable Long id) {
        try {
            employeeService.resetEmployeePassword(id);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Password reset successfully. New password sent to employee email.")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to reset password: " + e.getMessage())
                    .build());
        }
    }
    
    // Activate employee account - Admin only
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> activateEmployee(@PathVariable Long id) {
        try {
            employeeService.activateEmployee(id);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Employee account activated successfully")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message("Failed to activate employee: " + e.getMessage())
                    .build());
        }
    }

    // Get all employees with pagination
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR_MANAGER')")
    public ResponseEntity<Page<EmployeeResponse>> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        Sort sort = sortDirection.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Employee> employeePage = employeeService.findAll(pageable);
        Page<EmployeeResponse> responsePage = employeePage.map(this::mapToResponse);
        
        return ResponseEntity.ok(responsePage);
    }
    
    // Get employee by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR_MANAGER') or @employeeService.findById(#id).email == authentication.name")
    public ResponseEntity<EmployeeResponse> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeService.findById(id);
        return ResponseEntity.ok(mapToResponse(employee));
    }
    
    // Update employee
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR_MANAGER')")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request
    ) {
        Employee employeeDetails = mapToEntity(request);
        Employee updatedEmployee = employeeService.updateEmployee(id, employeeDetails);
        return ResponseEntity.ok(mapToResponse(updatedEmployee));
    }
    
    // Delete employee (soft delete)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
    
    // Get current user profile
    @GetMapping("/profile")
    public ResponseEntity<EmployeeResponse> getCurrentUserProfile(Authentication authentication) {
        Employee employee = (Employee) authentication.getPrincipal();
        return ResponseEntity.ok(mapToResponse(employee));
    }
    
    // Update current user profile (limited fields)
    @PutMapping("/profile")
    public ResponseEntity<EmployeeResponse> updateCurrentUserProfile(
            @RequestBody EmployeeRequest request,
            Authentication authentication
    ) {
        Employee currentEmployee = (Employee) authentication.getPrincipal();
        
        // Only allow updating certain fields
        currentEmployee.setPhone(request.getPhoneNumber());
        currentEmployee.setAddress(request.getAddress());
        currentEmployee.setEmergencyContactName(request.getEmergencyContactName());
        currentEmployee.setEmergencyContactPhone(request.getEmergencyContactPhone());
        
        Employee updatedEmployee = employeeService.updateEmployee(currentEmployee.getId(), currentEmployee);
        return ResponseEntity.ok(mapToResponse(updatedEmployee));
    }
    
    // Search employees
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR_MANAGER')")
    public ResponseEntity<Page<EmployeeResponse>> searchEmployees(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Employee> employeePage = employeeService.searchEmployees(keyword, pageable);
        Page<EmployeeResponse> responsePage = employeePage.map(this::mapToResponse);
        
        return ResponseEntity.ok(responsePage);
    }
    
    // Get employees by department
    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR_MANAGER')")
    public ResponseEntity<List<EmployeeResponse>> getEmployeesByDepartment(
            @PathVariable Long departmentId
    ) {
        Department department = departmentService.findById(departmentId);
        List<Employee> employees = employeeService.findByDepartment(department);
        List<EmployeeResponse> responses = employees.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    // Get employees by role
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR_MANAGER')")
    public ResponseEntity<List<EmployeeResponse>> getEmployeesByRole(@PathVariable Role role) {
        List<Employee> employees = employeeService.findByRole(role);
        List<EmployeeResponse> responses = employees.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    // Get employees by status
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR_MANAGER')")
    public ResponseEntity<List<EmployeeResponse>> getEmployeesByStatus(@PathVariable EmployeeStatus status) {
        List<Employee> employees = employeeService.findByStatus(status);
        List<EmployeeResponse> responses = employees.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    // Change employee status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR_MANAGER')")
    public ResponseEntity<EmployeeResponse> changeEmployeeStatus(
            @PathVariable Long id,
            @RequestParam EmployeeStatus status
    ) {
        employeeService.updateEmployeeStatus(id, status);
        Employee employee = employeeService.findById(id);
        return ResponseEntity.ok(mapToResponse(employee));
    }
    
    // Get employee statistics
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR_MANAGER')")
    public ResponseEntity<EmployeeStatistics> getEmployeeStatistics() {
        long totalEmployees = employeeService.getTotalEmployeeCount();
        long activeEmployees = employeeService.getActiveEmployeeCount();
        
        EmployeeStatistics stats = EmployeeStatistics.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .inactiveEmployees(totalEmployees - activeEmployees)
                .build();
        
        return ResponseEntity.ok(stats);
    }
    
    // Validate employee ID format
    @GetMapping("/validate-id/{employeeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR_MANAGER')")
    public ResponseEntity<EmployeeIdValidationResponse> validateEmployeeId(@PathVariable String employeeId) {
        boolean isValid = employeeService.isValidEmployeeId(employeeId);
        
        EmployeeIdValidationResponse response = EmployeeIdValidationResponse.builder()
                .employeeId(employeeId)
                .isValid(isValid)
                .build();
        
        if (isValid) {
            try {
                EmployeeIdGeneratorService.EmployeeIdInfo info = employeeService.parseEmployeeId(employeeId);
                response.setParsedInfo(info);
            } catch (Exception e) {
                response.setValid(false);
                response.setErrorMessage(e.getMessage());
            }
        } else {
            response.setErrorMessage("Employee ID format is invalid. Expected format: OI + FirstTwoLettersOfFirstName + FirstTwoLettersOfLastName + YearOfJoining + SerialNumber (e.g., OIJODO20220001)");
        }
        
        return ResponseEntity.ok(response);
    }
    
    // Helper methods
    private Employee mapToEntity(EmployeeRequest request) {
        // Fetch Department and Designation entities if IDs are provided
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentService.findById(request.getDepartmentId());
        }
        
        Designation designation = null;
        if (request.getDesignationId() != null) {
            designation = designationService.findById(request.getDesignationId());
        }
        
        Employee.EmployeeBuilder builder = Employee.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender() != null ? com.workzen.enums.Gender.valueOf(request.getGender().toUpperCase()) : null)
                .address(request.getAddress())
                .dateOfJoining(request.getDateOfJoining())
                .role(request.getRole())
                .department(department)
                .status(request.getStatus())
                .salary(request.getSalary())
                .designation(designation)
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .bankAccountNumber(request.getBankAccountNumber())
                .bankName(request.getBankName())
                .ifscCode(request.getIfscCode())
                .panNumber(request.getPanNumber());
        
        if (request.getManagerId() != null) {
            Employee manager = employeeService.findById(request.getManagerId());
            builder.manager(manager);
        }
        
        return builder.build();
    }
    
    private EmployeeResponse mapToResponse(Employee employee) {
        EmployeeResponse.EmployeeResponseBuilder builder = EmployeeResponse.builder()
                .id(employee.getId())
                .employeeId(employee.getEmployeeCode())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .phoneNumber(employee.getPhone())
                .dateOfBirth(employee.getDateOfBirth())
                .gender(employee.getGender() != null ? employee.getGender().name() : null)
                .address(employee.getAddress())
                .dateOfJoining(employee.getDateOfJoining())
                .role(employee.getRole())
                .department(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .status(employee.getStatus())
                .salary(employee.getSalary())
                .designation(employee.getDesignation() != null ? employee.getDesignation().getName() : null)
                .emergencyContactName(employee.getEmergencyContactName())
                .emergencyContactPhone(employee.getEmergencyContactPhone())
                .bankAccountNumber(employee.getBankAccountNumber())
                .bankName(employee.getBankName())
                .ifscCode(employee.getIfscCode())
                .panNumber(employee.getPanNumber())
                .profilePictureUrl(employee.getProfilePictureUrl())
                .enabled(employee.isEnabled())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt());
        
        if (employee.getManager() != null) {
            EmployeeResponse.ManagerInfo managerInfo = EmployeeResponse.ManagerInfo.builder()
                    .id(employee.getManager().getId())
                    .employeeId(employee.getManager().getEmployeeCode())
                    .firstName(employee.getManager().getFirstName())
                    .lastName(employee.getManager().getLastName())
                    .fullName(employee.getManager().getFullName())
                    .designation(employee.getManager().getDesignation() != null ? employee.getManager().getDesignation().getName() : null)
                    .build();
            builder.manager(managerInfo);
        }
        
        return builder.build();
    }
    
    // Inner class for statistics
    @lombok.Data
    @lombok.Builder
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class EmployeeStatistics {
        private long totalEmployees;
        private long activeEmployees;
        private long inactiveEmployees;
    }
    
    // Inner class for employee ID validation response
   @Data
   @Builder
   @AllArgsConstructor
   @NoArgsConstructor
    public static class EmployeeIdValidationResponse {
        private String employeeId;
        private boolean isValid;
        private String errorMessage;
        private EmployeeIdGeneratorService.EmployeeIdInfo parsedInfo;
    }
    
    // Inner class for employee creation response
    @lombok.Data
    @lombok.Builder
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class EmployeeCreationResponse {
        private boolean success;
        private String message;
        private EmployeeResponse employee;
        private boolean emailSent;
    }
    
    // Inner class for general API response
    @lombok.Data
    @lombok.Builder
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class ApiResponse {
        private boolean success;
        private String message;
        private Object data;
    }
}
