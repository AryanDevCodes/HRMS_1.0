package com.workzen.service;

import com.workzen.entity.Performance;
import com.workzen.entity.Employee;
import com.workzen.repository.PerformanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PerformanceService {
    
    private final PerformanceRepository performanceRepository;
    
    public Performance createPerformanceReview(Performance performance) {
        // Set review date if not provided
        if (performance.getReviewDate() == null) {
            performance.setReviewDate(LocalDate.now());
        }
        
        // Calculate overall rating if not provided
        if (performance.getOverallRating() == null) {
            performance.setOverallRating(calculateOverallRating(performance));
        }
        
        return performanceRepository.save(performance);
    }
    
    public Performance updatePerformanceReview(Long id, Performance performanceDetails) {
        Performance performance = findById(id);
        
        performance.setReviewPeriodStart(performanceDetails.getReviewPeriodStart());
        performance.setReviewPeriodEnd(performanceDetails.getReviewPeriodEnd());
        performance.setOverallRating(performanceDetails.getOverallRating());
        
        // Recalculate overall rating if individual ratings are updated
        if (performance.getOverallRating() == null) {
            performance.setOverallRating(calculateOverallRating(performance));
        }
        
        return performanceRepository.save(performance);
    }
    
    public Performance findById(Long id) {
        return performanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Performance review not found with id: " + id));
    }
    
    public List<Performance> getEmployeePerformanceReviews(Employee employee) {
        return performanceRepository.findByEmployeeOrderByReviewDateDesc(employee);
    }
    
    public Page<Performance> getEmployeePerformanceReviews(Employee employee, Pageable pageable) {
        return performanceRepository.findByEmployeeOrderByReviewDateDesc(employee, pageable);
    }
    
    public List<Performance> getPerformanceReviewsByManager(Employee manager) {
        return performanceRepository.findByManager(manager);
    }
    
    public List<Performance> getPerformanceReviewsByReviewer(Employee reviewer) {
        return performanceRepository.findByReviewerOrderByReviewDateDesc(reviewer);
    }
    
    public List<Performance> getPerformanceReviewsByPeriod(LocalDate startDate, LocalDate endDate) {
        return performanceRepository.findByReviewDateBetweenOrderByReviewDateDesc(startDate, endDate);
    }
    
    public List<Performance> getPerformanceReviewsByYear(int year) {
        return performanceRepository.findByYear(year);
    }
    
    public List<Performance> getEmployeePerformanceReviewsByYear(Employee employee, int year) {
        return performanceRepository.findByEmployeeAndYear(employee, year);
    }
    
    public Double getEmployeeAverageRating(Employee employee) {
        Double average = performanceRepository.getAverageRatingByEmployee(employee);
        return average != null ? average : 0.0;
    }
    
    public void deletePerformanceReview(Long id) {
        Performance performance = findById(id);
        performanceRepository.delete(performance);
    }
    
    // Calculate overall rating based on individual ratings
    private Double calculateOverallRating(Performance performance) {
        int count = 0;
        double total = 0.0;

        if (performance.getTechnicalSkillsRating() != null) {
            total += performance.getTechnicalSkillsRating();
            count++;
        }

        if (performance.getCommunicationRating() != null) {
            total += performance.getCommunicationRating();
            count++;
        }

        if (performance.getTeamworkRating() != null) {
            total += performance.getTeamworkRating();
            count++;
        }
        return count > 0 ? total / count : 0.0;
    }
    
    // Performance analytics methods
    public long getTotalPerformanceReviews() {
        return performanceRepository.count();
    }
    
    public long getPerformanceReviewsInPeriod(LocalDate startDate, LocalDate endDate) {
        return performanceRepository.findByReviewDateBetweenOrderByReviewDateDesc(startDate, endDate).size();
    }
}
