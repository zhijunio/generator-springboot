# Generator SpringBoot

Yeoman generator for Spring Boot 3.x microservices.

## Prerequisites

- Node 18+
- JDK 17+ (Java 21 and 25 supported)

## Installation

```shell
npm install -g yo
npm install -g generator-springboot
```

## Usage

```shell
yo springboot
```

## What it generates

- Spring Boot 3.4.x or 4.1.0
- Maven or Gradle
- Java 17, 21, or 25
- PostgreSQL, MySQL, MariaDB, or MongoDB
- JPA or MyBatis Plus
- Flyway or Liquibase
- JWT or Keycloak authentication
- Redis
- Kafka or RabbitMQ
- ELK, Loki, Prometheus + Grafana, Tempo, OpenTelemetry
- SpringDoc OpenAPI
- Actuator, Testcontainers, Docker Compose, Dockerfile, CI, Sonar, Spotless, JUnit 5, ArchUnit

## Project presets

For common cases, pick a preset and skip most of the prompts.

| Preset | What it does |
|---|---|
| `custom` | Answer every question |
| `minimal` | Smallest default API |
| `secure-api` | JWT-secured API on Java 25 |
| `event-driven` | Kafka + Redis service |
| `observability-heavy` | ELK, Loki, monitoring, and OTel enabled |

## Controller sub-generator

```shell
cd myservice
yo springboot:controller Customer --base-path /api/customers
```

This generates the entity, repository, service, controller, tests, and matching Flyway or Liquibase migration.

## Local development

```shell
git clone https://github.com/chensoul/generator-springboot.git
cd generator-springboot
npm install -g yo
npm install
npm link
yo springboot
```

## Releasing

Push a version tag (`v*`) and GitHub Actions publishes the package to npm.

```shell
npm version patch
git push origin main --tags
```

Requires the `NPM_TOKEN` secret in the repository.
