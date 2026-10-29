package com.ncornes.jobtracker.dto;

public record UserResponse(
        Long id,
        String email,
        String displayName
) {}
