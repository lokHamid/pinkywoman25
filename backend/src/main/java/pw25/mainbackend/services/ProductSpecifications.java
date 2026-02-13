package pw25.mainbackend.services;

import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import pw25.mainbackend.dtos.ProductFilter;
import pw25.mainbackend.entities.*;

import java.util.ArrayList;
import java.util.List;

public final class ProductSpecifications {

    private ProductSpecifications() {}

    public static Specification<Product> byFilter(ProductFilter filter) {
        return (root, query, cb) -> {

            if (filter.isEmpty()) {
                return cb.conjunction(); // no filters → match all
            }

            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            // ── Category ───────────────────────────────────────────────
            if (!filter.getCategoryIds().isEmpty()) {
                var category = root.get("category");
                predicates.add(category.get("id").in(filter.getCategoryIds()));
            }

            // ── Sizes (via ProductVariant) ─────────────────────────────
            if (!filter.getSizeIds().isEmpty()) {
                var variantJoin = root.joinList("variants", JoinType.LEFT);
                predicates.add(variantJoin.get("size").get("id").in(filter.getSizeIds()));
                query.distinct(true);
            }

            // ── Colors (via ProductVariant) ────────────────────────────
            if (!filter.getColorIds().isEmpty()) {
                var variantJoin = root.joinList("variants", JoinType.LEFT);
                predicates.add(variantJoin.get("color").get("id").in(filter.getColorIds()));
                query.distinct(true);
            }

            // ── Price range ────────────────────────────────────────────
            // We use product.price here (most shops filter on base price)
            // If you want to consider variant price_adjustment → more complex logic needed
            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("price"), filter.getMinPrice()));
            }
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("price"), filter.getMaxPrice()));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
