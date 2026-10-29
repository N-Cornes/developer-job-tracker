package com.ncornes.jobtracker.integration;

import com.ncornes.jobtracker.model.ApplicationStatus;
import com.ncornes.jobtracker.model.JobApplication;
import com.ncornes.jobtracker.model.UserAccount;
import com.ncornes.jobtracker.repository.JobApplicationRepository;
import com.ncornes.jobtracker.repository.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
class PostgreSqlIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18-alpine");

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Test
    void flywayMigratesSchemaAndRepositoriesPersistAgainstPostgres() {
        Integer appliedMigrations = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM flyway_schema_history WHERE success = TRUE",
                Integer.class
        );
        assertThat(appliedMigrations).isNotNull().isGreaterThanOrEqualTo(1);

        UserAccount user = new UserAccount();
        user.setEmail("integration@example.com");
        user.setDisplayName("Integration User");
        user.setPasswordHash("integration-test-password-hash");
        UserAccount savedUser = userAccountRepository.saveAndFlush(user);

        JobApplication application = new JobApplication();
        application.setUser(savedUser);
        application.setCompanyName("Acme Engineering");
        application.setRoleTitle("Backend Software Engineer");
        application.setStatus(ApplicationStatus.APPLIED);
        JobApplication savedApplication = jobApplicationRepository.saveAndFlush(application);

        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedApplication.getId()).isNotNull();
        assertThat(
                jobApplicationRepository.findByIdAndUserEmailIgnoreCase(
                        savedApplication.getId(),
                        "integration@example.com"
                )
        ).isPresent()
                .get()
                .extracting(JobApplication::getCompanyName, JobApplication::getRoleTitle, JobApplication::getStatus)
                .containsExactly("Acme Engineering", "Backend Software Engineer", ApplicationStatus.APPLIED);
    }
}
