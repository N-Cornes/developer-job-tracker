package com.ncornes.jobtracker.service;

import com.ncornes.jobtracker.dto.AuthResponse;
import com.ncornes.jobtracker.dto.LoginRequest;
import com.ncornes.jobtracker.dto.RegisterRequest;
import com.ncornes.jobtracker.dto.UserResponse;
import com.ncornes.jobtracker.exception.DuplicateEmailException;
import com.ncornes.jobtracker.exception.InvalidCredentialsException;
import com.ncornes.jobtracker.exception.ResourceNotFoundException;
import com.ncornes.jobtracker.model.UserAccount;
import com.ncornes.jobtracker.repository.UserAccountRepository;
import com.ncornes.jobtracker.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@Transactional
public class AuthService {

    private final UserAccountRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserAccountRepository repository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (repository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateEmailException("An account already exists for that email address");
        }

        UserAccount account = new UserAccount();
        account.setEmail(email);
        account.setDisplayName(request.displayName().trim());
        account.setPasswordHash(passwordEncoder.encode(request.password()));
        account = repository.save(account);

        return authResponse(account);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password())
            );
        } catch (AuthenticationException ex) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        UserAccount account = repository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        return authResponse(account);
    }

    @Transactional(readOnly = true)
    public UserResponse currentUser(String email) {
        UserAccount account = repository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User account was not found"));
        return toUserResponse(account);
    }

    private AuthResponse authResponse(UserAccount account) {
        JwtService.IssuedToken token = jwtService.issue(account);
        return new AuthResponse(token.value(), "Bearer", token.expiresAt(), toUserResponse(account));
    }

    private UserResponse toUserResponse(UserAccount account) {
        return new UserResponse(account.getId(), account.getEmail(), account.getDisplayName());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
