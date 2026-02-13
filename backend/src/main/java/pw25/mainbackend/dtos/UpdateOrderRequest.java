package pw25.mainbackend.dtos;

import java.sql.Timestamp;

public record UpdateOrderRequest(
        String customer_name,
        String wilaya,
        String phone_number,
        String address,
        String notes,
        String status,
        Timestamp created_at,
        Timestamp updated_at,
        Long variantId,
        Integer quantity,
        Double unit_price
){}
