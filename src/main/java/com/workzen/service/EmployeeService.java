package com.workzen.service;

import com.workzen.entity.Department;
import com.workzen.entity.Employee;
import com.workzen.enums.Role;
import com.workzen.enums.EmployeeStatus;
import com.workzen.repository.EmployeeRepository;
import com.workzen.util.PasswordResetTokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeService {
    private static final Logger logger = LoggerFactory.getLogger(EmployeeService.class);

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeIdGeneratorService employeeIdGeneratorService;
    private final EmailService emailService;
    private final com.workzen.util.PasswordGenerator passwordGenerator;
    private final PasswordResetTokenUtil passwordResetTokenUtil;
    
    public Employee createEmployee(Employee employee) {
        // Validate email uniqueness
        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new RuntimeException("Employee with email " + employee.getEmail() + " already exists");
        }
        
        // Set default values first
        if (employee.getStatus() == null) {
            employee.setStatus(EmployeeStatus.ACTIVE);
        }
        if (employee.getDateOfJoining() == null) {
            employee.setDateOfJoining(LocalDate.now());
        }
        
        // Generate employee ID using the new format
        String employeeId = employeeIdGeneratorService.generateEmployeeId(
                employee.getFirstName(), 
                employee.getLastName(), 
                employee.getDateOfJoining()
        );
        employee.setEmployeeCode(employeeId);
        
        // Generate temporary password if not provided
        String temporaryPassword;
        if (employee.getPassword() == null || employee.getPassword().trim().isEmpty()) {
            temporaryPassword = passwordGenerator.generateTemporaryPassword();
            logger.info("Generated temporary password for {}: {} (length: {})", 
                employee.getEmail(), temporaryPassword, temporaryPassword.length());
            employee.setPassword(passwordEncoder.encode(temporaryPassword));
        } else {
            temporaryPassword = employee.getPassword();
            logger.info("Using provided password for {}: {} (length: {})", 
                employee.getEmail(), temporaryPassword, temporaryPassword.length());
            employee.setPassword(passwordEncoder.encode(temporaryPassword));
        }
        logger.info("Password encoded and set for {}", employee.getEmail());
        
        // Save employee first
        Employee savedEmployee = employeeRepository.save(employee);
        
        // Send welcome email with credentials
        try {
            // Generate password reset link
            String resetPasswordLink = passwordResetTokenUtil.generateResetPasswordLink(
                savedEmployee.getEmployeeCode(),
                savedEmployee.getEmail()
            );
            
            // Send comprehensive welcome email with credentials
            logger.info("Sending welcome email to {} with temporary password: {}", 
                savedEmployee.getEmail(), temporaryPassword);
            emailService.sendWelcomeEmailWithCredentials(
                savedEmployee.getEmail(),
                savedEmployee.getFirstName() + " " + savedEmployee.getLastName(),
                savedEmployee.getEmployeeCode(),
                temporaryPassword,
                resetPasswordLink
            );
            logger.info("Welcome email sent successfully to {}", savedEmployee.getEmail());
        } catch (Exception e) {
            // The admin can manually send credentials if email fails
            logger.error("Failed to send welcome email to {}: {}", savedEmployee.getEmail(), e.getMessage(), e);
        }
        
        return savedEmployee;
    }
    
    public Employee updateEmployee(Long id, Employee employeeDetails) {
        Employee employee = findById(id);
        
        employee.setFirstName(employeeDetails.getFirstName());
        employee.setLastName(employeeDetails.getLastName());
        employee.setEmail(employeeDetails.getEmail());
        employee.setPhone(employeeDetails.getPhone());
        employee.setDateOfBirth(employeeDetails.getDateOfBirth());
        employee.setGender(employeeDetails.getGender());
        employee.setAddress(employeeDetails.getAddress());
        employee.setRole(employeeDetails.getRole());
        employee.setDepartment(employeeDetails.getDepartment());
        employee.setSalary(employeeDetails.getSalary());
        employee.setDesignation(employeeDetails.getDesignation());
        employee.setManager(employeeDetails.getManager());
        employee.setEmergencyContactName(employeeDetails.getEmergencyContactName());
        employee.setEmergencyContactPhone(employeeDetails.getEmergencyContactPhone());
        employee.setBankAccountNumber(employeeDetails.getBankAccountNumber());
        employee.setBankName(employeeDetails.getBankName());
        employee.setIfscCode(employeeDetails.getIfscCode());
        employee.setPanNumber(employeeDetails.getPanNumber());
        
        return employeeRepository.save(employee);
    }
    
    public Employee findById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    }
    
    public Optional<Employee> findByEmail(String email) {
        return employeeRepository.findByEmail(email);
    }
    
    public Optional<Employee> findByEmployeeId(String employeeId) {
        return employeeRepository.findByEmployeeCode(employeeId);
    }
    
    public List<Employee> findAll() {
        return employeeRepository.findAll();
    }
    
    public Page<Employee> findAll(Pageable pageable) {
        return employeeRepository.findAll(pageable);
    }
    
    public List<Employee> findByStatus(EmployeeStatus status) {
        return employeeRepository.findByStatus(status);
    }
    
    public List<Employee> findByDepartment(Department department) {
        return employeeRepository.findByDepartment(department);
    }
    
    public List<Employee> findByRole(Role role) {
        return employeeRepository.findByRole(role);
    }
    
    public List<Employee> findByManager(Employee manager) {
        return employeeRepository.findByManager(manager);
    }
    
    public void deleteEmployee(Long id) {
        Employee employee = findById(id);
        employee.setStatus(EmployeeStatus.TERMINATED);
        employeeRepository.save(employee);
    }
    
    public void changePassword(Long id, String newPassword) {
        Employee employee = findById(id);
        employee.setPassword(passwordEncoder.encode(newPassword));
        employeeRepository.save(employee);
    }
    
    public void updateEmployeeStatus(Long id, EmployeeStatus status) {
        Employee employee = findById(id);
        employee.setStatus(status);
        employeeRepository.save(employee);
    }
    
    public boolean isValidEmployeeId(String employeeId) {
        return employeeIdGeneratorService.isValidEmployeeIdFormat(employeeId);
    }
    
    public EmployeeIdGeneratorService.EmployeeIdInfo parseEmployeeId(String employeeId) {
        return employeeIdGeneratorService.parseEmployeeId(employeeId);
    }
    
    public void resendWelcomeEmail(Long employeeId) {
        Employee employee = findById(employeeId);
        
        // Generate new temporary password
        String newTempPassword = passwordGenerator.generateTemporaryPassword();
        employee.setPassword(passwordEncoder.encode(newTempPassword));
        employeeRepository.save(employee);
        
        // Generate password reset link
        String resetPasswordLink = passwordResetTokenUtil.generateResetPasswordLink(
            employee.getEmployeeCode(),
            employee.getEmail()
        );
        
        // Send welcome email with credentials
        emailService.sendWelcomeEmailWithCredentials(
            employee.getEmail(),
            employee.getFirstName() + " " + employee.getLastName(),
            employee.getEmployeeCode(),
            newTempPassword,
            resetPasswordLink
        );
    }
    
    public void resetEmployeePassword(Long employeeId) {
        Employee employee = findById(employeeId);
        
        // Generate new temporary password
        String newTempPassword = passwordGenerator.generateTemporaryPassword();
        employee.setPassword(passwordEncoder.encode(newTempPassword));
        employeeRepository.save(employee);
        
        // Generate password reset link
        String resetPasswordLink = passwordResetTokenUtil.generateResetPasswordLink(
            employee.getEmployeeCode(),
            employee.getEmail()
        );
        
        // Send password reset email
        emailService.sendPasswordResetEmail(
            employee.getEmail(),
            resetPasswordLink
        );
    }
    
    public void activateEmployee(Long employeeId) {
        Employee employee = findById(employeeId);
        employee.setStatus(EmployeeStatus.ACTIVE);
        employee.setIsActive(true);
        employeeRepository.save(employee);
        
        // Send activation email
        emailService.sendAccountActivationEmail(
            employee.getEmail(),
            employee.getEmployeeCode(),
            employee.getFirstName()
        );
    }
    
    public Page<Employee> searchEmployees(String keyword, Pageable pageable) {
        return employeeRepository.searchEmployees(keyword, pageable);
    }
    
    public long getTotalEmployeeCount() {
        return employeeRepository.count();
    }
    
    public long getActiveEmployeeCount() {
        return employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
    }
    
    public List<Employee> getAllActiveEmployees() {
        return employeeRepository.findByStatus(EmployeeStatus.ACTIVE);
    }
    
    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }
}
