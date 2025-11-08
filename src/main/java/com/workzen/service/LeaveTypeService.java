package com.workzen.service;

import com.workzen.entity.LeaveType;
import com.workzen.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveTypeService {
    
    private final LeaveTypeRepository leaveTypeRepository;
    
    public LeaveType createLeaveType(LeaveType leaveType) {
        if (leaveTypeRepository.existsByName(leaveType.getName())) {
            throw new RuntimeException("Leave type with name '" + leaveType.getName() + "' already exists");
        }
        return leaveTypeRepository.save(leaveType);
    }
    
    public LeaveType updateLeaveType(Long id, LeaveType leaveTypeDetails) {
        LeaveType leaveType = findById(id);
        
        if (!leaveType.getName().equals(leaveTypeDetails.getName()) && 
            leaveTypeRepository.existsByName(leaveTypeDetails.getName())) {
            throw new RuntimeException("Leave type with name '" + leaveTypeDetails.getName() + "' already exists");
        }
        
        leaveType.setName(leaveTypeDetails.getName());
        leaveType.setDescription(leaveTypeDetails.getDescription());
        leaveType.setMaxDaysPerYear(leaveTypeDetails.getMaxDaysPerYear());
        leaveType.setRequiresApproval(leaveTypeDetails.getRequiresApproval());
        leaveType.setIsPaid(leaveTypeDetails.getIsPaid());
        leaveType.setIsActive(leaveTypeDetails.getIsActive());
        
        return leaveTypeRepository.save(leaveType);
    }
    
    public LeaveType findById(Long id) {
        return leaveTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave type not found with id: " + id));
    }
    
    public LeaveType findByName(String name) {
        return leaveTypeRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Leave type not found with name: " + name));
    }
    
    public List<LeaveType> findAll() {
        return leaveTypeRepository.findAll();
    }
    
    public List<LeaveType> findAllActive() {
        return leaveTypeRepository.findByIsActiveTrue();
    }
    
    public void deleteLeaveType(Long id) {
        LeaveType leaveType = findById(id);
        leaveTypeRepository.delete(leaveType);
    }
    
    public void deactivateLeaveType(Long id) {
        LeaveType leaveType = findById(id);
        leaveType.setIsActive(false);
        leaveTypeRepository.save(leaveType);
    }
    
    public void activateLeaveType(Long id) {
        LeaveType leaveType = findById(id);
        leaveType.setIsActive(true);
        leaveTypeRepository.save(leaveType);
    }
}
