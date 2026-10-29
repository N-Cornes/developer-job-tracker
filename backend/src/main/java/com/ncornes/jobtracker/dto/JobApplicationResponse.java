package com.ncornes.jobtracker.dto;

import com.ncornes.jobtracker.model.ApplicationStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record JobApplicationResponse(
        Long id,
        String companyName,
        String roleTitle,
        ApplicationStatus status,
        String jobUrl,
        String location,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        LocalDate appliedDate,
        LocalDate nextFollowUpDate,
        String contactName,
        String contactEmail,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
