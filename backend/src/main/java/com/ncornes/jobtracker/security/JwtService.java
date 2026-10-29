package com.ncornes.jobtracker.security;

import com.ncornes.jobtracker.model.UserAccount;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final Duration tokenLifetime;

    public JwtService(
            JwtEncoder jwtEncoder,
            @Value("${app.jwt.expiration-hours:24}") long expirationHours
    ) {
        this.jwtEncoder = jwtEncoder;
        this.tokenLifetime = Duration.ofHours(expirationHours);
    }

    public IssuedToken issue(UserAccount account) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(tokenLifetime);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("developer-job-tracker")
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(account.getEmail())
                .claim("uid", account.getId())
                .claim("name", account.getDisplayName())
                .build();

        String value = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
        return new IssuedToken(value, expiresAt);
    }

    public record IssuedToken(String value, Instant expiresAt) {}
}
