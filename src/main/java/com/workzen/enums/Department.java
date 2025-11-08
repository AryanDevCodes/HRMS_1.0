package com.workzen.enums;

public enum Department {
    HUMAN_RESOURCES("Human Resources"),
    INFORMATION_TECHNOLOGY("Information Technology"),
    FINANCE("Finance"),
    MARKETING("Marketing"),
    SALES("Sales"),
    OPERATIONS("Operations"),
    LEGAL("Legal"),
    ADMINISTRATION("Administration"),
    RESEARCH_DEVELOPMENT("Research & Development"),
    CUSTOMER_SERVICE("Customer Service"),
    QUALITY_ASSURANCE("Quality Assurance"),
    PROCUREMENT("Procurement");
    
    private final String displayName;
    
    Department(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}