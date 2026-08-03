# Change Log

## Version 0.3.0
* Added JWT authentication (Spring Security + jjwt)
* Added Keycloak authentication (OAuth2 Resource Server) with realm auto-import
* Added Redis cache support
* Added Kafka and RabbitMQ messaging support
* Added MongoDB support (NoSQL, auto-disables JPA/SQL migrations)
* Added OpenTelemetry tracing
* Added Java 21 option (LTS, virtual threads)
* Added ArchUnit architecture tests to generated projects
* Enhanced controller generator: OpenAPI annotations and search parameter
* Dockerfile: non-root user and HEALTHCHECK
* Generator prompts reuse previous answers (.yo-rc.json)
* Upgraded generator dependencies (yeoman 8, chai 6, mocha 11)
* Added ESLint + Prettier, Node engines, AGENTS.md
* CI: node 22 in matrix, lint step, npm publish workflow

## Version 0.2.0
* Upgrade Spring Boot version to 3.4.x
* Upgraded Maven and Gradle versions
* Upgraded generator dependencies
* Removed AWS and Localstack support
