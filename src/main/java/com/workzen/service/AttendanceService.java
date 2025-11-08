package com.workzen.service;

import com.workzen.entity.Attendance;
import com.workzen.entity.Employee;
import com.workzen.entity.LeaveApplication;
import com.workzen.enums.AttendanceStatus;
import com.workzen.enums.LeaveStatus;
import com.workzen.repository.AttendanceRepository;
import com.workzen.repository.LeaveApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final LeaveApplicationRepository leaveApplicationRepository;
    
    public Attendance checkIn(Employee employee, LocalDateTime checkInTime) {
        LocalDate date = checkInTime.toLocalDate();
        
        if (attendanceRepository.existsByEmployeeAndDate(employee, date)) {
            throw new RuntimeException("Attendance already marked for today");
        }
        
        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(date)
                .checkIn(checkInTime)
                .status(AttendanceStatus.PRESENT)
                .build();
        
        return attendanceRepository.save(attendance);
    }
    
    /**
     * Automatically mark attendance when user logs in
     * If attendance already exists for today, just return it
     */
    public Attendance markAttendanceOnLogin(Employee employee) {
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        
        // Check if attendance already exists for today
        return attendanceRepository.findByEmployeeAndDate(employee, today)
                .orElseGet(() -> {
                    // Create new attendance record with check-in time
                    Attendance attendance = Attendance.builder()
                            .employee(employee)
                            .date(today)
                            .checkIn(now)
                            .status(AttendanceStatus.PRESENT)
                            .remarks("Auto-marked on login")
                            .build();
                    return attendanceRepository.save(attendance);
                });
    }
    
    public Attendance checkOut(Employee employee, LocalDateTime checkOutTime) {
        LocalDate date = checkOutTime.toLocalDate();
        
        Attendance attendance = attendanceRepository.findByEmployeeAndDate(employee, date)
                .orElseThrow(() -> new RuntimeException("No check-in found for today"));
        
        if (attendance.getCheckOut() != null) {
            throw new RuntimeException("Already checked out for today");
        }
        
        attendance.setCheckOut(checkOutTime);
        
        // Calculate total hours
        if (attendance.getCheckIn() != null) {
            Duration duration = Duration.between(attendance.getCheckIn(), checkOutTime);
            double hours = duration.toMinutes() / 60.0;
            attendance.setTotalHours(hours);
            
            // Check for overtime (assuming 8 hours is standard)
            if (hours > 8) {
                attendance.setIsOvertime(true);
                attendance.setOvertimeHours(hours - 8);
            }
        }
        
        return attendanceRepository.save(attendance);
    }
    
    public Attendance markAttendance(Employee employee, LocalDate date, 
                                      AttendanceStatus status, String remarks) {
        if (attendanceRepository.existsByEmployeeAndDate(employee, date)) {
            throw new RuntimeException("Attendance already marked for this date");
        }
        
        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(date)
                .status(status)
                .remarks(remarks)
                .build();
        
        return attendanceRepository.save(attendance);
    }
    
    public Attendance updateAttendance(Long id, AttendanceStatus status, String remarks) {
        Attendance attendance = findById(id);
        attendance.setStatus(status);
        attendance.setRemarks(remarks);
        return attendanceRepository.save(attendance);
    }
    
    public Attendance findById(Long id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found with id: " + id));
    }
    
    public Attendance getTodayAttendance(Employee employee) {
        return attendanceRepository.findByEmployeeAndDate(employee, LocalDate.now())
                .orElse(null);
    }
    
    public List<Attendance> getEmployeeAttendance(Employee employee, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByEmployeeAndDateBetween(employee, startDate, endDate);
    }
    
    public List<Attendance> getMonthlyAttendance(Employee employee, int year, int month) {
        return attendanceRepository.findByEmployeeAndYearAndMonth(employee, year, month);
    }
    
    public Page<Attendance> getEmployeeAttendance(Employee employee, Pageable pageable) {
        return attendanceRepository.findByEmployee(employee, pageable);
    }
    
    public long getAttendanceCount(Employee employee, AttendanceStatus status, 
                                    LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.countByEmployeeAndStatusAndDateBetween(
                employee, status, startDate, endDate);
    }
    
    public Double getTotalWorkedHours(Employee employee, LocalDate startDate, LocalDate endDate) {
        Double totalHours = attendanceRepository.getTotalHoursByEmployeeAndDateBetween(
                employee, startDate, endDate);
        return totalHours != null ? totalHours : 0.0;
    }
    
    public void deleteAttendance(Long id) {
        Attendance attendance = findById(id);
        attendanceRepository.delete(attendance);
    }
    
    public boolean hasApprovedLeaveToday(Employee employee) {
        LocalDate today = LocalDate.now();
        List<LeaveApplication> approvedLeaves = leaveApplicationRepository
                .findByEmployeeAndStatus(employee, LeaveStatus.APPROVED);
        
        return approvedLeaves.stream()
                .anyMatch(leave -> !today.isBefore(leave.getStartDate()) && 
                                 !today.isAfter(leave.getEndDate()));
    }
}
