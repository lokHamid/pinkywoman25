package pw25.mainbackend.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pw25.mainbackend.entities.Category;
import pw25.mainbackend.exception_handlers.BusinessException;
import pw25.mainbackend.repositories.CategoryRepository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final Cloudinary  cloudinary;

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }
    @Transactional
    public Category save(Category category, MultipartFile photo) {

        // 1. First save category → now it has real id
        category = categoryRepository.save(category);

        // 2. Now we can safely use real id
        String photoUrl = uploadFile(category.getId(), photo);

        if (photoUrl == null) {
            throw new BusinessException("Failed to upload photo");
        }

        category.setPhoto(photoUrl);

        // 3. Update again with photo url
        return categoryRepository.save(category);
    }
    public Category update(Category category) {
        if(categoryRepository.findById(category.getId()).isPresent()) {
            return categoryRepository.save(category);
        }else{
            return null;
        }
    }
    public void deleteById(Long id) {
        categoryRepository.deleteById(id);
    }

    public String uploadFile(Long categoryId,MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        String folder = "categories/" + categoryId;
        if (file.isEmpty()) {
            return null;
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

        String secureUrl;
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

            secureUrl = (String) uploadResult.get("secure_url");
            if (secureUrl == null || secureUrl.isBlank()) {
                throw new RuntimeException("Cloudinary did not return secure_url");
            }

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
        return secureUrl;
    }

}
