package <%= packageName %>.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
public class RabbitMQConfig {

    public static final String ORDER_QUEUE = "orders";

    @Bean
    public Queue orderQueue() {
        return new Queue(ORDER_QUEUE, true);
    }
}
