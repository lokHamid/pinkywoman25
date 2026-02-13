package pw25.mainbackend.exception_handlers;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BusinessException extends RuntimeException {
    private final HttpStatus httpStatus;

    public BusinessException(String message, HttpStatus httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }

    // Constructor for backward compatibility with status code
    public BusinessException(String message, int statusCode) {
        super(message);
        this.httpStatus = HttpStatus.valueOf(statusCode);
    }

    // Simple constructor
    public BusinessException(String message) {
        super(message);
        this.httpStatus = HttpStatus.BAD_REQUEST;
    }

}