package com.workzen.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leave_balances", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "leave_type_id", "year"})
})
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalance extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;
    
    @Column(nullable = false)
    private Integer year;
    
    @Column(name = "total_allocated", nullable = false)
    @Builder.Default
    private Double totalAllocated = 0.0;
    
    @Column(name = "used", nullable = false)
    @Builder.Default
    private Double used = 0.0;
    
    @Column(name = "balance", nullable = false)
    @Builder.Default
    private Double balance = 0.0;
}
