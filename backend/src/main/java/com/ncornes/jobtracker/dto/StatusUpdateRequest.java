package com.ncornes.jobtracker.dto;

import com.ncornes.jobtracker.model.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull ApplicationStatus status) {}
