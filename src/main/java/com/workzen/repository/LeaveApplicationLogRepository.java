package com.workzen.repository;

import com.workzen.entity.LeaveApplication;
import com.workzen.entity.LeaveApplicationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveApplicationLogRepository extends JpaRepository<LeaveApplicationLog, Long> {
    
    List<LeaveApplicationLog> findByLeaveApplicationOrderByChangedAtDesc(LeaveApplication leaveApplication);
    
    List<LeaveApplicationLog> findByLeaveApplicationIdOrderByChangedAtDesc(Long leaveApplicationId);
    
    List<LeaveApplicationLog> findByActionTypeOrderByChangedAtDesc(String actionType);
}
