package pw25.mainbackend.services;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Component
@Service
public class PhotoUploaderService {
    public ResponseEntity<?> uploadPhoto(List<MultipartFile> files) {
        return null; // later will be implemented
    }
}
