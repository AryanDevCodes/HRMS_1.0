package com.workzen.service;

import com.workzen.entity.Employee;
import com.workzen.entity.LeaveApplication;
import com.workzen.entity.LeaveType;
import com.workzen.enums.LeaveStatus;
import com.workzen.repository.LeaveApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveApplicationService {
    
    private final LeaveApplicationRepository leaveApplicationRepository;
    private final LeaveBalanceService leaveBalanceService;
    
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
        
        return leaveApplicationRepository.save(leaveApplication);
    }
    
    public LeaveApplication approveLeave(Long leaveId, Employee approver) {
        LeaveApplication leaveApplication = findById(leaveId);
        
        if (leaveApplication.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("Only pending leave applications can be approved");
        }
        
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
        
        return leaveApplicationRepository.save(leaveApplication);
    }
    
    public LeaveApplication rejectLeave(Long leaveId, Employee approver, String rejectionReason) {
        LeaveApplication leaveApplication = findById(leaveId);
        
        if (leaveApplication.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("Only pending leave applications can be rejected");
        }
        
        leaveApplication.setStatus(LeaveStatus.REJECTED);
        leaveApplication.setApprovedBy(approver);
        leaveApplication.setApprovedAt(LocalDate.now());
        leaveApplication.setRejectionReason(rejectionReason);
        
        return leaveApplicationRepository.save(leaveApplication);
    }
    
    public LeaveApplication cancelLeave(Long leaveId, Employee employee) {
        LeaveApplication leaveApplication = findById(leaveId);
        
        if (!leaveApplication.getEmployee().getId().equals(employee.getId())) {
            throw new RuntimeException("You can only cancel your own leave applications");
        }
        
        if (leaveApplication.getStatus() == LeaveStatus.CANCELLED) {
            throw new RuntimeException("Leave application is already cancelled");
        }
        
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
        return leaveApplicationRepository.save(leaveApplication);
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
        return leaveApplicationRepository.findPendingApplicationsByManager(manager);
    }
    
    public List<LeaveApplication> getLeavesByStatus(LeaveStatus status) {
        return leaveApplicationRepository.findByStatusOrderByCreatedAtDesc(status);
    }
}
