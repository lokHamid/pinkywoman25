package pw25.mainbackend.controllers;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pw25.mainbackend.dtos.CreateVariantRequest;
import pw25.mainbackend.dtos.StockUpdateDto;
import pw25.mainbackend.entities.ProductVariant;
import pw25.mainbackend.services.VariantService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final VariantService variantService;

    // ==================== READ ====================

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping
    public List<ProductVariant> findAll() {
        return variantService.findAll();
    }

    @GetMapping("/{sku}")
    public ResponseEntity<ProductVariant> findBySku(@PathVariable String sku) {
        return variantService.findBySku(sku)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== CREATE ====================

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<ProductVariant> create(@Valid @RequestBody CreateVariantRequest request) {
        ProductVariant created = variantService.create(request);
        URI location = URI.create("/api/variants/" + created.getSku());
        return ResponseEntity.created(location).body(created);
    }

    // ==================== UPDATE (Full or Partial) ====================
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{sku}")
    public ResponseEntity<ProductVariant> update(
            @PathVariable String sku,
            @Valid @RequestBody CreateVariantRequest request) {  // Reusing same DTO for full replacement

        ProductVariant updated = variantService.update(sku, request);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{sku}/stock")
    public ResponseEntity<ProductVariant> updateStock(
            @PathVariable String sku,
            @Valid @RequestBody StockUpdateDto stockDto) {

        ProductVariant updated = variantService.updateStock(sku, stockDto.stock());
        return ResponseEntity.ok(updated);
    }

    // ==================== DELETE ====================
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{sku}")
    public ResponseEntity<Void> delete(@PathVariable String sku) {
        variantService.deleteBySku(sku);
        return ResponseEntity.noContent().build();
    }
}