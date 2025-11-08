package com.workzen.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "payrolls")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Payroll extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    @Column(name = "salary_month", nullable = false)
    private LocalDate salaryMonth;
    
    // Earnings
    @Column(name = "basic_salary", nullable = false)
    private Double basicSalary;
    
    @Column(name = "hra")
    private Double hra;
    
    @Column(name = "transport_allowance")
    private Double transportAllowance;
    
    @Column(name = "medical_allowance")
    private Double medicalAllowance;
    
    @Column(name = "other_allowances")
    private Double otherAllowances;
    
    @Column(name = "bonus")
    private Double bonus;
    
    @Column(name = "gross_salary", nullable = false)
    private Double grossSalary;
    
    // Deductions
    @Column(name = "provident_fund")
    private Double providentFund;
    
    @Column(name = "professional_tax")
    private Double professionalTax;
    
    @Column(name = "income_tax")
    private Double incomeTax;
    
    @Column(name = "other_deductions")
    private Double otherDeductions;
    
    @Column(name = "total_deductions", nullable = false)
    private Double totalDeductions;
    
    @Column(name = "net_salary", nullable = false)
    private Double netSalary;
    
    // Attendance info
    @Column(name = "days_worked")
    private Integer daysWorked;
    
    @Column(name = "days_on_leave")
    private Integer daysOnLeave;
    
    @Column(name = "days_absent")
    private Integer daysAbsent;
    
    // Processing info
    @Column(name = "is_processed")
    @Builder.Default
    private Boolean isProcessed = false;
    
    @Column(name = "processed_date")
    private LocalDate processedDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private Employee processedBy;
    
    @Column(name = "payslip_url")
    private String payslipUrl;
}

