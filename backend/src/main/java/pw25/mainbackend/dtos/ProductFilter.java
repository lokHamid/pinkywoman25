package pw25.mainbackend.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilter {

    @Builder.Default
    private List<Long> categoryIds = Collections.emptyList();

    @Builder.Default
    private List<Long> sizeIds = Collections.emptyList();

    @Builder.Default
    private List<Long> colorIds = Collections.emptyList();

    private Double minPrice;
    private Double maxPrice;

    // Convenience method to check if any real filtering is active
    public boolean isEmpty() {
        return categoryIds.isEmpty() &&
                sizeIds.isEmpty() &&
                colorIds.isEmpty() &&
                minPrice == null &&
                maxPrice == null;
    }

    // Helper to parse comma-separated string → List<Long>
    public static List<Long> parseIds(String commaSeparated) {
        if (commaSeparated == null || commaSeparated.trim().isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return List.of(commaSeparated.split(","))
                    .stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .toList();
        } catch (NumberFormatException e) {
            // In real app → throw meaningful exception or log + return empty
            return Collections.emptyList();
        }
    }
}
