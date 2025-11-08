package com.workzen.repository;

import com.workzen.entity.Performance;
import com.workzen.entity.Employee;
import com.workzen.enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PerformanceRepository extends JpaRepository<Performance, Long> {
    
    List<Performance> findByEmployeeOrderByReviewDateDesc(Employee employee);
    
    Page<Performance> findByEmployeeOrderByReviewDateDesc(Employee employee, Pageable pageable);
    
    List<Performance> findByReviewerOrderByReviewDateDesc(Employee reviewer);
    
    List<Performance> findByStatus(ReviewStatus status);
    
    List<Performance> findByEmployeeAndStatus(Employee employee, ReviewStatus status);
    
    @Query("SELECT p FROM Performance p WHERE p.employee.manager = :manager ORDER BY p.reviewDate DESC")
    List<Performance> findByManager(@Param("manager") Employee manager);
    
    @Query("SELECT p FROM Performance p " +
           "WHERE p.employee = :employee " +
           "AND p.reviewPeriodStart >= :startDate " +
           "AND p.reviewPeriodEnd <= :endDate")
    List<Performance> findByEmployeeAndPeriod(@Param("employee") Employee employee, 
                                                @Param("startDate") LocalDate startDate, 
                                                @Param("endDate") LocalDate endDate);
    
    @Query("SELECT p FROM Performance p " +
           "LEFT JOIN FETCH p.employee " +
           "LEFT JOIN FETCH p.reviewer " +
           "WHERE p.id = :id")
    Performance findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT AVG(p.overallRating) FROM Performance p " +
           "WHERE p.employee = :employee " +
           "AND p.status = 'COMPLETED'")
    Double getAverageRatingByEmployee(@Param("employee") Employee employee);
    
    @Query("SELECT p FROM Performance p WHERE YEAR(p.reviewDate) = :year ORDER BY p.reviewDate DESC")
    List<Performance> findByYear(@Param("year") int year);
    
    @Query("SELECT p FROM Performance p WHERE p.employee = :employee AND YEAR(p.reviewDate) = :year ORDER BY p.reviewDate DESC")
    List<Performance> findByEmployeeAndYear(@Param("employee") Employee employee, @Param("year") int year);
    
    @Query("SELECT p FROM Performance p WHERE p.reviewDate BETWEEN :startDate AND :endDate ORDER BY p.reviewDate DESC")
    List<Performance> findByReviewDateBetweenOrderByReviewDateDesc(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
