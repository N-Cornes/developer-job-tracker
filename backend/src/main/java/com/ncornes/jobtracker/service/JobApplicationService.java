package com.ncornes.jobtracker.service;

import com.ncornes.jobtracker.dto.ApplicationStatsResponse;
import com.ncornes.jobtracker.dto.JobApplicationRequest;
import com.ncornes.jobtracker.dto.JobApplicationResponse;
import com.ncornes.jobtracker.exception.ResourceNotFoundException;
import com.ncornes.jobtracker.model.ApplicationStatus;
import com.ncornes.jobtracker.model.JobApplication;
import com.ncornes.jobtracker.model.UserAccount;
import com.ncornes.jobtracker.repository.JobApplicationRepository;
import com.ncornes.jobtracker.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class JobApplicationService {

    private final JobApplicationRepository repository;
    private final UserAccountRepository userRepository;

    public JobApplicationService(JobApplicationRepository repository, UserAccountRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> findAll(String email, ApplicationStatus status, String search) {
        List<JobApplication> applications;

        if (search != null && !search.isBlank()) {
            applications = repository
                    .findByUserEmailIgnoreCaseAndCompanyNameContainingIgnoreCaseOrUserEmailIgnoreCaseAndRoleTitleContainingIgnoreCaseOrderByUpdatedAtDesc(
                            email, search, email, search
                    );
            if (status != null) {
                applications = applications.stream()
                        .filter(application -> application.getStatus() == status)
                        .toList();
            }
        } else if (status != null) {
            applications = repository.findByUserEmailIgnoreCaseAndStatusOrderByUpdatedAtDesc(email, status);
        } else {
            applications = repository.findAllByUserEmailIgnoreCaseOrderByUpdatedAtDesc(email);
        }

        return applications.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public JobApplicationResponse findById(String email, Long id) {
        return toResponse(findEntity(email, id));
    }

    public JobApplicationResponse create(String email, JobApplicationRequest request) {
        UserAccount user = findUser(email);
        JobApplication application = new JobApplication();
        application.setUser(user);
        copyRequest(request, application);
        return toResponse(repository.save(application));
    }

    public JobApplicationResponse update(String email, Long id, JobApplicationRequest request) {
        JobApplication application = findEntity(email, id);
        copyRequest(request, application);
        return toResponse(repository.save(application));
    }

    public JobApplicationResponse updateStatus(String email, Long id, ApplicationStatus status) {
        JobApplication application = findEntity(email, id);
        application.setStatus(status);
        return toResponse(repository.save(application));
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getNeedsAttention(String email) {
        LocalDate today = LocalDate.now();
        return repository.findByUserEmailIgnoreCaseAndNextFollowUpDateLessThanEqualOrderByNextFollowUpDateAsc(email, today).stream()
                .filter(application -> application.getStatus() != ApplicationStatus.REJECTED)
                .filter(application -> application.getStatus() != ApplicationStatus.WITHDRAWN)
                .map(this::toResponse)
                .toList();
    }

    public JobApplicationResponse updateFollowUpDate(String email, Long id, LocalDate nextFollowUpDate) {
        JobApplication application = findEntity(email, id);
        application.setNextFollowUpDate(nextFollowUpDate);
        return toResponse(repository.save(application));
    }

    public void delete(String email, Long id) {
        JobApplication application = findEntity(email, id);
        repository.delete(application);
    }

    @Transactional(readOnly = true)
    public ApplicationStatsResponse getStats(String email) {
        List<JobApplication> applications = repository.findAllByUserEmailIgnoreCaseOrderByUpdatedAtDesc(email);
        Map<String, Long> byStatus = new LinkedHashMap<>();

        Arrays.stream(ApplicationStatus.values())
                .forEach(status -> byStatus.put(status.name(), 0L));

        applications.forEach(application ->
                byStatus.computeIfPresent(application.getStatus().name(), (key, count) -> count + 1)
        );

        return new ApplicationStatsResponse(applications.size(), byStatus);
    }

    private JobApplication findEntity(String email, Long id) {
        return repository.findByIdAndUserEmailIgnoreCase(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Job application " + id + " was not found"));
    }

    private UserAccount findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User account was not found"));
    }

    private void copyRequest(JobApplicationRequest request, JobApplication application) {
        application.setCompanyName(request.getCompanyName().trim());
        application.setRoleTitle(request.getRoleTitle().trim());
        application.setStatus(request.getStatus());
        application.setJobUrl(blankToNull(request.getJobUrl()));
        application.setLocation(blankToNull(request.getLocation()));
        application.setSalaryMin(request.getSalaryMin());
        application.setSalaryMax(request.getSalaryMax());
        application.setAppliedDate(request.getAppliedDate());
        application.setNextFollowUpDate(request.getNextFollowUpDate());
        application.setContactName(blankToNull(request.getContactName()));
        application.setContactEmail(blankToNull(request.getContactEmail()));
        application.setNotes(blankToNull(request.getNotes()));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private JobApplicationResponse toResponse(JobApplication application) {
        return new JobApplicationResponse(
                application.getId(),
                application.getCompanyName(),
                application.getRoleTitle(),
                application.getStatus(),
                application.getJobUrl(),
                application.getLocation(),
                application.getSalaryMin(),
                application.getSalaryMax(),
                application.getAppliedDate(),
                application.getNextFollowUpDate(),
                application.getContactName(),
                application.getContactEmail(),
                application.getNotes(),
                application.getCreatedAt(),
                application.getUpdatedAt()
        );
    }
}
