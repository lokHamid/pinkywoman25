package pw25.mainbackend.dtos;

import jakarta.validation.constraints.*;

public record CreateVariantRequest(

        @NotNull(message = "Product ID is required")
        @Positive(message = "Product ID must be positive")
        Long productId,

        @NotNull(message = "Color ID is required")
        @Positive(message = "Color ID must be positive")
        Long colorId,

        @NotNull(message = "Size ID is required")
        @Positive(message = "Size ID must be positive")
        Long sizeId,

        @NotBlank(message = "SKU is required")
        @Size(max = 100, message = "SKU too long")
        String sku,

        @NotNull(message = "Stock quantity is required")
        @Min(value = 0, message = "Stock quantity cannot be negative")
        Integer stockQuantity,
        Double priceAdjustment  // can be null → no adjustment

) {}