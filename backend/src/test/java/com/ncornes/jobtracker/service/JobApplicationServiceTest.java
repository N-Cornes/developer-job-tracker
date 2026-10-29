package com.ncornes.jobtracker.service;

import com.ncornes.jobtracker.dto.JobApplicationRequest;
import com.ncornes.jobtracker.exception.ResourceNotFoundException;
import com.ncornes.jobtracker.model.ApplicationStatus;
import com.ncornes.jobtracker.model.JobApplication;
import com.ncornes.jobtracker.model.UserAccount;
import com.ncornes.jobtracker.repository.JobApplicationRepository;
import com.ncornes.jobtracker.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {

    private static final String EMAIL = "nick@example.com";

    @Mock
    private JobApplicationRepository repository;

    @Mock
    private UserAccountRepository userRepository;

    private JobApplicationService service;
    private UserAccount user;

    @BeforeEach
    void setUp() {
        service = new JobApplicationService(repository, userRepository);
        user = new UserAccount();
        user.setEmail(EMAIL);
        user.setDisplayName("Nick");
    }

    @Test
    void createTrimsRequiredTextAndAssignsAuthenticatedOwner() {
        JobApplicationRequest request = request("  OpenAI  ", "  Software Engineer  ", ApplicationStatus.APPLIED);
        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.of(user));
        when(repository.save(any(JobApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.create(EMAIL, request);

        assertEquals("OpenAI", response.companyName());
        assertEquals("Software Engineer", response.roleTitle());
        assertEquals(ApplicationStatus.APPLIED, response.status());
        verify(repository).save(argThat(application -> application.getUser() == user));
    }

    @Test
    void updateStatusOnlyLoadsApplicationOwnedByAuthenticatedUser() {
        JobApplication application = application("Example Co", "Backend Engineer", ApplicationStatus.APPLIED);

        when(repository.findByIdAndUserEmailIgnoreCase(10L, EMAIL)).thenReturn(Optional.of(application));
        when(repository.save(application)).thenReturn(application);

        var response = service.updateStatus(EMAIL, 10L, ApplicationStatus.INTERVIEW);

        assertEquals(ApplicationStatus.INTERVIEW, response.status());
        verify(repository).findByIdAndUserEmailIgnoreCase(10L, EMAIL);
    }

    @Test
    void findByIdDoesNotFallBackToUnscopedLookup() {
        when(repository.findByIdAndUserEmailIgnoreCase(999L, EMAIL)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.findById(EMAIL, 999L));
        verify(repository, never()).findById(999L);
    }

    @Test
    void deleteRemovesOnlyOwnedApplication() {
        JobApplication application = application("Example Co", "Engineer", ApplicationStatus.APPLIED);
        when(repository.findByIdAndUserEmailIgnoreCase(5L, EMAIL)).thenReturn(Optional.of(application));

        service.delete(EMAIL, 5L);

        verify(repository).delete(application);
    }

    @Test
    void needsAttentionReturnsOnlyCurrentUsersActiveDueApplications() {
        LocalDate today = LocalDate.now();

        JobApplication active = application("Active Co", "Backend Engineer", ApplicationStatus.APPLIED);
        active.setNextFollowUpDate(today);

        JobApplication rejected = application("Closed Co", "Platform Engineer", ApplicationStatus.REJECTED);
        rejected.setNextFollowUpDate(today.minusDays(2));

        when(repository.findByUserEmailIgnoreCaseAndNextFollowUpDateLessThanEqualOrderByNextFollowUpDateAsc(EMAIL, today))
                .thenReturn(List.of(rejected, active));

        var response = service.getNeedsAttention(EMAIL);

        assertEquals(1, response.size());
        assertEquals("Active Co", response.getFirst().companyName());
    }

    @Test
    void statsAreCalculatedFromAuthenticatedUsersApplicationsOnly() {
        when(repository.findAllByUserEmailIgnoreCaseOrderByUpdatedAtDesc(EMAIL)).thenReturn(List.of(
                application("A", "Engineer", ApplicationStatus.APPLIED),
                application("B", "Engineer", ApplicationStatus.INTERVIEW)
        ));

        var stats = service.getStats(EMAIL);

        assertEquals(2, stats.total());
        assertEquals(1L, stats.byStatus().get("APPLIED"));
        assertEquals(1L, stats.byStatus().get("INTERVIEW"));
        verify(repository, never()).findAll();
    }

    private JobApplication application(String company, String role, ApplicationStatus status) {
        JobApplication application = new JobApplication();
        application.setUser(user);
        application.setCompanyName(company);
        application.setRoleTitle(role);
        application.setStatus(status);
        return application;
    }

    private JobApplicationRequest request(String company, String role, ApplicationStatus status) {
        JobApplicationRequest request = new JobApplicationRequest();
        request.setCompanyName(company);
        request.setRoleTitle(role);
        request.setStatus(status);
        return request;
    }
}
