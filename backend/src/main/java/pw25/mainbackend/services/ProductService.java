package pw25.mainbackend.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.api.ApiResponse;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pw25.mainbackend.dtos.CreateProductRequest;
import pw25.mainbackend.dtos.ProductFilter;
import pw25.mainbackend.dtos.UpdateProductRequest;
import pw25.mainbackend.entities.Category;
import pw25.mainbackend.entities.Product;
import pw25.mainbackend.exception_handlers.BusinessException;
import pw25.mainbackend.exception_handlers.ResourceNotFoundException;
import pw25.mainbackend.repositories.CategoryRepository;
import pw25.mainbackend.repositories.ProductRepository;

import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final Cloudinary cloudinary;

    // ==================== READ OPERATIONS ====================

    public Page<Product> findAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Optional<Product> getById(Long id) {
        return productRepository.findById(id);
    }
    @Transactional
    public Product create(CreateProductRequest request,List<MultipartFile> files) {
        if (productRepository.existsByName(request.name())) {
            throw new BusinessException("Product name '" + request.name() + "' already exists", HttpStatus.CONFLICT);
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId().toString()));

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .category(category)
                .photos(List.of())           // filld latr
                .build();

        product = productRepository.save(product);  // now has id

        if (files != null && !files.isEmpty()) {
            List<String> urls = uploadFiles(files, product.getId());
            product.setPhotos(urls);
            product = productRepository.save(product); // second save
        }
        return productRepository.save(product);
    }

    @Transactional
    public Product partialUpdate(Long id, UpdateProductRequest request,List<MultipartFile> files) {
        Product product = getById(id).orElseThrow(() -> new ResourceNotFoundException("Product","id",id.toString()));

        if (request.name() != null
                && !request.name().equals(product.getName())
                && productRepository.existsByName(request.name())) {
            throw new BusinessException("Product name '" + request.name() + "' already exists", HttpStatus.CONFLICT);
        }

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId().toString()));
            product.setCategory(category);
        }

        if (request.name() != null) {
            product.setName(request.name());
        }
        if (request.description() != null) {
            product.setDescription(request.description());
        }
        if (request.price() != null) {
            product.setPrice(request.price());
        }
        if (files != null && !files.isEmpty()) {
            List<String> photoUrls = List.of();
            try {
                photoUrls = uploadFiles(files, product.getId());
            } catch (BusinessException e) {
                System.out.println(e.getMessage());
            }
            product.setPhotos(photoUrls);
        }

        return productRepository.save(product);
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", "id", id.toString());
        }

        deleteProductImages(id);
        productRepository.deleteById(id);
    }



    //utils:
    public List<String> uploadFiles(List<MultipartFile> files, Long productId) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }
        List<String> urls = new ArrayList<>();
        String folder = "products/" + productId;


        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new BusinessException(
                        "File " + file.getOriginalFilename() + " is not an image",
                        HttpStatus.BAD_REQUEST
                );
            }

            long maxSizeBytes = 5 * 1024 * 1024; //5 mega
            if (file.getSize() > maxSizeBytes) {
                throw new BusinessException(
                        "File " + file.getOriginalFilename() + " exceeds 5MB limit",
                        HttpStatus.BAD_REQUEST

                );
            }

            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder", folder,
                                "resource_type", "image",
                                "overwrite", false,           // don't replace if same name
                                "use_filename", true,         // try to keep original name
                                "unique_filename", true       // add suffix if conflict
                        )
                );

                String secureUrl = (String) uploadResult.get("secure_url");
                if (secureUrl == null || secureUrl.isBlank()) {
                    throw new RuntimeException("Cloudinary did not return secure_url");
                }

                urls.add(secureUrl);

            } catch (IOException e) {
                throw new BusinessException(
                        "Failed to read file " + file.getOriginalFilename(),
                        HttpStatus.INTERNAL_SERVER_ERROR
                );
            } catch (Exception e) {
                throw new BusinessException(
                        "Cloudinary upload failed for " + file.getOriginalFilename() + ": " + e.getMessage(),
                        HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
        return urls;
    }

    public void deleteProductImages(Long productId) {
        if (productId == null || productId <= 0) {
            return;
        }

        String folderPrefix = "products/" + productId + "/";  // trailing slash = exact folder match

        try {
            ApiResponse result = cloudinary.api().deleteResourcesByPrefix(
                    folderPrefix,
                    ObjectUtils.asMap(
                            "resource_type", "image",
                            "invalidate", true,          // purge from CDN (recommended)
                            "keep_original", false       // optional: delete derived too if any
                    )
            );

            // Optional: inspect result for debugging
            System.out.println("Delete by prefix result: " + result);

            // Cloudinary returns something like { "prefix": "...", "deleted": {ids...}, "partial": false }
            // If no exception → consider success (even if zero deleted)

        } catch (Exception e) {
            // Log in production: log.error("Failed to delete Cloudinary folder for product {}: {}", productId, e.getMessage(), e);
            System.err.println("Cloudinary delete failed for product " + productId + ": " + e.getMessage());
        }
    }

    public Page<Product> findProductsByFilters(ProductFilter filter, Pageable pageable) {
        Specification<Product> spec = ProductSpecifications.byFilter(filter);
        return productRepository.findAll(spec, pageable);
    }
}