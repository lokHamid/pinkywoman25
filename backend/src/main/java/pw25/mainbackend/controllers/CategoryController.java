package pw25.mainbackend.controllers;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pw25.mainbackend.entities.Category;
import pw25.mainbackend.services.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class CategoryController {
    private final CategoryService categoryService;
    @GetMapping()
    public List<Category> findAll() {
        return categoryService.findAll();
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping()
    public ResponseEntity<Category> save(
            @RequestPart("data") @Valid Category category,
            @RequestPart("photo") MultipartFile photo
    ) {
        categoryService.save(category,photo);
        return ResponseEntity.ok(category);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Category> update(@PathVariable @NotNull Long id, @RequestBody @Valid Category category) {
        return ResponseEntity.ok(categoryService.update(category));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @NotNull Long id) {
        categoryService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
