package pw25.mainbackend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pw25.mainbackend.entities.Size;
import pw25.mainbackend.repositories.SizeRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor(onConstructor_ =  @Autowired)
public class SizeService {
    private final SizeRepository sizeRepository;

    public List<Size> findAll() {
        return sizeRepository.findAll();
    }
    public Optional<Size> findById(Long id) {
        return sizeRepository.findById(id);
    }
    public Optional<Size> save(Size size) {
        return Optional.of(sizeRepository.save(size));
    }
    public boolean existsByName(String name) {
        return sizeRepository.existsByName(name);
    }
    public boolean existsById(Long id) {
        return sizeRepository.existsById(id);
    }
    public void deleteById(Long id) {
        sizeRepository.deleteById(id);
    }
    public Optional<Long> findSizeIdByName(String name) {
        return Optional.ofNullable(sizeRepository.findSizeIdByName(name));
    }
}
