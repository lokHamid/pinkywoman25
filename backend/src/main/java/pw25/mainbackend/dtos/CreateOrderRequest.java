package pw25.mainbackend.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(
        @NotBlank
        @Size(min = 5,max = 50)
        String customer_name,
        @NotBlank
        @Size(min = 5,max = 70)
        String wilaya,
        @NotBlank(message = "Phone number is required!")
        @Size(min = 9,max = 10)
        String phone_number,
        String address,
        String notes,
        @NotBlank(message = "status is required!")
        @Size(min = 3,max = 20)
        String status,
        @NotNull(message = "Provide a valid variant id!")
        Long variantId,
        @NotNull
        Integer quantity,
        @NotNull
        Double unit_price
){}
