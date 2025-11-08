package com.workzen.enums;

public enum AttendanceStatus {
    PRESENT("Present"),
    ABSENT("Absent"),
    HALF_DAY("Half Day"),
    WORK_FROM_HOME("Work From Home"),
    ON_LEAVE("On Leave"),
    HOLIDAY("Holiday"),
    WEEKEND("Weekend");
    
    private final String displayName;
    
    AttendanceStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
