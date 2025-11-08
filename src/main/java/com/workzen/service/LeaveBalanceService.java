package com.workzen.service;

import com.workzen.entity.Employee;
import com.workzen.entity.LeaveBalance;
import com.workzen.entity.LeaveType;
import com.workzen.repository.LeaveBalanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveBalanceService {
    
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeService leaveTypeService;
    
    public LeaveBalance createLeaveBalance(Employee employee, LeaveType leaveType, Integer year, Double totalAllocated) {
        if (leaveBalanceRepository.existsByEmployeeAndLeaveTypeAndYear(employee, leaveType, year)) {
            throw new RuntimeException("Leave balance already exists for this employee, leave type, and year");
        }
        
        LeaveBalance leaveBalance = LeaveBalance.builder()
                .employee(employee)
                .leaveType(leaveType)
                .year(year)
                .totalAllocated(totalAllocated)
                .used(0.0)
                .balance(totalAllocated)
                .build();
        
        return leaveBalanceRepository.save(leaveBalance);
    }
    
    public LeaveBalance updateLeaveBalance(Long id, Double totalAllocated) {
        LeaveBalance leaveBalance = findById(id);
        leaveBalance.setTotalAllocated(totalAllocated);
        leaveBalance.setBalance(totalAllocated - leaveBalance.getUsed());
        return leaveBalanceRepository.save(leaveBalance);
    }
    
    public void deductLeaveBalance(Employee employee, LeaveType leaveType, Integer year, Double days) {
        LeaveBalance leaveBalance = leaveBalanceRepository
                .findByEmployeeAndLeaveTypeAndYear(employee, leaveType, year)
                .orElseThrow(() -> new RuntimeException("Leave balance not found"));
        
        if (leaveBalance.getBalance() < days) {
            throw new RuntimeException("Insufficient leave balance. Available: " + leaveBalance.getBalance() + ", Requested: " + days);
        }
        
        leaveBalance.setUsed(leaveBalance.getUsed() + days);
        leaveBalance.setBalance(leaveBalance.getBalance() - days);
        leaveBalanceRepository.save(leaveBalance);
    }
    
    public void restoreLeaveBalance(Employee employee, LeaveType leaveType, Integer year, Double days) {
        LeaveBalance leaveBalance = leaveBalanceRepository
                .findByEmployeeAndLeaveTypeAndYear(employee, leaveType, year)
                .orElseThrow(() -> new RuntimeException("Leave balance not found"));
        
        leaveBalance.setUsed(leaveBalance.getUsed() - days);
        leaveBalance.setBalance(leaveBalance.getBalance() + days);
        leaveBalanceRepository.save(leaveBalance);
    }
    
    public LeaveBalance findById(Long id) {
        return leaveBalanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave balance not found with id: " + id));
    }
    
    public LeaveBalance getLeaveBalance(Employee employee, LeaveType leaveType, Integer year) {
        return leaveBalanceRepository
                .findByEmployeeAndLeaveTypeAndYear(employee, leaveType, year)
                .orElseThrow(() -> new RuntimeException("Leave balance not found"));
    }
    
    public List<LeaveBalance> getEmployeeLeaveBalances(Employee employee, Integer year) {
        return leaveBalanceRepository.findByEmployeeAndYearWithLeaveType(employee, year);
    }
    
    public List<LeaveBalance> getAllEmployeeLeaveBalances(Employee employee) {
        return leaveBalanceRepository.findByEmployee(employee);
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void initializeLeaveBalancesForEmployee(Employee employee, Integer year) {
        List<LeaveType> activeLeaveTypes = leaveTypeService.findAllActive();
        
        for (LeaveType leaveType : activeLeaveTypes) {
            try {
                if (!leaveBalanceRepository.existsByEmployeeAndLeaveTypeAndYear(employee, leaveType, year)) {
                    Double allocation = leaveType.getMaxDaysPerYear() != null ? 
                                        leaveType.getMaxDaysPerYear().doubleValue() : 20.0;
                    createLeaveBalance(employee, leaveType, year, allocation);
                }
            } catch (Exception e) {
                // Log and continue with next leave type
                System.err.println("Failed to initialize leave balance for " + leaveType.getName() + ": " + e.getMessage());
            }
        }
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void initializeLeaveBalancesForCurrentYear(Employee employee) {
        Integer currentYear = LocalDate.now().getYear();
        initializeLeaveBalancesForEmployee(employee, currentYear);
    }
}
