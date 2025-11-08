package com.workzen.controller;

import com.workzen.entity.Employee;
import com.workzen.entity.Performance;
import com.workzen.service.EmployeeService;
import com.workzen.service.PerformanceService;
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
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
public class PerformanceController {
    
    private final PerformanceService performanceService;
    private final EmployeeService employeeService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Performance> createPerformanceReview(@RequestBody Performance performance,
                                                                @AuthenticationPrincipal UserDetails userDetails) {
        Employee reviewer = (Employee) userDetails;
        performance.setReviewer(reviewer);
        
        Performance created = performanceService.createPerformanceReview(performance);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Performance> updatePerformanceReview(@PathVariable Long id,
                                                                @RequestBody Performance performanceDetails) {
        Performance updated = performanceService.updatePerformanceReview(id, performanceDetails);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Performance> getPerformanceById(@PathVariable Long id,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = (Employee) userDetails;
        Performance performance = performanceService.findById(id);
        
        // Employees can only view their own reviews unless they are ADMIN/HR_MANAGER
        if (!employee.getRole().name().matches("ADMIN|HR_MANAGER") && 
            !performance.getEmployee().getId().equals(employee.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(performance);
    }
    
    @GetMapping("/my-reviews")
    public ResponseEntity<List<Performance>> getMyReviews(@AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = (Employee) userDetails;
        List<Performance> reviews = performanceService.getEmployeePerformanceReviews(employee);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/my-reviews/paginated")
    public ResponseEntity<Page<Performance>> getMyReviewsPaginated(@AuthenticationPrincipal UserDetails userDetails,
                                                                    Pageable pageable) {
        Employee employee = (Employee) userDetails;
        Page<Performance> reviews = performanceService.getEmployeePerformanceReviews(employee, pageable);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/my-reviews/year")
    public ResponseEntity<List<Performance>> getMyReviewsByYear(@AuthenticationPrincipal UserDetails userDetails,
                                                                  @RequestParam int year) {
        Employee employee = (Employee) userDetails;
        List<Performance> reviews = performanceService.getEmployeePerformanceReviewsByYear(employee, year);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<Performance>> getEmployeeReviews(@PathVariable Long employeeId) {
        Employee employee = employeeService.findById(employeeId);
        List<Performance> reviews = performanceService.getEmployeePerformanceReviews(employee);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/employee/{employeeId}/year")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<Performance>> getEmployeeReviewsByYear(@PathVariable Long employeeId,
                                                                        @RequestParam int year) {
        Employee employee = employeeService.findById(employeeId);
        List<Performance> reviews = performanceService.getEmployeePerformanceReviewsByYear(employee, year);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/employee/{employeeId}/average-rating")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Map<String, Double>> getAverageRating(@PathVariable Long employeeId) {
        Employee employee = employeeService.findById(employeeId);
        Double averageRating = performanceService.getEmployeeAverageRating(employee);
        return ResponseEntity.ok(Map.of("averageRating", averageRating));
    }
    
    @GetMapping("/reviewed-by-me")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<Performance>> getReviewsByReviewer(@AuthenticationPrincipal UserDetails userDetails) {
        Employee reviewer = (Employee) userDetails;
        List<Performance> reviews = performanceService.getPerformanceReviewsByReviewer(reviewer);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/year/{year}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<Performance>> getReviewsByYear(@PathVariable int year) {
        List<Performance> reviews = performanceService.getPerformanceReviewsByYear(year);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/period")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<Performance>> getReviewsByPeriod(@RequestParam LocalDate startDate,
                                                                 @RequestParam LocalDate endDate) {
        List<Performance> reviews = performanceService.getPerformanceReviewsByPeriod(startDate, endDate);
        return ResponseEntity.ok(reviews);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePerformanceReview(@PathVariable Long id) {
        performanceService.deletePerformanceReview(id);
        return ResponseEntity.noContent().build();
    }
}
