package com.workzen.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.workzen.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "date"})
})
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attendance extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Employee employee;
    
    @Column(name = "date", nullable = false)
    private LocalDate date;
    
    @Column(name = "check_in")
    private LocalDateTime checkIn;
    
    @Column(name = "check_out")
    private LocalDateTime checkOut;
    
    @Column(name = "total_hours")
    private Double totalHours;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.PRESENT;
    
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;
    
    @Column(name = "is_overtime")
    @Builder.Default
    private Boolean isOvertime = false;
    
    @Column(name = "overtime_hours")
    private Double overtimeHours;
}
