package <%= packageName %>.config;

import static <%= packageName %>.config.AppConstants.PROFILE_NOT_PROD;

import com.fasterxml.jackson.databind.ObjectMapper;
import <%= packageName %>.aop.LoggingAspect;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

@Slf4j
@Configuration
@EnableAspectJAutoProxy
public class LoggingAspectConfig {

    @Bean
    @Profile(PROFILE_NOT_PROD)
    public LoggingAspect loggingAspect(Environment env, ObjectMapper objectMapper) {
        log.info("Initializing LoggingAspect for dev or test profile");

        return new LoggingAspect(env, objectMapper);
    }
}
