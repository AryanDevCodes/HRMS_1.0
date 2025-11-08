package com.workzen.config;

import com.workzen.entity.Employee;
import com.workzen.entity.SalaryComponent;
import com.workzen.enums.Role;
import com.workzen.enums.SalaryComponentType;
import com.workzen.repository.SalaryComponentRepository;
import com.workzen.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final EmployeeService employeeService;
    private final SalaryComponentRepository salaryComponentRepository;

    @Bean
    CommandLineRunner seedUsers() {
        return args -> {
            try {
                createIfNotExists("admin@workzen.com", "Admin", "User", "admin12345678", Role.ADMIN);
                createIfNotExists("hr.manager@workzen.com", "HR", "Manager", "hr12345678", Role.HR_MANAGER);
                createIfNotExists("payroll@workzen.com", "Payroll", "Officer", "payro12345678", Role.PAYROLL_OFFICER);
            } catch (Exception e) {
                logger.error("Error while seeding initial users: {}", e.getMessage(), e);
            }
        };
    }
    
    @Bean
    CommandLineRunner seedSalaryComponents() {
        return args -> {
            try {
                if (salaryComponentRepository.count() > 0) {
                    logger.info("Salary components already exist — skipping seeding");
                    return;
                }
                
                logger.info("Seeding default salary components...");
                
                // EARNINGS
                // Basic Salary - 50% of total monthly wage
                createSalaryComponent("Basic Salary", "BASIC_SALARY", "Base salary component", 
                        SalaryComponentType.EARNING, true, 50.0, null, null, true, true, 1, true, null);
                
                // HRA - 50% of Basic Salary
                createSalaryComponent("House Rent Allowance", "HRA", "Housing allowance based on basic salary", 
                        SalaryComponentType.EARNING, true, 50.0, null, "BASIC_SALARY", true, true, 2, true, null);
                
                // Standard Allowance - 16.67% of total
                createSalaryComponent("Standard Allowance", "STANDARD_ALLOWANCE", "Standard monthly allowance", 
                        SalaryComponentType.EARNING, true, 16.67, null, null, true, true, 3, true, null);
                
                // Performance Bonus - 8.33% of total
                createSalaryComponent("Performance Bonus", "PERFORMANCE_BONUS", "Performance-based monthly bonus", 
                        SalaryComponentType.EARNING, true, 8.33, null, null, true, true, 4, false, null);
                
                // LTA - 8.33% of total
                createSalaryComponent("Leave Travel Allowance", "LTA", "Travel allowance", 
                        SalaryComponentType.EARNING, true, 8.33, null, null, true, false, 5, false, null);
                
                // Fixed Allowance - 11.67% of total
                createSalaryComponent("Fixed Allowance", "FIXED_ALLOWANCE", "Fixed monthly allowance", 
                        SalaryComponentType.EARNING, true, 11.67, null, null, true, true, 6, true, null);
                
                // DEDUCTIONS
                // PF Employee - 12% of Basic Salary, max 15000
                createSalaryComponent("Provident Fund (Employee)", "PF_EMPLOYEE", "Employee contribution to PF", 
                        SalaryComponentType.DEDUCTION, true, 12.0, null, "BASIC_SALARY", true, false, 7, true, 15000.0);
                
                // PF Employer - 12% of Basic Salary, max 15000 (shown for reference, not deducted from salary)
                createSalaryComponent("Provident Fund (Employer)", "PF_EMPLOYER", "Employer contribution to PF", 
                        SalaryComponentType.DEDUCTION, true, 12.0, null, "BASIC_SALARY", true, false, 8, true, 15000.0);
                
                // Professional Tax - Fixed 200
                createSalaryComponent("Professional Tax", "PROFESSIONAL_TAX", "Monthly professional tax", 
                        SalaryComponentType.DEDUCTION, false, null, 200.0, null, true, true, 9, true, null);
                
                // TDS - Tax Deducted at Source (will be calculated based on annual income slabs)
                // For simplicity, using 10% of taxable income above 50,000/month
                createSalaryComponent("TDS (Tax Deducted at Source)", "TDS", "Income tax deduction at source", 
                        SalaryComponentType.DEDUCTION, true, 10.0, null, null, true, false, 10, false, null);
                
                logger.info("Default salary components seeded successfully!");
                
            } catch (Exception e) {
                logger.error("Error while seeding salary components: {}", e.getMessage(), e);
            }
        };
    }
    
    private void createSalaryComponent(String name, String code, String description, 
                                       SalaryComponentType type, Boolean isPercentage, 
                                       Double percentageValue, Double fixedAmount, 
                                       String basedOnComponentCode, Boolean isActive, 
                                       Boolean isTaxable, Integer displayOrder, 
                                       Boolean isMandatory, Double maxLimit) {
        SalaryComponent component = SalaryComponent.builder()
                .name(name)
                .code(code)
                .description(description)
                .type(type)
                .isPercentage(isPercentage)
                .percentageValue(percentageValue)
                .fixedAmount(fixedAmount)
                .basedOnComponentCode(basedOnComponentCode)
                .isActive(isActive)
                .isTaxable(isTaxable)
                .displayOrder(displayOrder)
                .isMandatory(isMandatory)
                .maxLimit(maxLimit)
                .build();
        
        salaryComponentRepository.save(component);
        logger.info("Created salary component: {} ({})", name, code);
    }

    private void createIfNotExists(String email, String firstName, String lastName, String rawPassword, Role role) {
        try {
            if (employeeService.findByEmail(email).isPresent()) {
                logger.info("User with email {} already exists — skipping creation", email);
                return;
            }

            Employee employee = Employee.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .password(rawPassword) // will be encoded by EmployeeService.createEmployee
                    .role(role)
                    .dateOfJoining(LocalDate.now())
                    .build();

            employeeService.createEmployee(employee);
            logger.info("Created initial user: {} with role {}", email, role.name());
        } catch (Exception e) {
            logger.error("Failed to create user {}: {}", email, e.getMessage(), e);
        }
    }
}
