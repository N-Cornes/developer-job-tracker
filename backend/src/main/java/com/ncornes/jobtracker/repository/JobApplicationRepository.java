package com.ncornes.jobtracker.repository;

import com.ncornes.jobtracker.model.ApplicationStatus;
import com.ncornes.jobtracker.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findAllByUserEmailIgnoreCaseOrderByUpdatedAtDesc(String email);

    List<JobApplication> findByUserEmailIgnoreCaseAndStatusOrderByUpdatedAtDesc(String email, ApplicationStatus status);

    List<JobApplication> findByUserEmailIgnoreCaseAndNextFollowUpDateLessThanEqualOrderByNextFollowUpDateAsc(
            String email,
            LocalDate date
    );

    List<JobApplication> findByUserEmailIgnoreCaseAndCompanyNameContainingIgnoreCaseOrUserEmailIgnoreCaseAndRoleTitleContainingIgnoreCaseOrderByUpdatedAtDesc(
            String companyOwner,
            String companyName,
            String roleOwner,
            String roleTitle
    );

    Optional<JobApplication> findByIdAndUserEmailIgnoreCase(Long id, String email);
}
