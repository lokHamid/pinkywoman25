package pw25.mainbackend.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // retrieve root product:
    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;
    //color:
    @ManyToOne
    @JoinColumn(name = "color_id")
    private Color color;
    //size:
    @ManyToOne
    @JoinColumn(name = "size_id")
    private Size size;
    //
    @Column(unique = true)
    private String sku;
    private Integer stock_quantity = 0;
    private Double price_adjustment = 0.0;
}
