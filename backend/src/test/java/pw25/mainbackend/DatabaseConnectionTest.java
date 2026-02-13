package pw25.mainbackend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

@Component
public class DatabaseConnectionTest implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== DATABASE CONNECTION TEST ===");

        try (Connection connection = dataSource.getConnection()) {
            // Test 1: Basic connection
            DatabaseMetaData metaData = connection.getMetaData();
            System.out.println("✓ Connected to: " + metaData.getDatabaseProductName());
            System.out.println("✓ Database URL: " + metaData.getURL());
            System.out.println("✓ Username: " + metaData.getUserName());
            System.out.println("✓ Driver: " + metaData.getDriverName());

            // Test 2: Simple query
            String dbName = jdbcTemplate.queryForObject(
                    "SELECT current_database();", String.class);
            System.out.println("✓ Current database: " + dbName);

            // Test 3: PostgreSQL version
            String version = jdbcTemplate.queryForObject(
                    "SELECT version();", String.class);
            System.out.println("✓ PostgreSQL Version: " + version);

            // Test 4: List tables (if any exist)
            Integer tableCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';",
                    Integer.class);
            System.out.println("✓ Tables in public schema: " + tableCount);

            // Test 5: Show current user
            String currentUser = jdbcTemplate.queryForObject(
                    "SELECT current_user;", String.class);
            System.out.println("✓ Current user: " + currentUser);

            System.out.println("✅ All connection tests passed!");

        } catch (Exception e) {
            System.err.println("❌ Connection failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}