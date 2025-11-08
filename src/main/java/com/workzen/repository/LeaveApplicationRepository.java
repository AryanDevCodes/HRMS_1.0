package com.workzen.repository;

import com.workzen.entity.LeaveApplication;
import com.workzen.entity.Employee;
import com.workzen.entity.LeaveType;
import com.workzen.enums.LeaveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
    
    List<LeaveApplication> findByEmployeeOrderByCreatedAtDesc(Employee employee);
    
    Page<LeaveApplication> findByEmployeeOrderByCreatedAtDesc(Employee employee, Pageable pageable);
    
    List<LeaveApplication> findByStatusOrderByCreatedAtDesc(LeaveStatus status);
    
    List<LeaveApplication> findByEmployeeAndStatus(Employee employee, LeaveStatus status);
    
    @Query("SELECT la FROM LeaveApplication la WHERE la.employee.manager = :manager AND la.status = 'PENDING'")
    List<LeaveApplication> findPendingApplicationsByManager(@Param("manager") Employee manager);
    
    @Query("SELECT la FROM LeaveApplication la " +
           "WHERE la.employee = :employee " +
           "AND la.status = 'APPROVED' " +
           "AND ((la.startDate BETWEEN :startDate AND :endDate) " +
           "OR (la.endDate BETWEEN :startDate AND :endDate))")
    List<LeaveApplication> findOverlappingLeaves(@Param("employee") Employee employee, 
                                                   @Param("startDate") LocalDate startDate, 
                                                   @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(la.numberOfDays) FROM LeaveApplication la " +
           "WHERE la.employee = :employee " +
           "AND la.leaveType = :leaveType " +
           "AND YEAR(la.startDate) = :year " +
           "AND la.status = 'APPROVED'")
    Double getTotalApprovedLeavesByEmployeeAndTypeAndYear(@Param("employee") Employee employee, 
                                                            @Param("leaveType") LeaveType leaveType, 
                                                            @Param("year") int year);
    
    @Query("SELECT la FROM LeaveApplication la " +
           "LEFT JOIN FETCH la.employee " +
           "LEFT JOIN FETCH la.leaveType " +
           "WHERE la.id = :id")
    LeaveApplication findByIdWithDetails(@Param("id") Long id);
}
