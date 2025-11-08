package com.workzen.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "designations")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Designation extends BaseEntity {
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(length = 255)
    private String description;
    
    @Column(name = "level")
    private Integer level; // Job level/hierarchy
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
