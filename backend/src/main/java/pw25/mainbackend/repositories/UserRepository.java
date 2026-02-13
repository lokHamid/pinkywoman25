package pw25.mainbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pw25.mainbackend.entities.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
