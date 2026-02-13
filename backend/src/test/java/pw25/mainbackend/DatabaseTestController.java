package pw25.mainbackend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
public class DatabaseTestController {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/api/db-test")
    public Map<String, Object> testDatabaseConnection() {
        Map<String, Object> response = new HashMap<>();

        try (Connection connection = dataSource.getConnection()) {
            response.put("status", "success");
            response.put("database", connection.getMetaData().getDatabaseProductName());
            response.put("url", connection.getMetaData().getURL());
            response.put("user", jdbcTemplate.queryForObject("SELECT current_user;", String.class));
            response.put("database_name", jdbcTemplate.queryForObject("SELECT current_database();", String.class));
            response.put("version", jdbcTemplate.queryForObject("SELECT version();", String.class));
            response.put("timestamp", jdbcTemplate.queryForObject("SELECT NOW();", String.class));

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }

        return response;
    }
}