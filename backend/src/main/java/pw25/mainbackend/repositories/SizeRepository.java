package pw25.mainbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pw25.mainbackend.entities.Size;

public interface SizeRepository extends JpaRepository<Size,Long> {
    Long findSizeIdByName(String name);
    boolean existsByName(String name);
}
