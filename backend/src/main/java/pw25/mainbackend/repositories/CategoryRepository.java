package pw25.mainbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pw25.mainbackend.entities.Category;

public interface CategoryRepository extends JpaRepository<Category,Long> {
}
