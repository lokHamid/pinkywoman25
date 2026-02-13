package pw25.mainbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pw25.mainbackend.entities.Color;

import java.util.Optional;

public interface ColorRepository extends JpaRepository<Color,Long> {
}
