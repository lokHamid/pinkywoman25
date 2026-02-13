package pw25.mainbackend.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pw25.mainbackend.dtos.CreateProductRequest;
import pw25.mainbackend.dtos.ProductFilter;
import pw25.mainbackend.dtos.UpdateProductRequest;
import pw25.mainbackend.entities.Product;
import pw25.mainbackend.services.ProductService;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<Product> findAll() {
        return productService.findAll();
    }

    @GetMapping("/pageable")
    public ResponseEntity<Page<Product>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,

            @RequestParam(required = false) String categoryIds,   // "1,3,5"
            @RequestParam(required = false) String sizeIds,        // "2,4,6"
            @RequestParam(required = false) String colorIds,       // "1,5,8"

            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending()); // or by created_at, name, etc.

        ProductFilter filter = ProductFilter.builder()
                .categoryIds(ProductFilter.parseIds(categoryIds))
                .sizeIds(ProductFilter.parseIds(sizeIds))
                .colorIds(ProductFilter.parseIds(colorIds))
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .build();

        Page<Product> products = productService.findProductsByFilters(filter, pageable);

        return ResponseEntity.ok(products);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Product> findById(@PathVariable Long id) {
        return productService.getById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()); // throws if not found
    }

    // ==============================create,update,delete=====================================

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> create(
            @RequestPart("data") @Valid CreateProductRequest dto,
            @RequestPart("photos") List<MultipartFile> photos
    ) {
        Product product = productService.create(dto,photos);
        URI location = URI.create("/api/products/" + product.getId());
        return ResponseEntity.created(location).body(product);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Product update(
            @PathVariable Long id,
            @RequestPart(value = "data", required = false) @Valid UpdateProductRequest dto,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos
    ) {
        return productService.partialUpdate(id, dto, photos);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}