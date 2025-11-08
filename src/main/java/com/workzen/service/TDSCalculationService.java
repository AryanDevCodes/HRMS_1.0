package com.workzen.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Service to calculate TDS (Tax Deducted at Source) based on Indian Income Tax Slabs
 * Using Old Tax Regime for FY 2024-25 as default
 */
@Service
public class TDSCalculationService {
    
    // Old Tax Regime Slabs (Annual)
    private static final double SLAB_1_LIMIT = 250000;    // Up to 2.5L - 0%
    private static final double SLAB_2_LIMIT = 500000;    // 2.5L to 5L - 5%
    private static final double SLAB_3_LIMIT = 1000000;   // 5L to 10L - 20%
    // Above 10L - 30%
    
    private static final double SLAB_1_RATE = 0.0;
    private static final double SLAB_2_RATE = 0.05;
    private static final double SLAB_3_RATE = 0.20;
    private static final double SLAB_4_RATE = 0.30;
    
    // Cess on total tax
    private static final double CESS_RATE = 0.04;  // 4% Health & Education Cess
    
    // Standard Deduction (FY 2024-25)
    private static final double STANDARD_DEDUCTION = 50000;
    
    /**
     * Calculate monthly TDS based on annual taxable income
     * 
     * @param annualGrossSalary Annual gross salary
     * @param annualDeductions Annual deductions (80C, 80D, etc.)
     * @return Monthly TDS amount
     */
    public double calculateMonthlyTDS(double annualGrossSalary, double annualDeductions) {
        // Calculate taxable income
        double taxableIncome = annualGrossSalary - STANDARD_DEDUCTION - annualDeductions;
        
        // If taxable income is below exemption limit, no TDS
        if (taxableIncome <= SLAB_1_LIMIT) {
            return 0.0;
        }
        
        double totalTax = calculateIncomeTax(taxableIncome);
        
        // Add cess
        totalTax = totalTax + (totalTax * CESS_RATE);
        
        // Convert to monthly
        double monthlyTDS = totalTax / 12.0;
        
        // Round to 2 decimal places
        return BigDecimal.valueOf(monthlyTDS)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
    
    /**
     * Calculate income tax based on old tax regime slabs
     */
    private double calculateIncomeTax(double taxableIncome) {
        double tax = 0.0;
        
        if (taxableIncome <= SLAB_1_LIMIT) {
            return 0.0;
        }
        
        // Tax on Slab 2 (2.5L to 5L)
        if (taxableIncome > SLAB_1_LIMIT && taxableIncome <= SLAB_2_LIMIT) {
            tax = (taxableIncome - SLAB_1_LIMIT) * SLAB_2_RATE;
        } else if (taxableIncome > SLAB_2_LIMIT) {
            tax = (SLAB_2_LIMIT - SLAB_1_LIMIT) * SLAB_2_RATE;
        }
        
        // Tax on Slab 3 (5L to 10L)
        if (taxableIncome > SLAB_2_LIMIT && taxableIncome <= SLAB_3_LIMIT) {
            tax += (taxableIncome - SLAB_2_LIMIT) * SLAB_3_RATE;
        } else if (taxableIncome > SLAB_3_LIMIT) {
            tax += (SLAB_3_LIMIT - SLAB_2_LIMIT) * SLAB_3_RATE;
        }
        
        // Tax on Slab 4 (Above 10L)
        if (taxableIncome > SLAB_3_LIMIT) {
            tax += (taxableIncome - SLAB_3_LIMIT) * SLAB_4_RATE;
        }
        
        return tax;
    }
    
    /**
     * Calculate TDS for an employee based on monthly salary
     * Assumes standard 80C deduction of 1.5L annually
     * 
     * @param monthlySalary Monthly gross salary
     * @return Monthly TDS amount
     */
    public double calculateTDSFromMonthlySalary(double monthlySalary) {
        double annualSalary = monthlySalary * 12;
        // Assume standard 80C deduction of 1.5L
        double assumed80CDeduction = 150000;
        
        return calculateMonthlyTDS(annualSalary, assumed80CDeduction);
    }
    
    /**
     * Calculate effective tax rate based on annual income
     */
    public double getEffectiveTaxRate(double annualGrossSalary) {
        double annualDeductions = 150000; // Standard 80C
        double monthlyTDS = calculateMonthlyTDS(annualGrossSalary, annualDeductions);
        double annualTDS = monthlyTDS * 12;
        
        if (annualGrossSalary == 0) {
            return 0.0;
        }
        
        return (annualTDS / annualGrossSalary) * 100;
    }
    
    /**
     * Get tax breakdown for display purposes
     */
    public TaxBreakdown getTaxBreakdown(double annualGrossSalary, double annualDeductions) {
        double taxableIncome = annualGrossSalary - STANDARD_DEDUCTION - annualDeductions;
        double incomeTax = calculateIncomeTax(taxableIncome);
        double cess = incomeTax * CESS_RATE;
        double totalTax = incomeTax + cess;
        
        return TaxBreakdown.builder()
                .annualGrossSalary(annualGrossSalary)
                .standardDeduction(STANDARD_DEDUCTION)
                .otherDeductions(annualDeductions)
                .taxableIncome(Math.max(0, taxableIncome))
                .incomeTax(incomeTax)
                .cess(cess)
                .totalAnnualTax(totalTax)
                .monthlyTDS(totalTax / 12)
                .effectiveTaxRate(annualGrossSalary > 0 ? (totalTax / annualGrossSalary) * 100 : 0)
                .build();
    }
    
    @lombok.Data
    @lombok.Builder
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class TaxBreakdown {
        private double annualGrossSalary;
        private double standardDeduction;
        private double otherDeductions;
        private double taxableIncome;
        private double incomeTax;
        private double cess;
        private double totalAnnualTax;
        private double monthlyTDS;
        private double effectiveTaxRate;
    }
}
