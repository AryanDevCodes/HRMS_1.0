package com.workzen.entity;

import com.workzen.enums.EmployeeStatus;
import com.workzen.enums.Gender;
import com.workzen.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "employees")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employee extends BaseEntity implements UserDetails {
    
    @Column(name = "employee_code", unique = true, nullable = false, length = 30)
    private String employeeCode; // Renamed from employeeId
    
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;
    
    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    private String password;
    
    @Column(name = "phone", unique = true, length = 20)
    private String phone;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private Gender gender;
    
    @Column(name = "address", length = 255)
    private String address;
    
    @Column(name = "city", length = 50)
    private String city;
    
    @Column(name = "state", length = 50)
    private String state;
    
    @Column(name = "pincode", length = 10)
    private String pincode;
    
    @Column(name = "country", length = 50)
    @Builder.Default
    private String country = "India";
    
    @Column(name = "date_of_joining")
    private LocalDate dateOfJoining;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    private Role role;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private EmployeeStatus status = EmployeeStatus.ACTIVE;
    
    @Column(name = "salary")
    private Double salary;
    
    // Relationships with new entities
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "designation_id")
    private Designation designation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;
    
    // Emergency contact
    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;
    
    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;
    
    @Column(name = "emergency_contact_relation", length = 50)
    private String emergencyContactRelation;
    
    // Banking details
    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;
    
    @Column(name = "bank_name", length = 100)
    private String bankName;
    
    @Column(name = "ifsc_code", length = 20)
    private String ifscCode;
    
    @Column(name = "pan_number", length = 10)
    private String panNumber;
    
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    // UserDetails implementation for Spring Security
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    
    @Override
    public String getUsername() {
        return email;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return status != EmployeeStatus.TERMINATED && status != EmployeeStatus.SUSPENDED;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return isActive && status.canLogin();
    }
    
    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
