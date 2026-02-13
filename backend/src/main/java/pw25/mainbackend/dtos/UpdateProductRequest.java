package pw25.mainbackend.dtos;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record UpdateProductRequest(
        String name,
        String description,
        Double price,
        Long categoryId
) {}
