package com.workzen.enums;

public enum Role {
    // Administrative Roles
    ADMIN("Administrator"),
    
    // HR Department Roles
    HR_MANAGER("HR Manager"),

    PAYROLL_OFFICER("Payroll Officer");
    
    private String displayName;
    
    Role(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    
}
