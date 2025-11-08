package com.workzen.repository;

import com.workzen.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    Optional<Department> findByName(String name);
    
    List<Department> findByIsActiveTrue();
    
    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.manager WHERE d.id = :id")
    Optional<Department> findByIdWithManager(Long id);
    
    boolean existsByName(String name);
}
