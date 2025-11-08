package com.workzen.controller;

import com.workzen.dto.AttendanceDTO;
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
import java.util.HashMap;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    
    private final AttendanceService attendanceService;
    private final EmployeeService employeeService;
    
    @PostMapping("/check-in")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Attendance> checkIn(@AuthenticationPrincipal UserDetails userDetails) {
        // Resolve Employee from authenticated principal's username/email
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated employee not found"));
        Attendance attendance = attendanceService.checkIn(employee, LocalDateTime.now());
        return new ResponseEntity<>(attendance, HttpStatus.CREATED);
    }
    
    @PatchMapping("/check-out")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Attendance> checkOut(@AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated employee not found"));
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Attendance> getAttendanceById(@PathVariable Long id) {
        Attendance attendance = attendanceService.findById(id);
        return ResponseEntity.ok(attendance);
    }
    
    @GetMapping("/today")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Attendance> getTodayAttendance(@AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated employee not found"));
        Attendance attendance = attendanceService.getTodayAttendance(employee);
        if (attendance == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(attendance);
    }
    
    @GetMapping("/my-attendance/today")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AttendanceDTO> getMyTodayAttendance(@AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated employee not found"));
        Attendance attendance = attendanceService.getTodayAttendance(employee);
        if (attendance == null) {
            return ResponseEntity.noContent().build();
        }
        AttendanceDTO dto = convertToDTO(attendance);
        return ResponseEntity.ok(dto);
    }
    
    private AttendanceDTO convertToDTO(Attendance attendance) {
        return AttendanceDTO.builder()
                .id(attendance.getId())
                .date(attendance.getDate())
                .checkIn(attendance.getCheckIn())
                .checkOut(attendance.getCheckOut())
                .totalHours(attendance.getTotalHours())
                .status(attendance.getStatus())
                .remarks(attendance.getRemarks())
                .isOvertime(attendance.getIsOvertime())
                .overtimeHours(attendance.getOvertimeHours())
                .employeeId(attendance.getEmployee().getId())
                .employeeName(attendance.getEmployee().getFullName())
                .employeeCode(attendance.getEmployee().getEmployeeCode())
                .build();
    }
    
    @GetMapping("/my-attendance")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Attendance>> getMyAttendance(@AuthenticationPrincipal UserDetails userDetails,
                                                             @RequestParam LocalDate startDate,
                                                             @RequestParam LocalDate endDate) {
    Employee employee = employeeService.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new RuntimeException("Authenticated employee not found"));
    List<Attendance> attendance = attendanceService.getEmployeeAttendance(employee, startDate, endDate);
        return ResponseEntity.ok(attendance);
    }
    
    @GetMapping("/my-attendance/month")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Attendance>> getMyMonthlyAttendance(@AuthenticationPrincipal UserDetails userDetails,
                                                                     @RequestParam int year,
                                                                     @RequestParam int month) {
    Employee employee = employeeService.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new RuntimeException("Authenticated employee not found"));
    List<Attendance> attendance = attendanceService.getMonthlyAttendance(employee, year, month);
        return ResponseEntity.ok(attendance);
    }
    
    @GetMapping("/my-attendance/paginated")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<Attendance>> getMyAttendancePaginated(@AuthenticationPrincipal UserDetails userDetails,
                                                                       Pageable pageable) {
    Employee employee = employeeService.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new RuntimeException("Authenticated employee not found"));
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
    
    @GetMapping("/today/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getAllEmployeesTodayAttendance() {
        List<Employee> allEmployees = employeeService.getAllActiveEmployees();
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> employeesWithStatus = allEmployees.stream()
                .map(employee -> {
                    Attendance todayAttendance = attendanceService.getTodayAttendance(employee);
                    String status;
                    
                    if (todayAttendance != null) {
                        status = todayAttendance.getStatus().toString();
                    } else {
                        // Check if employee has approved leave for today
                        boolean hasLeaveToday = attendanceService.hasApprovedLeaveToday(employee);
                        status = hasLeaveToday ? "ON_LEAVE" : "ABSENT";
                    }
                    
                    Map<String, Object> empMap = new HashMap<>();
                    empMap.put("employeeId", employee.getId());
                    empMap.put("employeeCode", employee.getEmployeeCode());
                    empMap.put("firstName", employee.getFirstName());
                    empMap.put("lastName", employee.getLastName());
                    empMap.put("email", employee.getEmail());
                    empMap.put("department", employee.getDepartment() != null ? employee.getDepartment().getName() : "N/A");
                    empMap.put("attendanceStatus", status);
                    
                    return empMap;
                })
                .toList();
        
        return ResponseEntity.ok(employeesWithStatus);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }
}
