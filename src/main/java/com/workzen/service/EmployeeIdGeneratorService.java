package com.workzen.service;

import com.workzen.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class EmployeeIdGeneratorService {
    
    private final EmployeeRepository employeeRepository;
    
    
    public String generateEmployeeId(String firstName, String lastName, LocalDate dateOfJoining) {
        String companyPrefix = "OI"; 
        
        String namePrefix = extractFirstTwoLetters(firstName) + extractFirstTwoLetters(lastName);
        
        String year = String.valueOf(dateOfJoining.getYear());
        
        String serialNumber = generateSerialNumber(companyPrefix + namePrefix + year);
        
        return companyPrefix + namePrefix + year + serialNumber;
    }
    
    
    private String extractFirstTwoLetters(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "XX"; // Default fallback
        }
        
        String cleanName = name.trim().replaceAll("[^a-zA-Z]", "").toUpperCase();
        
        if (cleanName.length() >= 2) {
            return cleanName.substring(0, 2);
        } else if (cleanName.length() == 1) {
            return cleanName + "X"; 
        } else {
            return "XX"; 
        }
    }
    
    private String generateSerialNumber(String prefix) {
        long count = employeeRepository.countByEmployeeCodeStartingWith(prefix);
        
        // Increment count and format as 4-digit number
        long nextSerial = count + 1;
        
        return String.format("%04d", nextSerial);
    }
    

    public boolean isValidEmployeeIdFormat(String employeeId) {
        if (employeeId == null || employeeId.length() != 12) {
            return false;
        }
        
        // Check format: OI + 4 letters + 4 digits + 4 digits
        return employeeId.matches("^OI[A-Z]{4}\\d{8}$");
    }
    
 
    public EmployeeIdInfo parseEmployeeId(String employeeId) {
        if (!isValidEmployeeIdFormat(employeeId)) {
            throw new IllegalArgumentException("Invalid employee ID format: " + employeeId);
        }
        
        String companyPrefix = employeeId.substring(0, 2); 
        String namePrefix = employeeId.substring(2, 6);    
        String year = employeeId.substring(6, 10);         
        String serialNumber = employeeId.substring(10);    
        
        return EmployeeIdInfo.builder()
                .companyPrefix(companyPrefix)
                .namePrefix(namePrefix)
                .year(Integer.parseInt(year))
                .serialNumber(Integer.parseInt(serialNumber))
                .build();
    }
    
    @lombok.Data
    @lombok.Builder
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class EmployeeIdInfo {
        private String companyPrefix;
        private String namePrefix;
        private int year;
        private int serialNumber;
    }
}
