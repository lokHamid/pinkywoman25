package pw25.mainbackend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pw25.mainbackend.entities.Color;
import pw25.mainbackend.repositories.ColorRepository;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class ColorService {
    private final ColorRepository colorRepository;
    public List<Color> findAll() {
        return colorRepository.findAll();
    }
    public Optional<Color> findById(Long id) {
        return colorRepository.findById(id);
    }
    public Color save(Color color) {
        return colorRepository.save(color);
    }
    public void deleteColorById(Long id) {
        colorRepository.deleteById(id);
    }
}
