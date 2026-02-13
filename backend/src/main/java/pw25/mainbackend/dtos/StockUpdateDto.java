package pw25.mainbackend.dtos;

import jakarta.validation.constraints.Min;

public record StockUpdateDto(
        @Min(value = 0, message = "Stock cannot be negative")
        int stock
) {
}
