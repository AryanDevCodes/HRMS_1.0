package com.workzen.repository;

import com.workzen.entity.SalaryComponent;
import com.workzen.enums.SalaryComponentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryComponentRepository extends JpaRepository<SalaryComponent, Long> {
    
    Optional<SalaryComponent> findByCode(String code);
    
    List<SalaryComponent> findByTypeAndIsActiveTrue(SalaryComponentType type);
    
    List<SalaryComponent> findByIsActiveTrueOrderByDisplayOrder();
    
    List<SalaryComponent> findByTypeOrderByDisplayOrder(SalaryComponentType type);
}
