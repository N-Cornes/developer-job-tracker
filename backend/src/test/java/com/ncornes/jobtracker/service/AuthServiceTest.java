package com.ncornes.jobtracker.service;

import com.ncornes.jobtracker.dto.LoginRequest;
import com.ncornes.jobtracker.dto.RegisterRequest;
import com.ncornes.jobtracker.exception.DuplicateEmailException;
import com.ncornes.jobtracker.exception.InvalidCredentialsException;
import com.ncornes.jobtracker.model.UserAccount;
import com.ncornes.jobtracker.repository.UserAccountRepository;
import com.ncornes.jobtracker.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserAccountRepository repository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtService jwtService;

    private AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(repository, passwordEncoder, authenticationManager, jwtService);
    }

    @Test
    void registerNormalizesEmailHashesPasswordAndReturnsToken() {
        when(repository.existsByEmailIgnoreCase("nick@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("bcrypt-hash");
        when(repository.save(any(UserAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.issue(any(UserAccount.class)))
                .thenReturn(new JwtService.IssuedToken("signed-token", Instant.parse("2030-01-01T00:00:00Z")));

        var response = service.register(new RegisterRequest(" Nick ", " NICK@EXAMPLE.COM ", "password123"));

        assertEquals("signed-token", response.token());
        assertEquals("nick@example.com", response.user().email());
        assertEquals("Nick", response.user().displayName());
        verify(passwordEncoder).encode("password123");
        verify(repository).save(argThat(account -> "bcrypt-hash".equals(account.getPasswordHash())));
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(repository.existsByEmailIgnoreCase("nick@example.com")).thenReturn(true);

        assertThrows(DuplicateEmailException.class, () ->
                service.register(new RegisterRequest("Nick", "nick@example.com", "password123"))
        );

        verify(repository, never()).save(any());
    }

    @Test
    void loginRejectsInvalidCredentials() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad credentials"));

        assertThrows(InvalidCredentialsException.class, () ->
                service.login(new LoginRequest("nick@example.com", "wrong-password"))
        );
    }

    @Test
    void currentUserReturnsProfileWithoutPasswordHash() {
        UserAccount account = new UserAccount();
        account.setEmail("nick@example.com");
        account.setDisplayName("Nick");
        account.setPasswordHash("secret-hash");
        when(repository.findByEmailIgnoreCase("nick@example.com")).thenReturn(Optional.of(account));

        var response = service.currentUser("nick@example.com");

        assertEquals("nick@example.com", response.email());
        assertEquals("Nick", response.displayName());
    }
}
