package com.workzen.service;

import com.workzen.entity.Designation;
import com.workzen.repository.DesignationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DesignationService {
    
    private final DesignationRepository designationRepository;
    
    public Designation createDesignation(Designation designation) {
        if (designationRepository.existsByName(designation.getName())) {
            throw new RuntimeException("Designation with name '" + designation.getName() + "' already exists");
        }
        return designationRepository.save(designation);
    }
    
    public Designation updateDesignation(Long id, Designation designationDetails) {
        Designation designation = findById(id);
        
        if (!designation.getName().equals(designationDetails.getName()) && 
            designationRepository.existsByName(designationDetails.getName())) {
            throw new RuntimeException("Designation with name '" + designationDetails.getName() + "' already exists");
        }
        
        designation.setName(designationDetails.getName());
        designation.setDescription(designationDetails.getDescription());
        designation.setLevel(designationDetails.getLevel());
        designation.setIsActive(designationDetails.getIsActive());
        
        return designationRepository.save(designation);
    }
    
    public Designation findById(Long id) {
        return designationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Designation not found with id: " + id));
    }
    
    public Designation findByName(String name) {
        return designationRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Designation not found with name: " + name));
    }
    
    public List<Designation> findAll() {
        return designationRepository.findAll();
    }
    
    public List<Designation> findAllActive() {
        return designationRepository.findByIsActiveTrue();
    }
    
    public List<Designation> findAllActiveOrderedByLevel() {
        return designationRepository.findByIsActiveTrueOrderByLevelAsc();
    }
    
    public void deleteDesignation(Long id) {
        Designation designation = findById(id);
        designationRepository.delete(designation);
    }
    
    public void deactivateDesignation(Long id) {
        Designation designation = findById(id);
        designation.setIsActive(false);
        designationRepository.save(designation);
    }
    
    public void activateDesignation(Long id) {
        Designation designation = findById(id);
        designation.setIsActive(true);
        designationRepository.save(designation);
    }
}
