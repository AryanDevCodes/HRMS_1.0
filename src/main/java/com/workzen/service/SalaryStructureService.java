package com.workzen.service;

import com.workzen.dto.SalaryBreakdownDTO;
import com.workzen.dto.SalaryComponentDTO;
import com.workzen.entity.Employee;
import com.workzen.entity.EmployeeSalaryStructure;
import com.workzen.entity.SalaryComponent;
import com.workzen.enums.SalaryComponentType;
import com.workzen.repository.EmployeeSalaryStructureRepository;
import com.workzen.repository.SalaryComponentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SalaryStructureService {

    private final SalaryComponentRepository salaryComponentRepository;
    private final EmployeeSalaryStructureRepository employeeSalaryStructureRepository;
    private final TDSCalculationService tdsCalculationService;

    @Transactional(readOnly = true)
    public SalaryBreakdownDTO calculateEmployeeSalary(Employee employee) {
        return calculateEmployeeSalaryOnDate(employee, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public SalaryBreakdownDTO calculateEmployeeSalaryOnDate(Employee employee, LocalDate date) {
        // Get active salary structure for the employee on the given date
        List<EmployeeSalaryStructure> structures = employeeSalaryStructureRepository
                .findActiveComponentsForEmployeeOnDate(employee, date);

        // If no specific structure exists, use default components based on employee's salary
        if (structures.isEmpty()) {
            return calculateDefaultSalaryBreakdown(employee);
        }

        // Map to store calculated amounts by component code
        Map<String, Double> componentAmounts = new HashMap<>();
        List<SalaryComponentDTO> earnings = new ArrayList<>();
        List<SalaryComponentDTO> deductions = new ArrayList<>();
        double employerContributions = 0.0;

        // First pass: Calculate fixed amounts and percentages based on employee salary
        for (EmployeeSalaryStructure structure : structures) {
            SalaryComponent component = structure.getSalaryComponent();
            double amount;

            // Special handling for TDS - calculate based on annual taxable income
            if ("TDS".equals(component.getCode())) {
                amount = tdsCalculationService.calculateTDSFromMonthlySalary(employee.getSalary());
            } else if (component.getIsPercentage()) {
                // If based on another component, calculate from that
                if (component.getBasedOnComponentCode() != null && !component.getBasedOnComponentCode().isEmpty()) {
                    Double baseAmount = componentAmounts.get(component.getBasedOnComponentCode());
                    if (baseAmount != null) {
                        amount = baseAmount * component.getPercentageValue() / 100.0;
                    } else {
                        // Base component not yet calculated, use employee salary as fallback
                        amount = employee.getSalary() * component.getPercentageValue() / 100.0;
                    }
                } else {
                    // Calculate percentage of employee's total salary
                    amount = employee.getSalary() * component.getPercentageValue() / 100.0;
                }

                // Apply max limit if specified
                if (component.getMaxLimit() != null && amount > component.getMaxLimit()) {
                    amount = component.getMaxLimit();
                }
            } else {
                // Fixed amount
                amount = component.getFixedAmount();
            }

            // Store calculated amount
            componentAmounts.put(component.getCode(), amount);

            // Create DTO
            SalaryComponentDTO dto = SalaryComponentDTO.builder()
                    .name(component.getName())
                    .code(component.getCode())
                    .type(component.getType().name())
                    .amount(Math.round(amount * 100.0) / 100.0) // Round to 2 decimal places
                    .percentage(component.getIsPercentage() ? component.getPercentageValue() : null)
                    .isTaxable(component.getIsTaxable())
                    .description(component.getDescription())
                    .build();

            // Categorize by type
            if (component.getType() == SalaryComponentType.EARNING) {
                earnings.add(dto);
            } else {
                deductions.add(dto);
                // Check if this is employer contribution (e.g., PF_EMPLOYER)
                if (component.getCode().contains("EMPLOYER")) {
                    employerContributions += amount;
                }
            }
        }

        // Calculate totals
        double grossSalary = earnings.stream()
                .mapToDouble(SalaryComponentDTO::getAmount)
                .sum();

        double totalDeductions = deductions.stream()
                .filter(d -> !d.getCode().contains("EMPLOYER")) // Exclude employer contributions from employee deductions
                .mapToDouble(SalaryComponentDTO::getAmount)
                .sum();

        double netSalary = grossSalary - totalDeductions;

        return SalaryBreakdownDTO.builder()
                .employeeId(employee.getId())
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .monthlyWage(employee.getSalary())
                .yearlyWage(employee.getSalary() * 12)
                .earnings(earnings)
                .deductions(deductions)
                .grossSalary(Math.round(grossSalary * 100.0) / 100.0)
                .totalDeductions(Math.round(totalDeductions * 100.0) / 100.0)
                .netSalary(Math.round(netSalary * 100.0) / 100.0)
                .employerContributions(Math.round(employerContributions * 100.0) / 100.0)
                .build();
    }

    private SalaryBreakdownDTO calculateDefaultSalaryBreakdown(Employee employee) {
        // Get all active default salary components
        List<SalaryComponent> defaultComponents = salaryComponentRepository
                .findByIsActiveTrueOrderByDisplayOrder();

        if (defaultComponents.isEmpty()) {
            // Return basic breakdown if no components defined
            return createBasicBreakdown(employee);
        }

        Map<String, Double> componentAmounts = new HashMap<>();
        List<SalaryComponentDTO> earnings = new ArrayList<>();
        List<SalaryComponentDTO> deductions = new ArrayList<>();
        double employerContributions = 0.0;

        // Calculate amounts for each component
        for (SalaryComponent component : defaultComponents) {
            double amount;

            // Special handling for TDS - calculate based on annual taxable income
            if ("TDS".equals(component.getCode())) {
                amount = tdsCalculationService.calculateTDSFromMonthlySalary(employee.getSalary());
            } else if (component.getIsPercentage()) {
                if (component.getBasedOnComponentCode() != null && !component.getBasedOnComponentCode().isEmpty()) {
                    Double baseAmount = componentAmounts.get(component.getBasedOnComponentCode());
                    if (baseAmount != null) {
                        amount = baseAmount * component.getPercentageValue() / 100.0;
                    } else {
                        amount = employee.getSalary() * component.getPercentageValue() / 100.0;
                    }
                } else {
                    amount = employee.getSalary() * component.getPercentageValue() / 100.0;
                }

                if (component.getMaxLimit() != null && amount > component.getMaxLimit()) {
                    amount = component.getMaxLimit();
                }
            } else {
                amount = component.getFixedAmount();
            }

            componentAmounts.put(component.getCode(), amount);

            SalaryComponentDTO dto = SalaryComponentDTO.builder()
                    .name(component.getName())
                    .code(component.getCode())
                    .type(component.getType().name())
                    .amount(Math.round(amount * 100.0) / 100.0)
                    .percentage(component.getIsPercentage() ? component.getPercentageValue() : null)
                    .isTaxable(component.getIsTaxable())
                    .description(component.getDescription())
                    .build();

            if (component.getType() == SalaryComponentType.EARNING) {
                earnings.add(dto);
            } else {
                deductions.add(dto);
                if (component.getCode().contains("EMPLOYER")) {
                    employerContributions += amount;
                }
            }
        }

        double grossSalary = earnings.stream().mapToDouble(SalaryComponentDTO::getAmount).sum();
        double totalDeductions = deductions.stream()
                .filter(d -> !d.getCode().contains("EMPLOYER"))
                .mapToDouble(SalaryComponentDTO::getAmount)
                .sum();
        double netSalary = grossSalary - totalDeductions;

        return SalaryBreakdownDTO.builder()
                .employeeId(employee.getId())
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .monthlyWage(employee.getSalary())
                .yearlyWage(employee.getSalary() * 12)
                .earnings(earnings)
                .deductions(deductions)
                .grossSalary(Math.round(grossSalary * 100.0) / 100.0)
                .totalDeductions(Math.round(totalDeductions * 100.0) / 100.0)
                .netSalary(Math.round(netSalary * 100.0) / 100.0)
                .employerContributions(Math.round(employerContributions * 100.0) / 100.0)
                .build();
    }

    private SalaryBreakdownDTO createBasicBreakdown(Employee employee) {
        List<SalaryComponentDTO> earnings = new ArrayList<>();
        earnings.add(SalaryComponentDTO.builder()
                .name("Basic Salary")
                .code("BASIC_SALARY")
                .type("EARNING")
                .amount(employee.getSalary())
                .build());

        return SalaryBreakdownDTO.builder()
                .employeeId(employee.getId())
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .monthlyWage(employee.getSalary())
                .yearlyWage(employee.getSalary() * 12)
                .earnings(earnings)
                .deductions(new ArrayList<>())
                .grossSalary(employee.getSalary())
                .totalDeductions(0.0)
                .netSalary(employee.getSalary())
                .employerContributions(0.0)
                .build();
    }
}
