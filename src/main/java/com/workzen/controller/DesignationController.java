package com.workzen.controller;

import com.workzen.entity.Designation;
import com.workzen.service.DesignationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/designations")
@RequiredArgsConstructor
public class DesignationController {
    
    private final DesignationService designationService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Designation> createDesignation(@RequestBody Designation designation) {
        Designation created = designationService.createDesignation(designation);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Designation> updateDesignation(@PathVariable Long id, @RequestBody Designation designation) {
        Designation updated = designationService.updateDesignation(id, designation);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Designation> getDesignationById(@PathVariable Long id) {
        Designation designation = designationService.findById(id);
        return ResponseEntity.ok(designation);
    }
    
    @GetMapping
    public ResponseEntity<List<Designation>> getAllDesignations() {
        List<Designation> designations = designationService.findAll();
        return ResponseEntity.ok(designations);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Designation>> getActiveDesignations() {
        List<Designation> designations = designationService.findAllActive();
        return ResponseEntity.ok(designations);
    }
    
    @GetMapping("/active/ordered")
    public ResponseEntity<List<Designation>> getActiveDesignationsOrderedByLevel() {
        List<Designation> designations = designationService.findAllActiveOrderedByLevel();
        return ResponseEntity.ok(designations);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDesignation(@PathVariable Long id) {
        designationService.deleteDesignation(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Void> deactivateDesignation(@PathVariable Long id) {
        designationService.deactivateDesignation(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Void> activateDesignation(@PathVariable Long id) {
        designationService.activateDesignation(id);
        return ResponseEntity.ok().build();
    }
}
