package com.workzen.repository;

import com.workzen.entity.Employee;
import com.workzen.entity.LeaveBalance;
import com.workzen.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    
    Optional<LeaveBalance> findByEmployeeAndLeaveTypeAndYear(Employee employee, LeaveType leaveType, Integer year);
    
    List<LeaveBalance> findByEmployeeAndYear(Employee employee, Integer year);
    
    List<LeaveBalance> findByEmployee(Employee employee);
    
    @Query("SELECT lb FROM LeaveBalance lb " +
           "LEFT JOIN FETCH lb.leaveType " +
           "WHERE lb.employee = :employee AND lb.year = :year")
    List<LeaveBalance> findByEmployeeAndYearWithLeaveType(@Param("employee") Employee employee, @Param("year") Integer year);
    
    boolean existsByEmployeeAndLeaveTypeAndYear(Employee employee, LeaveType leaveType, Integer year);
}
