package com.ncornes.jobtracker.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
@ConditionalOnExpression("'${RENDER:false}' == 'true'")
public class RenderDatabaseConfig {

    @Bean
    DataSource renderDataSource() {
        String connectionString = System.getenv("DATABASE_URL");
        if (connectionString == null || connectionString.isBlank()) {
            throw new IllegalStateException("DATABASE_URL is required when running on Render");
        }

        URI uri = URI.create(connectionString);
        String userInfo = uri.getRawUserInfo();
        if (userInfo == null || !userInfo.contains(":")) {
            throw new IllegalStateException("DATABASE_URL does not contain PostgreSQL credentials");
        }

        String[] credentials = userInfo.split(":", 2);
        String username = URLDecoder.decode(credentials[0], StandardCharsets.UTF_8);
        String password = URLDecoder.decode(credentials[1], StandardCharsets.UTF_8);
        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        String database = uri.getPath().startsWith("/") ? uri.getPath().substring(1) : uri.getPath();

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:postgresql://" + uri.getHost() + ":" + port + "/" + database);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        dataSource.setDriverClassName("org.postgresql.Driver");
        return dataSource;
    }
}
