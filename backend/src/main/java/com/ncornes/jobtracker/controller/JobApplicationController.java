package com.ncornes.jobtracker.controller;

import com.ncornes.jobtracker.dto.ApplicationStatsResponse;
import com.ncornes.jobtracker.dto.FollowUpUpdateRequest;
import com.ncornes.jobtracker.dto.JobApplicationRequest;
import com.ncornes.jobtracker.dto.JobApplicationResponse;
import com.ncornes.jobtracker.dto.StatusUpdateRequest;
import com.ncornes.jobtracker.model.ApplicationStatus;
import com.ncornes.jobtracker.service.JobApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Job Applications", description = "Authenticated job-application tracking and follow-up workflow")
@SecurityRequirement(name = "bearerAuth")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @Operation(summary = "List, search, or filter the current user's applications")
    @GetMapping
    public List<JobApplicationResponse> getApplications(
            Authentication authentication,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String search
    ) {
        return service.findAll(authentication.getName(), status, search);
    }

    @Operation(summary = "Get one owned application")
    @GetMapping("/{id}")
    public JobApplicationResponse getApplication(Authentication authentication, @PathVariable Long id) {
        return service.findById(authentication.getName(), id);
    }

    @Operation(summary = "Get dashboard statistics")
    @GetMapping("/stats")
    public ApplicationStatsResponse getStats(Authentication authentication) {
        return service.getStats(authentication.getName());
    }

    @Operation(summary = "Get applications with due or overdue follow-ups")
    @GetMapping("/attention")
    public List<JobApplicationResponse> getNeedsAttention(Authentication authentication) {
        return service.getNeedsAttention(authentication.getName());
    }

    @Operation(summary = "Create a job application")
    @PostMapping
    public ResponseEntity<JobApplicationResponse> createApplication(
            Authentication authentication,
            @Valid @RequestBody JobApplicationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(authentication.getName(), request));
    }

    @Operation(summary = "Update an owned application")
    @PutMapping("/{id}")
    public JobApplicationResponse updateApplication(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody JobApplicationRequest request
    ) {
        return service.update(authentication.getName(), id, request);
    }

    @Operation(summary = "Update application status")
    @PatchMapping("/{id}/status")
    public JobApplicationResponse updateStatus(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        return service.updateStatus(authentication.getName(), id, request.status());
    }

    @Operation(summary = "Reschedule or clear a follow-up reminder")
    @PatchMapping("/{id}/follow-up")
    public JobApplicationResponse updateFollowUpDate(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody FollowUpUpdateRequest request
    ) {
        return service.updateFollowUpDate(authentication.getName(), id, request.nextFollowUpDate());
    }

    @Operation(summary = "Delete an owned application")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(Authentication authentication, @PathVariable Long id) {
        service.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
