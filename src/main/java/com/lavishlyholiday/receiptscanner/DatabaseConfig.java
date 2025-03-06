package com.lavishlyholiday.receiptscanner;

import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import javax.sql.DataSource;

@Configuration
@AllArgsConstructor
public class DatabaseConfig {
    private final DataSource dataSource;

    /**
     * @return
     */
    @Bean
    public NamedParameterJdbcTemplate template() {
        return new NamedParameterJdbcTemplate(dataSource);
    }
}
