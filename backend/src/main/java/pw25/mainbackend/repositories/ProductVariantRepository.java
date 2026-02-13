package pw25.mainbackend.repositories;

import org.jspecify.annotations.NullMarked;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pw25.mainbackend.entities.ProductVariant;

import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant,Long>, JpaSpecificationExecutor<ProductVariant> {
    @NullMarked
    Page<ProductVariant> findAll(Pageable pageable);
    Optional<ProductVariant> findBySku(String sku);
    boolean existsBySku(String sku);
    void deleteBySku(String sku);
}
