# <%= appName %>

This project was created with [generator-springboot](https://github.com/chensoul/generator-springboot/).

## Included

- JDK: <%= JAVA_VERSION %>
<%_ if (buildTool === 'maven') { _%>
- Maven: <%= MAVEN_VERSION %>
<%_ } _%>
<%_ if (buildTool === 'gradle') { _%>
- Gradle: <%= GRADLE_VERSION %>
<%_ } _%>
- Spring Boot: <%= SPRING_BOOT_VERSION %>
- Spring Cloud: <%= SPRING_CLOUD_VERSION %>
<%_ if (databaseType === 'postgresql') { _%>
- PostgreSQL: <%= POSTGRESQL_IMAGE_VERSION %>
<%_ } _%>
<%_ if (databaseType === 'mysql') { _%>
- MySQL: <%= MYSQL_IMAGE_VERSION %>
<%_ } _%>
<%_ if (databaseType === 'mariadb') { _%>
- MariaDB: <%= MARIADB_IMAGE_VERSION %>
<%_ } _%>
<%_ if (persistence === 'mybatis') { _%>
- MyBatis Plus: <%= MYBATIS_PLUS_VERSION %>
<%_ } _%>
<%_ if (dbMigrationTool === 'flywaydb') { _%>
- Flyway
<%_ } _%>
<%_ if (dbMigrationTool === 'liquibase') { _%>
- Liquibase
<%_ } _%>
- SpringDoc: <%= SPRINGDOC_OPENAPI_VERSION %>
<%_ if (authenticationType === 'jwt') { _%>
- JWT authentication
<%_ } _%>
<%_ if (authenticationType === 'keycloak') { _%>
- Keycloak resource server
<%_ } _%>
<%_ if (cacheType === 'redis') { _%>
- Redis cache
<%_ } _%>
<%_ if (messagingType === 'kafka') { _%>
- Kafka messaging
<%_ } _%>
<%_ if (messagingType === 'rabbitmq') { _%>
- RabbitMQ messaging
<%_ } _%>
<%_ if (loggingType === 'loki') { _%>
- Loki logging
<%_ } _%>
<%_ if (features.includes('elk')) { _%>
- ELK stack
<%_ } _%>
<%_ if (features.includes('monitoring')) { _%>
- Prometheus, Grafana, and Tempo
<%_ } _%>
<%_ if (features.includes('otel')) { _%>
- OpenTelemetry tracing
<%_ } _%>

## Build

```bash
<%_ if (buildTool === 'maven') { _%>
./mvnw clean package
<%_ } _%>
<%_ if (buildTool === 'gradle') { _%>
./gradlew clean bootJar
<%_ } _%>
```

Run the application:

```bash
<%_ if (buildTool === 'maven') { _%>
java -jar target/*.jar
<%_ } _%>
<%_ if (buildTool === 'gradle') { _%>
java -jar build/libs/*.jar
<%_ } _%>
```

## Code quality

```bash
<%_ if (buildTool === 'maven') { _%>
./mvnw spotless:apply
<%_ } _%>
<%_ if (buildTool === 'gradle') { _%>
./gradlew spotlessApply
<%_ } _%>
```

```bash
<%_ if (buildTool === 'maven') { _%>
./mvnw clean verify sonar:sonar -Dsonar.login=<sonar-login> -Dsonar.password=<sonar-password>
<%_ } _%>
<%_ if (buildTool === 'gradle') { _%>
./gradlew clean check jacocoTestReport sonarqube -Dsonar.login=<sonar-login> -Dsonar.password=<sonar-password>
<%_ } _%>
```

## Docker Compose

```bash
docker compose -f docker-compose.yml up -d
docker compose -f docker-compose.yml down
```
