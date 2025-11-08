package com.workzen.service;

import com.workzen.entity.Department;
import com.workzen.entity.Employee;
import com.workzen.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentService {
    
    private final DepartmentRepository departmentRepository;
    
    public Department createDepartment(Department department) {
        if (departmentRepository.existsByName(department.getName())) {
            throw new RuntimeException("Department with name '" + department.getName() + "' already exists");
        }
        return departmentRepository.save(department);
    }
    
    public Department updateDepartment(Long id, Department departmentDetails) {
        Department department = findById(id);
        
        if (!department.getName().equals(departmentDetails.getName()) && 
            departmentRepository.existsByName(departmentDetails.getName())) {
            throw new RuntimeException("Department with name '" + departmentDetails.getName() + "' already exists");
        }
        
        department.setName(departmentDetails.getName());
        department.setDescription(departmentDetails.getDescription());
        department.setManager(departmentDetails.getManager());
        department.setIsActive(departmentDetails.getIsActive());
        
        return departmentRepository.save(department);
    }
    
    public Department findById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
    }
    
    public Department findByIdWithManager(Long id) {
        return departmentRepository.findByIdWithManager(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
    }
    
    public Department findByName(String name) {
        return departmentRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Department not found with name: " + name));
    }
    
    public List<Department> findAll() {
        return departmentRepository.findAll();
    }
    
    public List<Department> findAllActive() {
        return departmentRepository.findByIsActiveTrue();
    }
    
    public void deleteDepartment(Long id) {
        Department department = findById(id);
        departmentRepository.delete(department);
    }
    
    public void deactivateDepartment(Long id) {
        Department department = findById(id);
        department.setIsActive(false);
        departmentRepository.save(department);
    }
    
    public void activateDepartment(Long id) {
        Department department = findById(id);
        department.setIsActive(true);
        departmentRepository.save(department);
    }
    
    public void setManager(Long departmentId, Employee manager) {
        Department department = findById(departmentId);
        department.setManager(manager);
        departmentRepository.save(department);
    }
}
