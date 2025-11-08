package com.workzen.repository;

import com.workzen.entity.Department;
import com.workzen.entity.Employee;
import com.workzen.enums.EmployeeStatus;
import com.workzen.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    Optional<Employee> findByEmail(String email);
    
    Optional<Employee> findByEmployeeCode(String employeeCode);
    
    List<Employee> findByDepartment(Department department);
    
    List<Employee> findByRole(Role role);
    
    List<Employee> findByStatus(EmployeeStatus status);
    
    List<Employee> findByManager(Employee manager);
    
    Page<Employee> findByDepartmentAndStatus(Department department, EmployeeStatus status, Pageable pageable);
    
    List<Employee> findByIsActiveTrue();
    
    @Query("SELECT e FROM Employee e WHERE e.manager = :manager AND e.status = :status")
    List<Employee> findSubordinates(@Param("manager") Employee manager, @Param("status") EmployeeStatus status);
    
    @Query("SELECT e FROM Employee e WHERE " +
           "(LOWER(e.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Employee> searchEmployees(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT COUNT(e) FROM Employee e WHERE e.status = :status")
    long countByStatus(@Param("status") EmployeeStatus status);
    
    @Query("SELECT COUNT(e) FROM Employee e WHERE e.department = :department")
    long countByDepartment(@Param("department") Department department);
    
    boolean existsByEmail(String email);
    
    boolean existsByEmployeeCode(String employeeCode);
    
    boolean existsByPhone(String phone);
    
    long countByEmployeeCodeStartingWith(String prefix);
}

