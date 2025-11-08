package com.workzen.enums;

public enum ReviewStatus {
    DRAFT("Draft"),
    SUBMITTED("Submitted"),
    COMPLETED("Completed"),
    ACKNOWLEDGED("Acknowledged");
    
    private final String displayName;
    
    ReviewStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
