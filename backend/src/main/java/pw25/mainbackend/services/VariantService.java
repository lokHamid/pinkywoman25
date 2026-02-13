package pw25.mainbackend.services;

import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pw25.mainbackend.dtos.CreateVariantRequest;
import pw25.mainbackend.entities.Color;
import pw25.mainbackend.entities.Product;
import pw25.mainbackend.entities.ProductVariant;
import pw25.mainbackend.entities.Size;
import pw25.mainbackend.exception_handlers.BusinessException;
import pw25.mainbackend.exception_handlers.ResourceNotFoundException;
import pw25.mainbackend.repositories.ColorRepository;
import pw25.mainbackend.repositories.ProductRepository;
import pw25.mainbackend.repositories.ProductVariantRepository;
import pw25.mainbackend.repositories.SizeRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final ColorRepository colorRepository;
    private final SizeRepository sizeRepository;

    // ==================== READ OPERATIONS ====================

    public List<ProductVariant> findAll() {
        return variantRepository.findAll();
    }

    public Optional<ProductVariant> findBySku(String sku) {
        return variantRepository.findBySku(sku);
    }

    /**
     * Get variant by SKU or throw ResourceNotFoundException
     */
    public ProductVariant getBySku(String sku) {
        return findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "sku", sku));
    }

//    /**
//     * Advanced search with optional filters: color, size, product
//     */
//    public Page<ProductVariant> search(Long colorId, Long sizeId, Long productId, Pageable pageable) {
//        Specification<ProductVariant> spec = Specification.where();
//
//        if (colorId != null) {
//            Color color = colorRepository.findById(colorId)
//                    .orElseThrow(() -> new ResourceNotFoundException("Color", "id", colorId.toString()));
//            spec = spec.and((root, query, cb) -> cb.equal(root.get("color"), color));
//        }
//
//        if (sizeId != null) {
//            Size size = sizeRepository.findById(sizeId)
//                    .orElseThrow(() -> new ResourceNotFoundException("Size", "id", sizeId.toString()));
//            spec = spec.and((root, query, cb) -> cb.equal(root.get("size"), size));
//        }
//
//        if (productId != null) {
//            Product product = productRepository.findById(productId)
//                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId.toString()));
//            spec = spec.and((root, query, cb) -> cb.equal(root.get("product"), product));
//        }
//
//        return variantRepository.findAll(spec, pageable);
//    }

    // ==================== WRITE OPERATIONS ====================

    /**
     * Create a new product variant with full validation
     */
    @Transactional
    public ProductVariant create(CreateVariantRequest request) {
        // Validate related entities exist
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.productId().toString()));

        Color color = colorRepository.findById(request.colorId())
                .orElseThrow(() -> new ResourceNotFoundException("Color", "id", request.colorId().toString()));

        Size size = sizeRepository.findById(request.sizeId())
                .orElseThrow(() -> new ResourceNotFoundException("Size", "id", request.sizeId().toString()));

        // Validate SKU uniqueness
        if (variantRepository.existsBySku(request.sku())) {
            throw new BusinessException("A variant with SKU '" + request.sku() + "' already exists", HttpStatus.CONFLICT);
        }

        // Build and save
        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .color(color)
                .size(size)
                .sku(request.sku())
                .stock_quantity(request.stockQuantity())
                .price_adjustment(request.priceAdjustment() != null ? request.priceAdjustment() : 0.0)
                .build();

        return variantRepository.save(variant);
    }

    /**
     * Full update of a variant (PUT semantics) - replaces all fields
     * SKU can be changed, but must remain unique
     */
    @Transactional
    public ProductVariant update(String currentSku, CreateVariantRequest request) {
        ProductVariant existing = getBySku(currentSku);

        // Validate related entities
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.productId().toString()));

        Color color = colorRepository.findById(request.colorId())
                .orElseThrow(() -> new ResourceNotFoundException("Color", "id", request.colorId().toString()));

        Size size = sizeRepository.findById(request.sizeId())
                .orElseThrow(() -> new ResourceNotFoundException("Size", "id", request.sizeId().toString()));

        // Check SKU uniqueness (allow same SKU if not changing)
        String newSku = request.sku();
        if (!newSku.equals(currentSku) && variantRepository.existsBySku(newSku)) {
            throw new BusinessException("SKU '" + newSku + "' is already in use", HttpStatus.CONFLICT);
        }

        // Update all fields
        existing.setProduct(product);
        existing.setColor(color);
        existing.setSize(size);
        existing.setSku(newSku);
        existing.setStock_quantity(request.stockQuantity());
        existing.setPrice_adjustment(request.priceAdjustment() != null ? request.priceAdjustment() : 0.0);

        return variantRepository.save(existing);
    }

    /**
     * Delete variant by SKU with existence check
     */
    @Transactional
    public void deleteBySku(String sku) {
        if (!variantRepository.existsBySku(sku)) {
            throw new ResourceNotFoundException("ProductVariant", "sku", sku);
        }
        variantRepository.deleteBySku(sku);
    }

    // ==================== HELPER METHODS ====================

    public boolean existsBySku(String sku) {
        return variantRepository.existsBySku(sku);
    }

    @Transactional
    public ProductVariant updateStock(String sku, int newStock) {
        ProductVariant variant = variantRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found with SKU: " + sku));

        variant.setStock_quantity(newStock);

        return variantRepository.save(variant);
    }
}