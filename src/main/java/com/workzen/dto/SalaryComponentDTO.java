package com.workzen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryComponentDTO {
    private String name;
    private String code;
    private String type; // EARNING or DEDUCTION
    private Double amount;
    private Double percentage;
    private Boolean isTaxable;
    private String description;
}
