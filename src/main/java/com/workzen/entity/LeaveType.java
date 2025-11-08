package com.workzen.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leave_types")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LeaveType extends BaseEntity {
    
    @Column(nullable = false, length = 50, unique = true)
    private String name;
    
    @Column(length = 255)
    private String description;
    
    @Column(name = "max_days_per_year")
    private Integer maxDaysPerYear;
    
    @Column(name = "requires_approval")
    @Builder.Default
    private Boolean requiresApproval = true;
    
    @Column(name = "is_paid")
    @Builder.Default
    private Boolean isPaid = true;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
