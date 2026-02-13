package pw25.mainbackend.dtos;

import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record CreateProductRequest(

        @NotNull(message = "Category ID is required")
        @Positive(message = "Category ID must be positive")
        Long categoryId,

        @NotBlank(message = "Product name is required")
        @Size(min = 3, max = 100, message = "Name must be 3-100 characters")
        String name,

        @Size(max = 1000, message = "Description cannot exceed 1000 characters")
        String description,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be at least 0.01")
        @DecimalMax(value = "999999.99", message = "Price cannot exceed 999999.99")
        Double price
) {}