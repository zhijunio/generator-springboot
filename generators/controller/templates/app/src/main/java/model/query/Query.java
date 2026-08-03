package <%= packageName %>.model.query;

import org.springframework.data.domain.Pageable;

public record <%= entityName %>Query(Pageable pageable, String search) {
}
