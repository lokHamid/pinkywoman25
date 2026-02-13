package pw25.mainbackend.controllers;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pw25.mainbackend.entities.Color;
import pw25.mainbackend.services.ColorService;

import java.util.List;

@RestController
@RequestMapping("/api/colors")
@RequiredArgsConstructor (onConstructor_ = @Autowired)
public class ColorController {
    private final ColorService colorService;

    @GetMapping()
    public List<Color> getAllColors() {
        return colorService.findAll();
    }
    @GetMapping("/{id}")
    public ResponseEntity<Color> getColorById(@PathVariable Long id) {
        return colorService.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping()
    public ResponseEntity<Color> saveColor(@Valid @RequestBody Color color) {
        Color savedColor = colorService.save(color);
        return ResponseEntity.ok(savedColor);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteColor(@PathVariable @NotNull Long id) {
        if(colorService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        colorService.deleteColorById(id);
        return ResponseEntity.noContent().build(); //no content as success message.
    }
}
