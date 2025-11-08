package com.workzen.controller;

import com.workzen.entity.Attendance;
import com.workzen.entity.Employee;
import com.workzen.enums.AttendanceStatus;
import com.workzen.service.AttendanceService;
import com.workzen.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    
    private final AttendanceService attendanceService;
    private final EmployeeService employeeService;
    
    @PostMapping("/check-in")
    public ResponseEntity<Attendance> checkIn(@AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = (Employee) userDetails;
        Attendance attendance = attendanceService.checkIn(employee, LocalDateTime.now());
        return new ResponseEntity<>(attendance, HttpStatus.CREATED);
    }
    
    @PatchMapping("/check-out")
    public ResponseEntity<Attendance> checkOut(@AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = (Employee) userDetails;
        Attendance attendance = attendanceService.checkOut(employee, LocalDateTime.now());
        return ResponseEntity.ok(attendance);
    }
    
    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Attendance> markAttendance(@RequestBody Map<String, Object> request) {
        Long employeeId = Long.valueOf(request.get("employeeId").toString());
        LocalDate date = LocalDate.parse(request.get("date").toString());
        AttendanceStatus status = AttendanceStatus.valueOf(request.get("status").toString());
        String remarks = request.containsKey("remarks") ? request.get("remarks").toString() : null;
        
        Employee employee = employeeService.findById(employeeId);
        Attendance attendance = attendanceService.markAttendance(employee, date, status, remarks);
        return new ResponseEntity<>(attendance, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Attendance> updateAttendance(@PathVariable Long id,
                                                        @RequestBody Map<String, String> request) {
        AttendanceStatus status = AttendanceStatus.valueOf(request.get("status"));
        String remarks = request.get("remarks");
        Attendance updated = attendanceService.updateAttendance(id, status, remarks);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Attendance> getAttendanceById(@PathVariable Long id) {
        Attendance attendance = attendanceService.findById(id);
        return ResponseEntity.ok(attendance);
    }
    
    @GetMapping("/today")
    public ResponseEntity<Attendance> getTodayAttendance(@AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = (Employee) userDetails;
        Attendance attendance = attendanceService.getTodayAttendance(employee);
        return ResponseEntity.ok(attendance);
    }
    
    @GetMapping("/my-attendance")
    public ResponseEntity<List<Attendance>> getMyAttendance(@AuthenticationPrincipal UserDetails userDetails,
                                                             @RequestParam LocalDate startDate,
                                                             @RequestParam LocalDate endDate) {
        Employee employee = (Employee) userDetails;
        List<Attendance> attendance = attendanceService.getEmployeeAttendance(employee, startDate, endDate);
        return ResponseEntity.ok(attendance);
    }
    
    @GetMapping("/my-attendance/month")
    public ResponseEntity<List<Attendance>> getMyMonthlyAttendance(@AuthenticationPrincipal UserDetails userDetails,
                                                                     @RequestParam int year,
                                                                     @RequestParam int month) {
        Employee employee = (Employee) userDetails;
        List<Attendance> attendance = attendanceService.getMonthlyAttendance(employee, year, month);
        return ResponseEntity.ok(attendance);
    }
    
    @GetMapping("/my-attendance/paginated")
    public ResponseEntity<Page<Attendance>> getMyAttendancePaginated(@AuthenticationPrincipal UserDetails userDetails,
                                                                       Pageable pageable) {
        Employee employee = (Employee) userDetails;
        Page<Attendance> attendance = attendanceService.getEmployeeAttendance(employee, pageable);
        return ResponseEntity.ok(attendance);
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<Attendance>> getEmployeeAttendance(@PathVariable Long employeeId,
                                                                    @RequestParam LocalDate startDate,
                                                                    @RequestParam LocalDate endDate) {
        Employee employee = employeeService.findById(employeeId);
        List<Attendance> attendance = attendanceService.getEmployeeAttendance(employee, startDate, endDate);
        return ResponseEntity.ok(attendance);
    }
    
    @GetMapping("/employee/{employeeId}/month")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<Attendance>> getEmployeeMonthlyAttendance(@PathVariable Long employeeId,
                                                                           @RequestParam int year,
                                                                           @RequestParam int month) {
        Employee employee = employeeService.findById(employeeId);
        List<Attendance> attendance = attendanceService.getMonthlyAttendance(employee, year, month);
        return ResponseEntity.ok(attendance);
    }
    
    @GetMapping("/employee/{employeeId}/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Map<String, Object>> getEmployeeAttendanceStats(@PathVariable Long employeeId,
                                                                            @RequestParam LocalDate startDate,
                                                                            @RequestParam LocalDate endDate) {
        Employee employee = employeeService.findById(employeeId);
        
        long presentDays = attendanceService.getAttendanceCount(employee, AttendanceStatus.PRESENT, startDate, endDate);
        long absentDays = attendanceService.getAttendanceCount(employee, AttendanceStatus.ABSENT, startDate, endDate);
        long halfDays = attendanceService.getAttendanceCount(employee, AttendanceStatus.HALF_DAY, startDate, endDate);
        long wfhDays = attendanceService.getAttendanceCount(employee, AttendanceStatus.WORK_FROM_HOME, startDate, endDate);
        Double totalHours = attendanceService.getTotalWorkedHours(employee, startDate, endDate);
        
        Map<String, Object> stats = Map.of(
                "presentDays", presentDays,
                "absentDays", absentDays,
                "halfDays", halfDays,
                "wfhDays", wfhDays,
                "totalHours", totalHours
        );
        
        return ResponseEntity.ok(stats);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }
}
