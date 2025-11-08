package com.workzen.service;

import com.workzen.entity.Payroll;
import com.workzen.entity.Employee;
import com.workzen.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PayrollService {
    
    private final PayrollRepository payrollRepository;
    
    public Payroll generatePayroll(Employee employee, LocalDate payPeriodStart, LocalDate payPeriodEnd) {
        // Check if payroll already exists for this period
        // Check if payroll already exists for this month
        // Note: Using salaryMonth field instead of separate start/end dates
        
        // Calculate payroll components
        double basicSalary = employee.getSalary() != null ? employee.getSalary() : 0.0;
        double grossPay = calculateGrossPay(basicSalary);
        double taxDeduction = calculateTax(grossPay);
        double pfDeduction = calculatePF(basicSalary);
        double totalDeductions = taxDeduction + pfDeduction;
        double netPay = grossPay - totalDeductions;
        
        Payroll payroll = Payroll.builder()
                .employee(employee)
                .salaryMonth(payPeriodStart)
                .basicSalary(basicSalary)
                .grossSalary(grossPay)
                .providentFund(pfDeduction)
                .incomeTax(taxDeduction)
                .totalDeductions(totalDeductions)
                .netSalary(netPay)
                .processedDate(LocalDate.now())
                .isProcessed(true)
                .build();
        
        return payrollRepository.save(payroll);
    }
    
    public Payroll updatePayroll(Long id, Payroll payrollDetails) {
        Payroll payroll = findById(id);
        
        payroll.setBasicSalary(payrollDetails.getBasicSalary());
        payroll.setHra(payrollDetails.getHra());
        payroll.setTransportAllowance(payrollDetails.getTransportAllowance());
        payroll.setMedicalAllowance(payrollDetails.getMedicalAllowance());
        payroll.setOtherAllowances(payrollDetails.getOtherAllowances());
        payroll.setBonus(payrollDetails.getBonus());
        payroll.setProvidentFund(payrollDetails.getProvidentFund());
        payroll.setIncomeTax(payrollDetails.getIncomeTax());
        payroll.setProfessionalTax(payrollDetails.getProfessionalTax());
        payroll.setOtherDeductions(payrollDetails.getOtherDeductions());
        
        // Recalculate totals
        double grossPay = payroll.getBasicSalary() + 
                         (payroll.getHra() != null ? payroll.getHra() : 0) +
                         (payroll.getTransportAllowance() != null ? payroll.getTransportAllowance() : 0) +
                         (payroll.getMedicalAllowance() != null ? payroll.getMedicalAllowance() : 0) +
                         (payroll.getOtherAllowances() != null ? payroll.getOtherAllowances() : 0) +
                         (payroll.getBonus() != null ? payroll.getBonus() : 0);
        
        double totalDeductions = (payroll.getProvidentFund() != null ? payroll.getProvidentFund() : 0) + 
                                (payroll.getIncomeTax() != null ? payroll.getIncomeTax() : 0) +
                                (payroll.getProfessionalTax() != null ? payroll.getProfessionalTax() : 0) +
                                (payroll.getOtherDeductions() != null ? payroll.getOtherDeductions() : 0);
        
        payroll.setGrossSalary(grossPay);
        payroll.setTotalDeductions(totalDeductions);
        payroll.setNetSalary(grossPay - totalDeductions);
        
        return payrollRepository.save(payroll);
    }
    
    public Payroll findById(Long id) {
        return payrollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payroll not found with id: " + id));
    }
    
    public List<Payroll> getEmployeePayrolls(Employee employee) {
        return payrollRepository.findByEmployeeOrderBySalaryMonthDesc(employee);
    }
    
    public Page<Payroll> getEmployeePayrolls(Employee employee, Pageable pageable) {
        return payrollRepository.findByEmployeeOrderBySalaryMonthDesc(employee, pageable);
    }
    
    public List<Payroll> getPayrollsByPeriod(LocalDate startDate, LocalDate endDate) {
        return payrollRepository.findBySalaryMonthRange(startDate, endDate);
    }
    
    public List<Payroll> getPayrollsByYear(int year) {
        return payrollRepository.findByYear(year);
    }
    
    public List<Payroll> getEmployeePayrollsByYear(Employee employee, int year) {
        return payrollRepository.findByEmployeeAndYear(employee, year);
    }
    
    public Double getTotalPayrollCost(LocalDate startDate, LocalDate endDate) {
        Double total = payrollRepository.getTotalPayrollForPeriod(startDate, endDate);
        return total != null ? total : 0.0;
    }
    
    public void deletePayroll(Long id) {
        Payroll payroll = findById(id);
        payrollRepository.delete(payroll);
    }
    
    // Bulk payroll generation for all active employees
    public List<Payroll> generateMonthlyPayroll(LocalDate payPeriodStart, LocalDate payPeriodEnd, List<Employee> employees) {
        return employees.stream()
                .map(employee -> {
                    try {
                        return generatePayroll(employee, payPeriodStart, payPeriodEnd);
                    } catch (RuntimeException e) {
                        System.err.println("Failed to generate payroll for employee: " + employee.getEmployeeCode() + " - " + e.getMessage());
                        return null;
                    }
                })
                .filter(payroll -> payroll != null)
                .toList();
    }
    
    private double calculateGrossPay(double basicSalary) {
        // Basic calculation - can be enhanced with allowances, overtime, etc.
        double hra = basicSalary * 0.4; // 40% HRA
        double da = basicSalary * 0.1;  // 10% DA
        return basicSalary + hra + da;
    }
    
    private double calculateTax(double grossPay) {
        if (grossPay <= 250000) return 0;
        if (grossPay <= 500000) return (grossPay - 250000) * 0.05;
        if (grossPay <= 1000000) return 12500 + (grossPay - 500000) * 0.20;
        return 112500 + (grossPay - 1000000) * 0.30;
    }
    
    private double calculatePF(double basicSalary) {
        // PF calculation - 12% of basic salary (capped at 15000)
        double pfBase = Math.min(basicSalary, 15000);
        return pfBase * 0.12;
    }
}
