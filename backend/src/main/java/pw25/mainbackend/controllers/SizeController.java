package pw25.mainbackend.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pw25.mainbackend.entities.Size;
import pw25.mainbackend.services.SizeService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sizes")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class SizeController {
    private final SizeService sizeService;
    @GetMapping()
    public List<Size> findAll(){
        return sizeService.findAll();
    }
    @GetMapping("/{id}")
    public ResponseEntity<Size> findById(@PathVariable Long id){
        return sizeService.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/temp_auth_check")
    public ResponseEntity<Object> returnSuccessMessage(){
        return ResponseEntity.ok(Map.of("message", "success"));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping()
    public ResponseEntity<Size> save(@RequestBody @Valid Size size){
        if(sizeService.existsByName(size.getName())){
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }

        return sizeService.save(size).map(ResponseEntity::ok).orElse(ResponseEntity.badRequest().build());
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        if(sizeService.findById(id).isEmpty()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        sizeService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
