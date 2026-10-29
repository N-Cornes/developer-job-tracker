package com.ncornes.jobtracker.dto;

import java.util.Map;

public record ApplicationStatsResponse(long total, Map<String, Long> byStatus) {}
