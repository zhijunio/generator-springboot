# Change Log

## Unreleased
* Added Spring Boot 4.1.0 support with Java 25 compatibility
* Added Java 25 as a selectable generator option
* Added preset support for secure-api, event-driven, and observability-heavy
* Promoted secure-api, event-driven, and observability-heavy presets to Java 25 + Spring Boot 4.1.0
* Added Maven compiler release binding for generated projects
* Added todo project generation and controller verification flow
* Removed unused MkDocs docs site files and docs publish workflow
* Simplified Jackson and AOP wiring for Spring Boot 4.x generated projects

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
