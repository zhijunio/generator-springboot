# Generator SpringBoot

The Yeoman generator for generating Spring Boot microservices.

## Prerequisites

* Node 18+
* JDK 17+ (Java 21 supported)

## Installation

```shell
$ npm install -g yo
$ npm install -g generator-springboot
```

## How to use?

Run the following command and answer the questions:

```shell
$ yo springboot
```

## Features

The generator-springboot generates a Spring Boot application with the following features configured:

* Spring Boot project with **Maven** or **Gradle** support
* **Java 17** or **Java 21** (LTS, virtual threads)
* Databases: **PostgreSQL, MySQL, MariaDB** with **Spring Data JPA** or **MyBatis Plus**, plus **MongoDB** (NoSQL)
* **Flyway** and **Liquibase** database migration support (XML/YAML/SQL)
* Authentication: **JWT** (Spring Security + jjwt) or **Keycloak** (OAuth2 Resource Server with realm auto-import)
* Caching: **Redis**
* Messaging: **Apache Kafka** or **RabbitMQ**
* Observability: **ELK, Loki, Prometheus + Grafana, Zipkin, Tempo, OpenTelemetry**
* SpringDoc OpenAPI Integration
* Spring Boot Actuator configuration
* Testcontainers based testing and local dev setup
* Docker Compose files for all infrastructure
* Dockerfile with multi-stage build, non-root user and HEALTHCHECK
* GitHub Actions CI (with dependency caching), Jenkinsfile
* SonarQube and JaCoCo static analysis configuration
* Code formatting with Spotless
* JUnit 5, ArchUnit architecture tests

### Generate a SpringBoot Microservice

After installing the `generator-springboot`, you can generate a new Spring Boot application as follows:

```shell
$ yo springboot
Generating SpringBoot Application
? What is the application name? myservice
? What is the default package name? com.mycompany.myservice
? Which type of database you want to use? PostgreSQL
? Which type of database migration tool you want to use? FlywayDB
? Select the features you want? ELK Docker configuration
? Which Java version do you want to use? Java 17
? Which authentication mechanism do you want to use? None
? Which caching solution do you want to use? None
? Which messaging solution do you want to use? None
? Which build tool do you want to use? Maven
   create myservice/pom.xml
   create myservice/Dockerfile
   create myservice/Jenkinsfile
   create myservice/.github/workflows/maven.yml
   create myservice/src/main/java/com/mycompany/myservice/Application.java
   create myservice/src/main/resources/application.yml
   create myservice/src/test/java/com/mycompany/myservice/ApplicationIntegrationTest.java
   create myservice/src/test/java/com/mycompany/myservice/ArchitectureTest.java
   ...
==========================================
Your application is generated successfully
  cd myservice
  > ./mvnw spring-boot:run
==========================================
```

### Generate REST API with CRUD operations

You can generate REST API with CRUD operations using the following command:

**IMPORTANT:** You should run the following command from within the generated project folder.

```shell
$ cd myservice
$ yo springboot:controller Customer --base-path /api/customers
```

This sub-generator will generate the following:

* JPA entity
* Spring Data JPA Repository
* Service
* Spring MVC REST Controller with CRUD operations (paginated, with OpenAPI annotations)
* Unit and Integration Tests for REST Controller
* Flyway or Liquibase migration to create table

```shell
$ yo springboot:controller Customer --base-path /api/customers
Generating Entity, repository, service and controller
   create src/main/java/com/mycompany/myservice/entity/Customer.java
   create src/main/java/com/mycompany/myservice/repository/CustomerRepository.java
   create src/main/java/com/mycompany/myservice/service/CustomerService.java
   create src/main/java/com/mycompany/myservice/web/controller/CustomerController.java
   create src/main/resources/db/migration/postgresql/V2__create_customer_table.sql
   ...
```

## Local Development Setup

```shell
$ git clone https://github.com/chensoul/generator-springboot.git
$ cd generator-springboot
$ npm install -g yo
$ npm install
$ npm link
$ yo springboot
```

## Releasing a new version

Push a version tag (`v*`) and the GitHub Actions workflow publishes the package to npm automatically:

```shell
$ npm version patch   # bumps version and creates a git tag
$ git push origin main --tags
```

Requires the `NPM_TOKEN` secret in the repository.

## License

The **generator-springboot** is an Open Source software released under
the [MIT Licence](https://opensource.org/license/mit/)
