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
    public ResponseEntity<List<Payroll>> getMyPayrolls(@AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = (Employee) userDetails;
        List<Payroll> payrolls = payrollService.getEmployeePayrolls(employee);
        return ResponseEntity.ok(payrolls);
    }
    
    @GetMapping("/my-payrolls/paginated")
    public ResponseEntity<Page<Payroll>> getMyPayrollsPaginated(@AuthenticationPrincipal UserDetails userDetails,
                                                                 Pageable pageable) {
        Employee employee = (Employee) userDetails;
        Page<Payroll> payrolls = payrollService.getEmployeePayrolls(employee, pageable);
        return ResponseEntity.ok(payrolls);
    }
    
    @GetMapping("/my-payrolls/period")
    public ResponseEntity<List<Payroll>> getMyPayrollForPeriod(@AuthenticationPrincipal UserDetails userDetails,
                                                          @RequestParam LocalDate startDate,
                                                          @RequestParam LocalDate endDate) {
        Employee employee = (Employee) userDetails;
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
}
