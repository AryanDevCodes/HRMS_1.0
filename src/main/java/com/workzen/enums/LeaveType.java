package com.workzen.enums;

public enum LeaveType {
    UNPAID_LEAVE("Unpaid Leave"),
    SICK_LEAVE("Sick Leave"),
    PAID_TIME_OFF("Paid Time Off");

    private String displayName;

    LeaveType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
