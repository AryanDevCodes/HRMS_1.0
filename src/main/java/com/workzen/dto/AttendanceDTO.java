package com.workzen.dto;

import com.workzen.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long id;
    private LocalDate date;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private Double totalHours;
    private AttendanceStatus status;
    private String remarks;
    private Boolean isOvertime;
    private Double overtimeHours;
    
    // Employee basic info (avoid full employee object)
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
}
