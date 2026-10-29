package com.ncornes.jobtracker.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    OpenAPI developerJobTrackerOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Developer Job Tracker API")
                        .version("1.0.0")
                        .description("REST API for authenticated job-application tracking, pipeline management, dashboard statistics, and follow-up reminders.")
                        .contact(new Contact().name("Nicholas Cornes")))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT returned by /api/auth/login or /api/auth/register")));
    }
}
