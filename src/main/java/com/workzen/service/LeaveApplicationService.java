package com.workzen.service;

import com.workzen.entity.Employee;
import com.workzen.entity.LeaveApplication;
import com.workzen.entity.LeaveApplicationLog;
import com.workzen.entity.LeaveType;
import com.workzen.enums.LeaveStatus;
import com.workzen.repository.LeaveApplicationRepository;
import com.workzen.repository.LeaveApplicationLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveApplicationService {
    
    private final LeaveApplicationRepository leaveApplicationRepository;
    private final LeaveBalanceService leaveBalanceService;
    private final LeaveApplicationLogRepository leaveApplicationLogRepository;
    
    public LeaveApplication applyLeave(Employee employee, LeaveType leaveType, 
                                        LocalDate startDate, LocalDate endDate, 
                                        String reason, Boolean isHalfDay) {
        // Validate dates
        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("End date cannot be before start date");
        }
        
        // Check for overlapping leaves
        List<LeaveApplication> overlappingLeaves = leaveApplicationRepository
                .findOverlappingLeaves(employee, startDate, endDate);
        if (!overlappingLeaves.isEmpty()) {
            throw new RuntimeException("Leave application overlaps with existing approved leave");
        }
        
        // Calculate number of days
        Double numberOfDays = (double) ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (isHalfDay != null && isHalfDay) {
            numberOfDays = 0.5;
        }
        
        // Check leave balance
        Integer year = startDate.getYear();
        try {
            var leaveBalance = leaveBalanceService.getLeaveBalance(employee, leaveType, year);
            if (leaveBalance.getBalance() < numberOfDays) {
                throw new RuntimeException("Insufficient leave balance. Available: " + 
                                         leaveBalance.getBalance() + " days");
            }
        } catch (RuntimeException e) {
            // Initialize leave balance if not exists
            leaveBalanceService.initializeLeaveBalancesForEmployee(employee, year);
        }
        
        LeaveApplication leaveApplication = LeaveApplication.builder()
                .employee(employee)
                .leaveType(leaveType)
                .startDate(startDate)
                .endDate(endDate)
                .numberOfDays(numberOfDays)
                .reason(reason)
                .status(LeaveStatus.PENDING)
                .isHalfDay(isHalfDay != null ? isHalfDay : false)
                .build();
        
        LeaveApplication saved = leaveApplicationRepository.save(leaveApplication);
        
        // Log the submission
        createLog(saved, null, LeaveStatus.PENDING, employee, "Leave application submitted", "SUBMITTED");
        
        return saved;
    }
    
    public LeaveApplication approveLeave(Long leaveId, Employee approver) {
        LeaveApplication leaveApplication = findById(leaveId);
        
        if (leaveApplication.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("Only pending leave applications can be approved");
        }
        
        LeaveStatus previousStatus = leaveApplication.getStatus();
        
        // Deduct from leave balance
        leaveBalanceService.deductLeaveBalance(
                leaveApplication.getEmployee(),
                leaveApplication.getLeaveType(),
                leaveApplication.getStartDate().getYear(),
                leaveApplication.getNumberOfDays()
        );
        
        leaveApplication.setStatus(LeaveStatus.APPROVED);
        leaveApplication.setApprovedBy(approver);
        leaveApplication.setApprovedAt(LocalDate.now());
        
        LeaveApplication saved = leaveApplicationRepository.save(leaveApplication);
        
        // Log the approval
        createLog(saved, previousStatus, LeaveStatus.APPROVED, approver, 
                 "Leave application approved by " + approver.getFirstName() + " " + approver.getLastName(), 
                 "APPROVED");
        
        return saved;
    }
    
    public LeaveApplication rejectLeave(Long leaveId, Employee approver, String rejectionReason) {
        LeaveApplication leaveApplication = findById(leaveId);
        
        if (leaveApplication.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("Only pending leave applications can be rejected");
        }
        
        LeaveStatus previousStatus = leaveApplication.getStatus();
        
        leaveApplication.setStatus(LeaveStatus.REJECTED);
        leaveApplication.setApprovedBy(approver);
        leaveApplication.setApprovedAt(LocalDate.now());
        leaveApplication.setRejectionReason(rejectionReason);
        
        LeaveApplication saved = leaveApplicationRepository.save(leaveApplication);
        
        // Log the rejection
        createLog(saved, previousStatus, LeaveStatus.REJECTED, approver, 
                 rejectionReason != null ? rejectionReason : "Leave application rejected", 
                 "REJECTED");
        
        return saved;
    }
    
    public LeaveApplication cancelLeave(Long leaveId, Employee employee) {
        LeaveApplication leaveApplication = findById(leaveId);
        
        if (!leaveApplication.getEmployee().getId().equals(employee.getId())) {
            throw new RuntimeException("You can only cancel your own leave applications");
        }
        
        if (leaveApplication.getStatus() == LeaveStatus.CANCELLED) {
            throw new RuntimeException("Leave application is already cancelled");
        }
        
        LeaveStatus previousStatus = leaveApplication.getStatus();
        
        // Restore leave balance if it was approved
        if (leaveApplication.getStatus() == LeaveStatus.APPROVED) {
            leaveBalanceService.restoreLeaveBalance(
                    leaveApplication.getEmployee(),
                    leaveApplication.getLeaveType(),
                    leaveApplication.getStartDate().getYear(),
                    leaveApplication.getNumberOfDays()
            );
        }
        
        leaveApplication.setStatus(LeaveStatus.CANCELLED);
        LeaveApplication saved = leaveApplicationRepository.save(leaveApplication);
        
        // Log the cancellation
        createLog(saved, previousStatus, LeaveStatus.CANCELLED, employee, 
                 "Leave application cancelled by employee", 
                 "CANCELLED");
        
        return saved;
    }
    
    public LeaveApplication findById(Long id) {
        return leaveApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave application not found with id: " + id));
    }
    
    public LeaveApplication findByIdWithDetails(Long id) {
        return leaveApplicationRepository.findByIdWithDetails(id);
    }
    
    public List<LeaveApplication> getEmployeeLeaves(Employee employee) {
        return leaveApplicationRepository.findByEmployeeOrderByCreatedAtDesc(employee);
    }
    
    public Page<LeaveApplication> getEmployeeLeaves(Employee employee, Pageable pageable) {
        return leaveApplicationRepository.findByEmployeeOrderByCreatedAtDesc(employee, pageable);
    }
    
    public List<LeaveApplication> getPendingLeaves() {
        return leaveApplicationRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.PENDING);
    }
    
    public List<LeaveApplication> getPendingApprovalsForManager(Employee manager) {
        // If the user is ADMIN or HR_MANAGER, show all pending leaves
        if (manager.getRole().name().equals("ADMIN") || manager.getRole().name().equals("HR_MANAGER")) {
            return leaveApplicationRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.PENDING);
        }
        // Otherwise, show only direct reports' pending leaves
        return leaveApplicationRepository.findPendingApplicationsByManager(manager);
    }
    
    public List<LeaveApplication> getLeavesByStatus(LeaveStatus status) {
        return leaveApplicationRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    public List<LeaveApplication> getAllLeaveRequests() {
        return leaveApplicationRepository.findAll();
    }
    
    public List<Map<String, Object>> getLeaveApplicationLogs(Long leaveApplicationId) {
        List<LeaveApplicationLog> logs = leaveApplicationLogRepository.findByLeaveApplicationIdOrderByChangedAtDesc(leaveApplicationId);
        
        return logs.stream().map(log -> {
            Map<String, Object> logMap = new HashMap<>();
            logMap.put("id", log.getId());
            logMap.put("previousStatus", log.getPreviousStatus());
            logMap.put("newStatus", log.getNewStatus());
            logMap.put("actionType", log.getActionType());
            logMap.put("remarks", log.getRemarks());
            logMap.put("changedAt", log.getChangedAt());
            
            if (log.getChangedBy() != null) {
                Map<String, Object> changedBy = new HashMap<>();
                changedBy.put("id", log.getChangedBy().getId());
                changedBy.put("firstName", log.getChangedBy().getFirstName());
                changedBy.put("lastName", log.getChangedBy().getLastName());
                changedBy.put("email", log.getChangedBy().getEmail());
                logMap.put("changedBy", changedBy);
            }
            
            return logMap;
        }).collect(Collectors.toList());
    }
    
    private void createLog(LeaveApplication leaveApplication, LeaveStatus previousStatus, 
                          LeaveStatus newStatus, Employee changedBy, String remarks, String actionType) {
        LeaveApplicationLog log = new LeaveApplicationLog();
        log.setLeaveApplication(leaveApplication);
        log.setPreviousStatus(previousStatus);
        log.setNewStatus(newStatus);
        log.setChangedBy(changedBy);
        log.setRemarks(remarks);
        log.setActionType(actionType);
        
        leaveApplicationLogRepository.save(log);
    }
}
