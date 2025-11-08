package com.workzen.entity;

import com.workzen.enums.LeaveStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "leave_application_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeaveApplicationLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_application_id", nullable = false)
    private LeaveApplication leaveApplication;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private LeaveStatus previousStatus;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private LeaveStatus newStatus;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_id")
    private Employee changedBy;
    
    @Column(length = 1000)
    private String remarks;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime changedAt;
    
    @Column(name = "action_type", length = 50)
    private String actionType; // SUBMITTED, APPROVED, REJECTED, CANCELLED
}
