package <%= packageName %>.config;

<%_ if (SPRING_BOOT_VERSION.startsWith('4.')) { _%>
import tools.jackson.databind.DeserializationFeature;
<%_ } else { _%>
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.SerializationFeature;
<%_ } _%>
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
<%_ if (SPRING_BOOT_VERSION.startsWith('4.')) { _%>
import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
<%_ } else { _%>
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
<%_ } _%>
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {
    @Bean
    <%_ if (SPRING_BOOT_VERSION.startsWith('4.')) { _%>
    public JsonMapperBuilderCustomizer jacksonCustomizer() {
        return jsonMapperBuilder -> jsonMapperBuilder
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, DeserializationFeature.ACCEPT_FLOAT_AS_INT);
    }
    <%_ } else { _%>
    public Jackson2ObjectMapperBuilderCustomizer jacksonCustomizer() {
        return jacksonObjectMapperBuilder -> jacksonObjectMapperBuilder.featuresToDisable(
                DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,
                DeserializationFeature.ACCEPT_FLOAT_AS_INT,
                SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
    <%_ } _%>

    @Bean
    public JavaTimeModule javaTimeModule() {
        return new JavaTimeModule();
    }
}
