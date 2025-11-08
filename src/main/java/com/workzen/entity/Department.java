package com.workzen.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "departments")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Department extends BaseEntity {
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(length = 255)
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
