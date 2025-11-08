package com.workzen.controller;

import com.workzen.entity.Employee;
import com.workzen.entity.LeaveBalance;
import com.workzen.entity.LeaveType;
import com.workzen.service.EmployeeService;
import com.workzen.service.LeaveBalanceService;
import com.workzen.service.LeaveTypeService;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/api/leave-balances")
@RequiredArgsConstructor
public class LeaveBalanceController {
    
    private final LeaveBalanceService leaveBalanceService;
    private final EmployeeService employeeService;
    private final LeaveTypeService leaveTypeService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<LeaveBalance> createLeaveBalance(@RequestBody Map<String, Object> request) {
        Long employeeId = Long.valueOf(request.get("employeeId").toString());
        Long leaveTypeId = Long.valueOf(request.get("leaveTypeId").toString());
        Integer year = Integer.valueOf(request.get("year").toString());
        Double totalAllocated = Double.valueOf(request.get("totalAllocated").toString());
        
        Employee employee = employeeService.findById(employeeId);
        LeaveType leaveType = leaveTypeService.findById(leaveTypeId);
        
        LeaveBalance created = leaveBalanceService.createLeaveBalance(employee, leaveType, year, totalAllocated);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<LeaveBalance> updateLeaveBalance(@PathVariable Long id, @RequestBody Map<String, Double> request) {
        Double totalAllocated = request.get("totalAllocated");
        LeaveBalance updated = leaveBalanceService.updateLeaveBalance(id, totalAllocated);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveBalance> getLeaveBalanceById(@PathVariable Long id) {
        LeaveBalance leaveBalance = leaveBalanceService.findById(id);
        return ResponseEntity.ok(leaveBalance);
    }
    
    @GetMapping("/my-balances")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LeaveBalance>> getMyLeaveBalances(@AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = (Employee) userDetails;
        Integer currentYear = LocalDate.now().getYear();
        List<LeaveBalance> balances = leaveBalanceService.getEmployeeLeaveBalances(employee, currentYear);
        return ResponseEntity.ok(balances);
    }
    
    @GetMapping("/employee/{employeeId}/year/{year}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<LeaveBalance>> getEmployeeLeaveBalances(@PathVariable Long employeeId, @PathVariable Integer year) {
        Employee employee = employeeService.findById(employeeId);
        List<LeaveBalance> balances = leaveBalanceService.getEmployeeLeaveBalances(employee, year);
        return ResponseEntity.ok(balances);
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<LeaveBalance>> getAllEmployeeLeaveBalances(@PathVariable Long employeeId) {
        Employee employee = employeeService.findById(employeeId);
        List<LeaveBalance> balances = leaveBalanceService.getAllEmployeeLeaveBalances(employee);
        return ResponseEntity.ok(balances);
    }
    
    @PostMapping("/employee/{employeeId}/initialize/{year}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Void> initializeLeaveBalances(@PathVariable Long employeeId, @PathVariable Integer year) {
        Employee employee = employeeService.findById(employeeId);
        leaveBalanceService.initializeLeaveBalancesForEmployee(employee, year);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/employee/{employeeId}/initialize-current-year")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Void> initializeLeaveBalancesForCurrentYear(@PathVariable Long employeeId) {
        Employee employee = employeeService.findById(employeeId);
        leaveBalanceService.initializeLeaveBalancesForCurrentYear(employee);
        return ResponseEntity.ok().build();
    }
}
