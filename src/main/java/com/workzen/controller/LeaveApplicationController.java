package com.workzen.controller;

import com.workzen.entity.Employee;
import com.workzen.entity.LeaveApplication;
import com.workzen.entity.LeaveType;
import com.workzen.enums.LeaveStatus;
import com.workzen.service.EmployeeService;
import com.workzen.service.LeaveApplicationService;
import com.workzen.service.LeaveTypeService;
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
@RequestMapping("/api/leave-applications")
@RequiredArgsConstructor
public class LeaveApplicationController {
    
    private final LeaveApplicationService leaveApplicationService;
    private final EmployeeService employeeService;
    private final LeaveTypeService leaveTypeService;
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveApplication> applyLeave(@AuthenticationPrincipal UserDetails userDetails,
                                                        @RequestBody Map<String, Object> request) {
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        Long leaveTypeId = Long.valueOf(request.get("leaveTypeId").toString());
        LocalDate startDate = LocalDate.parse(request.get("startDate").toString());
        LocalDate endDate = LocalDate.parse(request.get("endDate").toString());
        String reason = request.get("reason").toString();
        Boolean isHalfDay = request.containsKey("isHalfDay") ? 
                            Boolean.valueOf(request.get("isHalfDay").toString()) : false;
        
        LeaveType leaveType = leaveTypeService.findById(leaveTypeId);
        
        LeaveApplication created = leaveApplicationService.applyLeave(
                employee, leaveType, startDate, endDate, reason, isHalfDay);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<LeaveApplication> approveLeave(@PathVariable Long id,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        Employee approver = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        LeaveApplication approved = leaveApplicationService.approveLeave(id, approver);
        return ResponseEntity.ok(approved);
    }
    
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<LeaveApplication> rejectLeave(@PathVariable Long id,
                                                         @AuthenticationPrincipal UserDetails userDetails,
                                                         @RequestBody Map<String, String> request) {
        Employee approver = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        String rejectionReason = request.get("rejectionReason");
        LeaveApplication rejected = leaveApplicationService.rejectLeave(id, approver, rejectionReason);
        return ResponseEntity.ok(rejected);
    }
    
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveApplication> cancelLeave(@PathVariable Long id,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        LeaveApplication cancelled = leaveApplicationService.cancelLeave(id, employee);
        return ResponseEntity.ok(cancelled);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveApplication> getLeaveApplicationById(@PathVariable Long id) {
        LeaveApplication leaveApplication = leaveApplicationService.findByIdWithDetails(id);
        return ResponseEntity.ok(leaveApplication);
    }
    
    @GetMapping("/my-leaves")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LeaveApplication>> getMyLeaves(@AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        List<LeaveApplication> leaves = leaveApplicationService.getEmployeeLeaves(employee);
        return ResponseEntity.ok(leaves);
    }
    
    @GetMapping("/my-leaves/paginated")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<LeaveApplication>> getMyLeavesPaginated(@AuthenticationPrincipal UserDetails userDetails,
                                                                         Pageable pageable) {
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        Page<LeaveApplication> leaves = leaveApplicationService.getEmployeeLeaves(employee, pageable);
        return ResponseEntity.ok(leaves);
    }
    
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<LeaveApplication>> getPendingLeaves() {
        List<LeaveApplication> leaves = leaveApplicationService.getPendingLeaves();
        return ResponseEntity.ok(leaves);
    }
    
    @GetMapping("/pending-approvals")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LeaveApplication>> getPendingApprovals(@AuthenticationPrincipal UserDetails userDetails) {
        Employee manager = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        List<LeaveApplication> leaves = leaveApplicationService.getPendingApprovalsForManager(manager);
        return ResponseEntity.ok(leaves);
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<LeaveApplication>> getLeavesByStatus(@PathVariable LeaveStatus status) {
        List<LeaveApplication> leaves = leaveApplicationService.getLeavesByStatus(status);
        return ResponseEntity.ok(leaves);
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<LeaveApplication>> getEmployeeLeaves(@PathVariable Long employeeId) {
        Employee employee = employeeService.findById(employeeId);
        List<LeaveApplication> leaves = leaveApplicationService.getEmployeeLeaves(employee);
        return ResponseEntity.ok(leaves);
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<LeaveApplication>> getAllLeaveRequests() {
        List<LeaveApplication> leaves = leaveApplicationService.getAllLeaveRequests();
        return ResponseEntity.ok(leaves);
    }
    
    @GetMapping("/approved")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<LeaveApplication>> getApprovedLeaves() {
        List<LeaveApplication> leaves = leaveApplicationService.getLeavesByStatus(LeaveStatus.APPROVED);
        return ResponseEntity.ok(leaves);
    }
    
    @GetMapping("/rejected")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<LeaveApplication>> getRejectedLeaves() {
        List<LeaveApplication> leaves = leaveApplicationService.getLeavesByStatus(LeaveStatus.REJECTED);
        return ResponseEntity.ok(leaves);
    }
    
    @GetMapping("/logs/{leaveApplicationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getLeaveLogs(@PathVariable Long leaveApplicationId) {
        List<Map<String, Object>> logs = leaveApplicationService.getLeaveApplicationLogs(leaveApplicationId);
        return ResponseEntity.ok(logs);
    }
}
