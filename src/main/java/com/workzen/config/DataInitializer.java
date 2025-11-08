package com.workzen.config;

import com.workzen.entity.Department;
import com.workzen.entity.Designation;
import com.workzen.entity.Employee;
import com.workzen.enums.EmployeeStatus;
import com.workzen.enums.Gender;
import com.workzen.enums.Role;
import com.workzen.repository.DepartmentRepository;
import com.workzen.repository.DesignationRepository;
import com.workzen.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        initializeDefaultData();
    }
    
    private void initializeDefaultData() {
        // Check if admin user already exists
        if (employeeRepository.findByEmail("admin@workzen.com").isPresent()) {
            log.info("Default users already exist. Skipping initialization.");
            return;
        }
        
        log.info("Initializing default data...");
        
        // Create Departments
        Department itDept = Department.builder()
                .name("Information Technology")
                .description("IT and Software Development")
                .isActive(true)
                .build();
        departmentRepository.save(itDept);
        
        Department hrDept = Department.builder()
                .name("Human Resources")
                .description("HR and Employee Management")
                .isActive(true)
                .build();
        departmentRepository.save(hrDept);
        
        Department financeDept = Department.builder()
                .name("Finance")
                .description("Finance and Accounting")
                .isActive(true)
                .build();
        departmentRepository.save(financeDept);
        
        // Create Designations
        Designation adminDesignation = Designation.builder()
                .name("System Administrator")
                .description("System Administrator")
                .level(1)
                .isActive(true)
                .build();
        designationRepository.save(adminDesignation);
        
        Designation hrManagerDesignation = Designation.builder()
                .name("HR Manager")
                .description("Human Resources Manager")
                .level(2)
                .isActive(true)
                .build();
        designationRepository.save(hrManagerDesignation);
        
        Designation payrollOfficerDesignation = Designation.builder()
                .name("Payroll Officer")
                .description("Payroll Officer")
                .level(3)
                .isActive(true)
                .build();
        designationRepository.save(payrollOfficerDesignation);
        
        // Create Admin User
        Employee admin = Employee.builder()
                .employeeCode("EMP00001")
                .firstName("System")
                .lastName("Administrator")
                .email("admin@workzen.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("+1234567890")
                .dateOfBirth(LocalDate.of(1985, 1, 1))
                .gender(Gender.MALE)
                .address("123 Admin Street")
                .city("Admin City")
                .state("Admin State")
                .pincode("123456")
                .dateOfJoining(LocalDate.now())
                .role(Role.ADMIN)
                .department(itDept)
                .designation(adminDesignation)
                .status(EmployeeStatus.ACTIVE)
                .salary(100000.0)
                .isActive(true)
                .build();
        
        employeeRepository.save(admin);
        
        // Set admin as IT department manager
        itDept.setManager(admin);
        departmentRepository.save(itDept);
        
        // Create HR Manager
        Employee hrManager = Employee.builder()
                .employeeCode("EMP00002")
                .firstName("Jane")
                .lastName("Smith")
                .email("hr.manager@workzen.com")
                .password(passwordEncoder.encode("hr123"))
                .phone("+1234567891")
                .dateOfBirth(LocalDate.of(1988, 3, 15))
                .gender(Gender.FEMALE)
                .address("456 HR Avenue")
                .city("HR City")
                .state("HR State")
                .pincode("123457")
                .dateOfJoining(LocalDate.now())
                .role(Role.HR_MANAGER)
                .department(hrDept)
                .designation(hrManagerDesignation)
                .status(EmployeeStatus.ACTIVE)
                .salary(80000.0)
                .manager(admin)
                .isActive(true)
                .build();
        
        employeeRepository.save(hrManager);
        
        // Set HR manager as HR department manager
        hrDept.setManager(hrManager);
        departmentRepository.save(hrDept);
        
        // Create Payroll Officer
        Employee payrollOfficer = Employee.builder()
                .employeeCode("EMP00003")
                .firstName("John")
                .lastName("Doe")
                .email("payroll.officer@workzen.com")
                .password(passwordEncoder.encode("payroll123"))
                .phone("+1234567892")
                .dateOfBirth(LocalDate.of(1990, 7, 20))
                .gender(Gender.MALE)
                .address("789 Payroll Lane")
                .city("Payroll City")
                .state("Payroll State")
                .pincode("123458")
                .dateOfJoining(LocalDate.now())
                .role(Role.PAYROLL_OFFICER)
                .department(financeDept)
                .designation(payrollOfficerDesignation)
                .status(EmployeeStatus.ACTIVE)
                .salary(60000.0)
                .manager(admin)
                .isActive(true)
                .build();
        
        employeeRepository.save(payrollOfficer);
        
        // Set payroll officer as Finance department manager
        financeDept.setManager(payrollOfficer);
        departmentRepository.save(financeDept);
        
        log.info("Default data created successfully:");
        log.info("Departments: IT, HR, Finance");
        log.info("Admin: admin@workzen.com / admin123");
        log.info("HR Manager: hr.manager@workzen.com / hr123");
        log.info("Payroll Officer: payroll.officer@workzen.com / payroll123");
    }
}
