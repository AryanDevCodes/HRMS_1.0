package com.workzen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryBreakdownDTO {
    private Long employeeId;
    private String employeeName;
    private Double monthlyWage;
    private Double yearlyWage;
    private List<SalaryComponentDTO> earnings;
    private List<SalaryComponentDTO> deductions;
    private Double grossSalary;
    private Double totalDeductions;
    private Double netSalary;
    private Double employerContributions; // PF employer contribution, etc.
}
