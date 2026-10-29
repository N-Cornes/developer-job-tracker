package com.ncornes.jobtracker.dto;

import java.time.LocalDate;

public record FollowUpUpdateRequest(LocalDate nextFollowUpDate) {
}
