package com.workzen.entity;

import com.workzen.enums.SalaryComponentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "salary_components")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryComponent extends BaseEntity {
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "code", unique = true, nullable = false, length = 50)
    private String code; // e.g., BASIC_SALARY, HRA, PF_EMPLOYEE
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private SalaryComponentType type; // EARNING or DEDUCTION
    
    @Column(name = "is_percentage")
    @Builder.Default
    private Boolean isPercentage = false;
    
    @Column(name = "percentage_value")
    private Double percentageValue; // e.g., 50.00 for 50% HRA
    
    @Column(name = "fixed_amount")
    private Double fixedAmount; // For fixed components
    
    @Column(name = "based_on_component_code", length = 50)
    private String basedOnComponentCode; // e.g., HRA is based on BASIC_SALARY
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "is_taxable")
    @Builder.Default
    private Boolean isTaxable = true;
    
    @Column(name = "display_order")
    private Integer displayOrder;
    
    @Column(name = "is_mandatory")
    @Builder.Default
    private Boolean isMandatory = false;
    
    @Column(name = "max_limit")
    private Double maxLimit; // For capped components like PF
}
