package com.workzen.repository;

import com.workzen.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DesignationRepository extends JpaRepository<Designation, Long> {
    
    Optional<Designation> findByName(String name);
    
    List<Designation> findByIsActiveTrue();
    
    List<Designation> findByIsActiveTrueOrderByLevelAsc();
    
    boolean existsByName(String name);
}
