package com.workzen.repository;

import com.workzen.entity.Payroll;
import com.workzen.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    
    List<Payroll> findByEmployeeOrderBySalaryMonthDesc(Employee employee);
    
    Page<Payroll> findByEmployeeOrderBySalaryMonthDesc(Employee employee, Pageable pageable);
    
    Optional<Payroll> findByEmployeeAndSalaryMonth(Employee employee, LocalDate salaryMonth);
    
    List<Payroll> findBySalaryMonthBetweenOrderBySalaryMonthDesc(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT p FROM Payroll p WHERE p.salaryMonth >= :startDate AND p.salaryMonth <= :endDate")
    List<Payroll> findBySalaryMonthRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(p.netSalary) FROM Payroll p WHERE p.salaryMonth >= :startDate AND p.salaryMonth <= :endDate")
    Double getTotalPayrollForPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT p FROM Payroll p WHERE YEAR(p.salaryMonth) = :year ORDER BY p.salaryMonth DESC")
    List<Payroll> findByYear(@Param("year") int year);
    
    @Query("SELECT p FROM Payroll p WHERE p.employee = :employee AND YEAR(p.salaryMonth) = :year ORDER BY p.salaryMonth DESC")
    List<Payroll> findByEmployeeAndYear(@Param("employee") Employee employee, @Param("year") int year);
}
