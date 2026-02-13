package pw25.mainbackend.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor          // needed for JPA / Hibernate
@AllArgsConstructor         // optional but useful
@Builder                    // classic builder (can be used together with @SuperBuilder)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name")
    private String customerName;

    private String wilaya;
    private String phone;
    private String address;
    private String notes;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)   // ← recommended for OrderStatus
    private OrderStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp created_at;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Timestamp updated_at;

    @ManyToOne
    @JoinColumn(name = "variant_id")
    private ProductVariant product;

    private Integer quantity;
    private Double unit_price;

    @Column(name = "total", insertable = false, updatable = false)
    private Double total;

    // Optional: custom builder methods or defaults
    public static class OrderBuilder {
        // You can add custom logic here if needed
        public OrderBuilder withPendingStatus() {
            this.status = OrderStatus.pending;
            return this;
        }
    }
}