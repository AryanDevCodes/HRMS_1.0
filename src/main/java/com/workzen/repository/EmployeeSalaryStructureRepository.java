package com.workzen.repository;

import com.workzen.entity.Employee;
import com.workzen.entity.EmployeeSalaryStructure;
import com.workzen.entity.SalaryComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeSalaryStructureRepository extends JpaRepository<EmployeeSalaryStructure, Long> {
    
    List<EmployeeSalaryStructure> findByEmployeeAndIsActiveTrueOrderBySalaryComponentDisplayOrder(Employee employee);
    
    @Query("SELECT ess FROM EmployeeSalaryStructure ess WHERE ess.employee = :employee " +
           "AND ess.isActive = true " +
           "AND ess.effectiveFrom <= :date " +
           "AND (ess.effectiveTo IS NULL OR ess.effectiveTo >= :date)")
    List<EmployeeSalaryStructure> findActiveComponentsForEmployeeOnDate(
            @Param("employee") Employee employee, 
            @Param("date") LocalDate date);
    
    Optional<EmployeeSalaryStructure> findByEmployeeAndSalaryComponentAndIsActiveTrue(
            Employee employee, 
            SalaryComponent salaryComponent);
}
