package com.workzen.controller;

import com.workzen.entity.Employee;
import com.workzen.entity.Payroll;
import com.workzen.service.EmployeeService;
import com.workzen.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {
    
    private final PayrollService payrollService;
    private final EmployeeService employeeService;
    
    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'PAYROLL_OFFICER')")
    public ResponseEntity<Payroll> generatePayroll(@RequestBody Map<String, Object> request) {
        Long employeeId = Long.valueOf(request.get("employeeId").toString());
        LocalDate payPeriodStart = LocalDate.parse(request.get("payPeriodStart").toString());
        LocalDate payPeriodEnd = LocalDate.parse(request.get("payPeriodEnd").toString());
        
        Employee employee = employeeService.findById(employeeId);
        Payroll payroll = payrollService.generatePayroll(employee, payPeriodStart, payPeriodEnd);
        return new ResponseEntity<>(payroll, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PAYROLL_OFFICER')")
    public ResponseEntity<Payroll> updatePayroll(@PathVariable Long id,
                                                  @RequestBody Payroll payrollDetails) {
        Payroll updated = payrollService.updatePayroll(id, payrollDetails);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PAYROLL_OFFICER', 'HR_MANAGER')")
    public ResponseEntity<Payroll> getPayrollById(@PathVariable Long id) {
        Payroll payroll = payrollService.findById(id);
        return ResponseEntity.ok(payroll);
    }
    
    @GetMapping("/my-payrolls")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Payroll>> getMyPayrolls(@AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        List<Payroll> payrolls = payrollService.getEmployeePayrolls(employee);
        return ResponseEntity.ok(payrolls);
    }
    
    @GetMapping("/my-payrolls/paginated")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<Payroll>> getMyPayrollsPaginated(@AuthenticationPrincipal UserDetails userDetails,
                                                                 Pageable pageable) {
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        Page<Payroll> payrolls = payrollService.getEmployeePayrolls(employee, pageable);
        return ResponseEntity.ok(payrolls);
    }
    
    @GetMapping("/my-payrolls/period")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Payroll>> getMyPayrollForPeriod(@AuthenticationPrincipal UserDetails userDetails,
                                                          @RequestParam LocalDate startDate,
                                                          @RequestParam LocalDate endDate) {
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        List<Payroll> payrolls = payrollService.getPayrollsByPeriod(startDate, endDate);
        return ResponseEntity.ok(payrolls.stream()
                .filter(p -> p.getEmployee().getId().equals(employee.getId()))
                .toList());
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PAYROLL_OFFICER', 'HR_MANAGER')")
    public ResponseEntity<List<Payroll>> getEmployeePayrolls(@PathVariable Long employeeId) {
        Employee employee = employeeService.findById(employeeId);
        List<Payroll> payrolls = payrollService.getEmployeePayrolls(employee);
        return ResponseEntity.ok(payrolls);
    }
    
    @GetMapping("/employee/{employeeId}/year")
    @PreAuthorize("hasAnyRole('ADMIN', 'PAYROLL_OFFICER', 'HR_MANAGER')")
    public ResponseEntity<List<Payroll>> getEmployeePayrollForYear(@PathVariable Long employeeId,
                                                                @RequestParam int year) {
        Employee employee = employeeService.findById(employeeId);
        List<Payroll> payrolls = payrollService.getEmployeePayrollsByYear(employee, year);
        return ResponseEntity.ok(payrolls);
    }
    
    @GetMapping("/period")
    @PreAuthorize("hasAnyRole('ADMIN', 'PAYROLL_OFFICER')")
    public ResponseEntity<List<Payroll>> getPayrollsForPeriod(@RequestParam LocalDate startDate,
                                                               @RequestParam LocalDate endDate) {
        List<Payroll> payrolls = payrollService.getPayrollsByPeriod(startDate, endDate);
        return ResponseEntity.ok(payrolls);
    }
    
    @GetMapping("/year/{year}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PAYROLL_OFFICER')")
    public ResponseEntity<List<Payroll>> getPayrollsByYear(@PathVariable int year) {
        List<Payroll> payrolls = payrollService.getPayrollsByYear(year);
        return ResponseEntity.ok(payrolls);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePayroll(@PathVariable Long id) {
        payrollService.deletePayroll(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/generate-payrun")
    @PreAuthorize("hasAnyRole('ADMIN', 'PAYROLL_OFFICER')")
    public ResponseEntity<Map<String, Object>> generatePayrun(@RequestBody Map<String, Object> request) {
        try {
            int month = Integer.parseInt(request.get("month").toString());
            int year = Integer.parseInt(request.get("year").toString());
            
            // Get all active employees
            List<Employee> employees = employeeService.getAllActiveEmployees();
            
            // Calculate start and end dates for the month
            LocalDate startDate = LocalDate.of(year, month + 1, 1); // month is 0-indexed from frontend
            LocalDate endDate = startDate.plusMonths(1).minusDays(1);
            
            int successCount = 0;
            int failureCount = 0;
            
            // Generate payroll for each employee
            for (Employee employee : employees) {
                try {
                    payrollService.generatePayroll(employee, startDate, endDate);
                    successCount++;
                } catch (Exception e) {
                    failureCount++;
                    System.err.println("Failed to generate payroll for employee: " + employee.getEmployeeCode() + " - " + e.getMessage());
                }
            }
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Payrun generated successfully",
                "totalEmployees", employees.size(),
                "successCount", successCount,
                "failureCount", failureCount
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Failed to generate payrun: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'PAYROLL_OFFICER')")
    public ResponseEntity<byte[]> exportPayroll(@RequestParam int month, @RequestParam int year) {
        try {
            // Calculate start and end dates for the month
            LocalDate startDate = LocalDate.of(year, month + 1, 1); // month is 0-indexed from frontend
            LocalDate endDate = startDate.plusMonths(1).minusDays(1);
            
            // Get payrolls for the period
            List<Payroll> payrolls = payrollService.getPayrollsByPeriod(startDate, endDate);
            
            // Create CSV content
            StringBuilder csv = new StringBuilder();
            csv.append("Employee ID,Employee Name,Email,Department,Basic Salary,HRA,Transport,Medical,Other Allowances,Bonus,Gross Salary,PF,Professional Tax,Income Tax,Other Deductions,Total Deductions,Net Salary,Month\n");
            
            for (Payroll payroll : payrolls) {
                Employee emp = payroll.getEmployee();
                csv.append(String.format("%s,%s %s,%s,%s,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%s\n",
                    emp.getEmployeeCode(),
                    emp.getFirstName(),
                    emp.getLastName(),
                    emp.getEmail(),
                    emp.getDepartment() != null ? emp.getDepartment().getName() : "N/A",
                    payroll.getBasicSalary(),
                    payroll.getHra() != null ? payroll.getHra() : 0.0,
                    payroll.getTransportAllowance() != null ? payroll.getTransportAllowance() : 0.0,
                    payroll.getMedicalAllowance() != null ? payroll.getMedicalAllowance() : 0.0,
                    payroll.getOtherAllowances() != null ? payroll.getOtherAllowances() : 0.0,
                    payroll.getBonus() != null ? payroll.getBonus() : 0.0,
                    payroll.getGrossSalary(),
                    payroll.getProvidentFund() != null ? payroll.getProvidentFund() : 0.0,
                    payroll.getProfessionalTax() != null ? payroll.getProfessionalTax() : 0.0,
                    payroll.getIncomeTax() != null ? payroll.getIncomeTax() : 0.0,
                    payroll.getOtherDeductions() != null ? payroll.getOtherDeductions() : 0.0,
                    payroll.getTotalDeductions(),
                    payroll.getNetSalary(),
                    payroll.getSalaryMonth()
                ));
            }
            
            byte[] csvBytes = csv.toString().getBytes();
            
            return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=payroll_" + year + "_" + (month + 1) + ".csv")
                .body(csvBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
