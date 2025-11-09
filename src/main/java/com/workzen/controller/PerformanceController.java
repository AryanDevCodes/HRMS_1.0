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
    public ResponseEntity<Performance> createPerformanceReview(@RequestBody Map<String, Object> request,
                                                                @AuthenticationPrincipal UserDetails userDetails) {
        // Get reviewer (current user)
        Employee reviewer = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));
        
        // Get employee being reviewed
        Long employeeId = Long.valueOf(request.get("employeeId").toString());
        Employee employee = employeeService.findById(employeeId);
        
        // Build Performance object
        Performance performance = Performance.builder()
                .employee(employee)
                .reviewer(reviewer)
                .reviewPeriodStart(LocalDate.parse(request.get("reviewPeriodStart").toString()))
                .reviewPeriodEnd(LocalDate.parse(request.get("reviewPeriodEnd").toString()))
                .overallRating(Double.valueOf(request.get("overallRating").toString()))
                .technicalSkillsRating(Double.valueOf(request.get("technicalSkillsRating").toString()))
                .communicationRating(Double.valueOf(request.get("communicationRating").toString()))
                .teamworkRating(Double.valueOf(request.get("teamworkRating").toString()))
                .leadershipRating(Double.valueOf(request.get("leadershipRating").toString()))
                .strengths(request.get("strengths").toString())
                .areasForImprovement(request.get("areasForImprovement").toString())
                .goals(request.get("goals").toString())
                .reviewerComments(request.get("reviewerComments") != null ? request.get("reviewerComments").toString() : null)
                .reviewDate(LocalDate.now())
                .build();
        
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Performance> getPerformanceById(@PathVariable Long id,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        Performance performance = performanceService.findById(id);
        
        // Employees can only view their own reviews unless they are ADMIN/HR_MANAGER
        if (!employee.getRole().name().matches("ADMIN|HR_MANAGER") && 
            !performance.getEmployee().getId().equals(employee.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(performance);
    }
    
    @GetMapping("/my-reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Performance>> getMyReviews(@AuthenticationPrincipal UserDetails userDetails) {
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        List<Performance> reviews = performanceService.getEmployeePerformanceReviews(employee);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/my-reviews/paginated")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<Performance>> getMyReviewsPaginated(@AuthenticationPrincipal UserDetails userDetails,
                                                                    Pageable pageable) {
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        Page<Performance> reviews = performanceService.getEmployeePerformanceReviews(employee, pageable);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/my-reviews/year")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Performance>> getMyReviewsByYear(@AuthenticationPrincipal UserDetails userDetails,
                                                                  @RequestParam int year) {
        Employee employee = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
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
        Employee reviewer = employeeService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
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
