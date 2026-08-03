import path from 'path';
import assert from 'yeoman-assert';
import fse from 'fs-extra';
import { fileURLToPath } from 'url';
import constants from '../generators/constants.js';
import { runServerGenerator } from './helpers/yeoman-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('SpringBoot Generator', () => {
    const serverGeneratorPath = path.join(__dirname, '../generators/server');

    // Helper function to test server generator with different configurations
    const testServerGenerator = async (
        testName,
        prompts,
        expectedFiles,
        additionalChecks,
        options = { formatCode: false },
        setup
    ) => {
        it(testName, async () => {
            await runServerGenerator({
                generatorPath: serverGeneratorPath,
                prompts,
                options,
                setup
            });

            // Check expected files exist
            expectedFiles.forEach(file => assert.file(file));

            // Run additional checks if provided
            if (additionalChecks) {
                additionalChecks();
            }
        });
    };

    // Maven based generation
    describe('Generate minimal microservice using Maven', () => {
        testServerGenerator(
            'creates expected default files for minimal microservice with maven',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "buildTool": "maven",
                "features": []
            },
            ['myservice/pom.xml']
        );
    });

    describe('Generate basic microservice using Maven with Flyway', () => {
        testServerGenerator(
            'creates expected default files for basic microservice with maven',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "maven",
                "features": []
            },
            ['myservice/pom.xml',
             'myservice/src/test/java/com/mycompany/myservice/SchemaValidationTest.java'],
            () => {
                // Content assertions: pom.xml carries the configured framework versions
                assert.fileContent('myservice/pom.xml', new RegExp(`<java.version>${constants.JAVA_VERSION}</java.version>`));
                assert.fileContent('myservice/pom.xml', new RegExp(`<springdoc-openapi.version>${constants.SPRINGDOC_OPENAPI_VERSION}</springdoc-openapi.version>`));
                // application.yml carries flyway migration configuration
                assert.fileContent('myservice/src/main/resources/application.yml', /spring\.flyway\.locations/);
            }
        );
    });

    describe('Generate basic microservice using Maven with Liquibase', () => {
        testServerGenerator(
            'creates expected default files for basic microservice with maven',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "liquibase",
                "buildTool": "maven",
                "features": []
            },
            ['myservice/pom.xml']
        );
    });

    describe('Generate complete microservice using Maven', () => {
        testServerGenerator(
            'creates expected default files for complete microservice with maven',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "maven",
                "features": ["elk", "monitoring"]
            },
            [
                'myservice/pom.xml',
                'myservice/docker/docker-compose.yml',
                'myservice/docker/docker-compose-elk.yml',
                'myservice/docker/docker-compose-monitoring.yml',
                'myservice/src/main/java/com/mycompany/myservice/config/MetricConfig.java',
                'myservice/src/main/java/com/mycompany/myservice/util/AggravateMetricsEndpoint.java'
            ],
            () => {
                // Content assertions: full-featured project wires monitoring + ELK + cloud deps
                assert.fileContent('myservice/pom.xml', new RegExp(`<version>${constants.SPRING_BOOT_VERSION}</version>`));
                assert.fileContent('myservice/pom.xml', /springdoc-openapi/);
                assert.fileContent('myservice/docker/docker-compose-monitoring.yml', /grafana/);
            },
            {} // keep real build (formatCode) for this end-to-end case
        );
    });

    // Gradle based generation
    describe('Generate minimal microservice using Gradle', () => {
        testServerGenerator(
            'creates expected default files for minimal microservice with Gradle',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "buildTool": "gradle",
                "features": []
            },
            ['myservice/build.gradle']
        );
    });

    describe('Generate microservice with Spring Boot 4.1.0 using Maven', () => {
        testServerGenerator(
            'creates expected files for Spring Boot 4.1.0',
            {
                "appName": "boot4service",
                "packageName": "com.mycompany.boot4service",
                "packageFolder": "com/mycompany/boot4service",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "maven",
                "springBootVersion": "4.1.0",
                "features": []
            },
            ['boot4service/pom.xml'],
            () => {
                assert.fileContent('boot4service/pom.xml', /<version>4\.1\.0<\/version>/);
                assert.fileContent('boot4service/pom.xml', /<spring-cloud.version>2025\.1\.2<\/spring-cloud.version>/);
                assert.fileContent('boot4service/README.md', /Spring Boot: 4\.1\.0/);
            }
        );
    });

    // Security: JWT based generation
    describe('Generate microservice with JWT authentication using Maven', () => {
        testServerGenerator(
            'creates expected security files for JWT authentication',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "maven",
                "authenticationType": "jwt",
                "features": []
            },
            [
                'myservice/src/main/java/com/mycompany/myservice/config/security/SecurityConfig.java',
                'myservice/src/main/java/com/mycompany/myservice/config/security/OpenApiSecurityConfig.java',
                'myservice/src/main/java/com/mycompany/myservice/config/security/JwtService.java',
                'myservice/src/main/java/com/mycompany/myservice/config/security/JwtAuthenticationFilter.java',
                'myservice/src/main/java/com/mycompany/myservice/web/controller/AuthController.java',
                'myservice/src/main/java/com/mycompany/myservice/model/request/LoginRequest.java',
                'myservice/src/main/java/com/mycompany/myservice/model/response/LoginResponse.java'
            ],
            () => {
                assert.fileContent('myservice/pom.xml', /spring-boot-starter-security/);
                assert.fileContent('myservice/pom.xml', new RegExp(`<jjwt.version>${constants.JJWT_VERSION}</jjwt.version>`));
                assert.fileContent('myservice/src/main/resources/application.yml', /application\.jwt\.secret/);
                assert.fileContent('myservice/src/main/resources/application.yml', /management\.endpoints\.web\.exposure\.include: health,info,metrics,prometheus,aggmetrics/);
                assert.fileContent('myservice/src/main/resources/application.yml', /management\.endpoint\.health\.show-details: when_authorized/);
                assert.fileContent('myservice/src/main/java/com/mycompany/myservice/config/security/SecurityConfig.java', /"\/actuator\/health"/);
                assert.fileContent('myservice/src/main/java/com/mycompany/myservice/config/security/SecurityConfig.java', /"\/actuator\/info"/);
                assert.noFileContent('myservice/src/main/java/com/mycompany/myservice/config/security/SecurityConfig.java', /\/actuator\/\*\*/);
                assert.noFileContent('myservice/src/main/java/com/mycompany/myservice/config/security/SecurityConfig.java', /\/swagger-ui/);
                assert.fileContent('myservice/src/main/java/com/mycompany/myservice/config/security/OpenApiSecurityConfig.java', /@Profile\(PROFILE_NOT_PROD\)/);
                assert.fileContent('myservice/src/main/java/com/mycompany/myservice/config/security/OpenApiSecurityConfig.java', /securityMatcher\("\/v3\/api-docs\/\*\*", "\/swagger-ui\/\*\*", "\/swagger-ui\.html"\)/);
                assert.noFileContent('myservice/src/main/java/com/mycompany/myservice/config/security/SecurityConfig.java', /admin123/);
                // JWT secret must be project-specific, not the shared default
                assert.noFileContent('myservice/src/main/resources/application.yml', /c2VjcmV0LWtleS1mb3Itand0/);
            },
            {} // real build (spotless) validates generated Java syntax
        );
    });

    // Observability: Loki (reachable via features checkbox)
    describe('Generate microservice with Loki logging using Maven', () => {
        testServerGenerator(
            'creates expected logging files for Loki',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "maven",
                "features": ["loki"]
            },
            [
                'myservice/src/main/java/com/mycompany/myservice/config/LokiConfig.java',
                'myservice/docker/docker-compose-loki.yml'
            ],
            () => {
                assert.fileContent('myservice/pom.xml', /loki-logback-appender/);
                assert.fileContent('myservice/src/main/resources/application.yml', /application\.loki\.url/);
            }
        );
    });

    // Security: Keycloak based generation
    describe('Generate microservice with Keycloak authentication using Maven', () => {
        testServerGenerator(
            'creates expected security files for Keycloak authentication',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "maven",
                "authenticationType": "keycloak",
                "features": []
            },
            [
                'myservice/src/main/java/com/mycompany/myservice/config/security/SecurityConfig.java',
                'myservice/src/main/java/com/mycompany/myservice/config/security/OpenApiSecurityConfig.java',
                'myservice/docker/docker-compose-keycloak.yml',
                'myservice/docker/keycloak/realm-export.json'
            ],
            () => {
                assert.fileContent('myservice/pom.xml', /spring-boot-starter-oauth2-resource-server/);
                assert.fileContent('myservice/src/main/resources/application.yml', /oauth2\.resourceserver\.jwt\.issuer-uri/);
                assert.fileContent('myservice/src/main/resources/application.yml', /management\.endpoints\.web\.exposure\.include: health,info,metrics,prometheus,aggmetrics/);
                assert.fileContent('myservice/src/main/resources/application.yml', /management\.endpoint\.health\.show-details: when_authorized/);
                assert.fileContent('myservice/src/main/java/com/mycompany/myservice/config/security/SecurityConfig.java', /"\/actuator\/health"/);
                assert.fileContent('myservice/src/main/java/com/mycompany/myservice/config/security/SecurityConfig.java', /"\/actuator\/info"/);
                assert.noFileContent('myservice/src/main/java/com/mycompany/myservice/config/security/SecurityConfig.java', /\/actuator\/\*\*/);
                assert.noFileContent('myservice/src/main/java/com/mycompany/myservice/config/security/SecurityConfig.java', /\/swagger-ui/);
                assert.fileContent('myservice/src/main/java/com/mycompany/myservice/config/security/OpenApiSecurityConfig.java', /@Profile\(PROFILE_NOT_PROD\)/);
                assert.fileContent('myservice/src/main/java/com/mycompany/myservice/config/security/OpenApiSecurityConfig.java', /securityMatcher\("\/v3\/api-docs\/\*\*", "\/swagger-ui\/\*\*", "\/swagger-ui\.html"\)/);
                assert.noFileContent('myservice/docker/docker-compose-keycloak.yml', /KEYCLOAK_ADMIN_PASSWORD=admin/);
                assert.noFileContent('myservice/docker/keycloak/realm-export.json', /admin123/);
                assert.fileContent('myservice/docker/docker-compose-keycloak.yml', /--import-realm/);
            },
            {} // real build (spotless) validates generated Java syntax
        );
    });

    // Data layer: RabbitMQ
    describe('Generate microservice with RabbitMQ messaging using Maven', () => {
        testServerGenerator(
            'creates expected messaging files for RabbitMQ',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "maven",
                "messagingType": "rabbitmq",
                "features": []
            },
            [
                'myservice/src/main/java/com/mycompany/myservice/config/RabbitMQConfig.java',
                'myservice/docker/docker-compose-rabbitmq.yml'
            ],
            () => {
                assert.fileContent('myservice/pom.xml', /spring-boot-starter-amqp/);
                assert.fileContent('myservice/src/main/resources/application.yml', /spring\.rabbitmq\.host/);
                assert.noFileContent('myservice/src/main/resources/application.yml', /spring\.rabbitmq\.password: guest/);
            }
        );
    });

    // Java version option
    describe('Generate microservice with Java 21 using Maven', () => {
        testServerGenerator(
            'creates expected files for Java 21',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "maven",
                "javaVersion": "21",
                "features": []
            },
            ['myservice/pom.xml'],
            () => {
                assert.fileContent('myservice/pom.xml', /<java.version>21<\/java.version>/);
                assert.fileContent('myservice/Dockerfile', /eclipse-temurin:21-jre-jammy/);
            }
        );
    });

    describe('Generate microservice with Java 25 using Maven', () => {
        testServerGenerator(
            'creates expected files for Java 25',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "maven",
                "springBootVersion": "4.1.0",
                "javaVersion": "25",
                "features": []
            },
            ['myservice/pom.xml'],
            () => {
                assert.fileContent('myservice/pom.xml', /<java.version>25<\/java.version>/);
                assert.fileContent('myservice/Dockerfile', /eclipse-temurin:25-jre-jammy/);
            }
        );
    });

    describe('Generate microservice with Java 25 using Maven and default Spring Boot', () => {
        testServerGenerator(
            'promotes Spring Boot to 4.1.0 when Java 25 is selected',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "maven",
                "javaVersion": "25",
                "features": []
            },
            ['myservice/pom.xml'],
            () => {
                assert.fileContent('myservice/pom.xml', /<version>4\.1\.0<\/version>/);
                assert.fileContent('myservice/pom.xml', /<maven\.compiler\.release>25<\/maven\.compiler\.release>/);
            }
        );
    });

    // OpenTelemetry feature
    describe('Generate microservice with OpenTelemetry using Maven', () => {
        testServerGenerator(
            'creates expected tracing files for OpenTelemetry',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "maven",
                "features": ["otel"]
            },
            [
                'myservice/docker/docker-compose-otel.yml',
                'myservice/docker/otel/otelcol-config.yml'
            ],
            () => {
                assert.fileContent('myservice/pom.xml', /micrometer-tracing-bridge-otel/);
                assert.fileContent('myservice/src/main/resources/application.yml', /management\.otlp\.tracing\.endpoint/);
            }
        );
    });

    // Data layer: Redis
    describe('Generate microservice with Redis cache using Maven', () => {
        testServerGenerator(
            'creates expected cache files for Redis',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "maven",
                "cacheType": "redis",
                "features": []
            },
            [
                'myservice/src/main/java/com/mycompany/myservice/config/CacheConfig.java',
                'myservice/docker/docker-compose-redis.yml'
            ],
            () => {
                assert.fileContent('myservice/pom.xml', /spring-boot-starter-data-redis/);
                assert.fileContent('myservice/src/main/resources/application.yml', /spring\.data\.redis\.host/);
            }
        );
    });

    // Data layer: Kafka
    describe('Generate microservice with Kafka messaging using Maven', () => {
        testServerGenerator(
            'creates expected messaging files for Kafka',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "maven",
                "messagingType": "kafka",
                "features": []
            },
            [
                'myservice/src/main/java/com/mycompany/myservice/config/KafkaConfig.java',
                'myservice/docker/docker-compose-kafka.yml'
            ],
            () => {
                assert.fileContent('myservice/pom.xml', /spring-kafka/);
                assert.fileContent('myservice/src/main/resources/application.yml', /spring\.kafka\.bootstrap-servers/);
            }
        );
    });

    // Data layer: MongoDB
    describe('Generate microservice with MongoDB using Maven', () => {
        testServerGenerator(
            'creates expected files for MongoDB',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "mongodb",
                "buildTool": "maven",
                "features": []
            },
            [
                'myservice/pom.xml',
                'myservice/docker/docker-compose.yml'
            ],
            () => {
                // MongoDB mode: no JPA DatabaseConfig, no SQL migrations, mongodb deps present
                assert.noFile('myservice/src/main/java/com/mycompany/myservice/config/DatabaseConfig.java');
                assert.fileContent('myservice/pom.xml', /spring-boot-starter-data-mongodb/);
                assert.fileContent('myservice/pom.xml', /org\.testcontainers/);
                assert.fileContent('myservice/src/main/resources/application.yml', /spring\.data\.mongodb\.uri/);
            }
        );
    });

    describe('Generate basic microservice using Gradle with Flyway', () => {
        testServerGenerator(
            'creates expected default files for basic microservice with Gradle',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "gradle",
                "features": []
            },
            ['myservice/build.gradle']
        );
    });

    describe('Generate basic microservice using Gradle with Liquibase', () => {
        testServerGenerator(
            'creates expected default files for basic microservice with maven',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "liquibase",
                "buildTool": "gradle",
                "features": []
            },
            ['myservice/build.gradle']
        );
    });

    describe('Generate complete microservice using Gradle', () => {
        testServerGenerator(
            'creates expected default files for complete microservice with Gradle',
            {
                "appName": "myservice",
                "packageName": "com.mycompany.myservice",
                "packageFolder": "com/mycompany/myservice",
                "databaseType": "postgresql",
                "dbMigrationTool": "flywaydb",
                "buildTool": "gradle",
                "features": ["elk", "monitoring"]
            },
            [
                'myservice/build.gradle',
                'myservice/docker/docker-compose.yml',
                'myservice/docker/docker-compose-elk.yml',
                'myservice/docker/docker-compose-monitoring.yml'
            ]
        );
    });

    describe('Generate secure API preset', () => {
        testServerGenerator(
            'creates a secure API from the preset with minimal prompts',
            {
                "appName": "secureapi",
                "packageName": "com.mycompany.secureapi",
                "projectPreset": "secure-api",
                "packageFolder": "com/mycompany/secureapi"
            },
            [
                'secureapi/pom.xml',
                'secureapi/Dockerfile',
                'secureapi/src/main/java/com/mycompany/secureapi/config/security/SecurityConfig.java',
                'secureapi/src/main/java/com/mycompany/secureapi/web/controller/AuthController.java',
                'secureapi/src/main/java/com/mycompany/secureapi/model/request/LoginRequest.java',
                'secureapi/src/main/java/com/mycompany/secureapi/model/response/LoginResponse.java'
            ],
            () => {
                assert.fileContent('secureapi/Dockerfile', /eclipse-temurin:25-jre-jammy/);
                assert.fileContent('secureapi/pom.xml', /<version>4\.1\.0<\/version>/);
                assert.fileContent('secureapi/pom.xml', /spring-boot-starter-security/);
                assert.fileContent('secureapi/src/main/resources/application.yml', /application\.jwt\.secret/);
                assert.noFile('secureapi/src/main/java/com/mycompany/secureapi/config/CacheConfig.java');
                assert.noFile('secureapi/src/main/java/com/mycompany/secureapi/config/KafkaConfig.java');
            }
        );
    });

    describe('Generate minimal preset', () => {
        testServerGenerator(
            'creates the minimal API from the preset',
            {
                "appName": "minimalapi",
                "packageName": "com.mycompany.minimalapi",
                "projectPreset": "minimal",
                "packageFolder": "com/mycompany/minimalapi"
            },
            [
                'minimalapi/pom.xml',
                'minimalapi/Dockerfile',
                'minimalapi/src/main/resources/application.yml'
            ],
            () => {
                assert.fileContent('minimalapi/pom.xml', /<java.version>17<\/java.version>/);
                assert.noFile('minimalapi/src/main/java/com/mycompany/minimalapi/config/CacheConfig.java');
                assert.noFile('minimalapi/src/main/java/com/mycompany/minimalapi/config/KafkaConfig.java');
                assert.noFile('minimalapi/src/main/java/com/mycompany/minimalapi/config/LokiConfig.java');
                assert.noFile('minimalapi/src/main/java/com/mycompany/minimalapi/config/security/SecurityConfig.java');
                assert.noFile('minimalapi/src/main/java/com/mycompany/minimalapi/config/MetricConfig.java');
                assert.noFile('minimalapi/src/main/java/com/mycompany/minimalapi/util/AggravateMetricsEndpoint.java');
                assert.noFile('minimalapi/docker/docker-compose-elk.yml');
                assert.noFile('minimalapi/docker/docker-compose-monitoring.yml');
                assert.noFile('minimalapi/docker/docker-compose-otel.yml');
            }
        );
    });

    describe('Generate event-driven preset', () => {
        testServerGenerator(
            'creates Kafka and Redis from the preset',
            {
                "appName": "eventservice",
                "packageName": "com.mycompany.eventservice",
                "projectPreset": "event-driven",
                "packageFolder": "com/mycompany/eventservice"
            },
            [
                'eventservice/pom.xml',
                'eventservice/src/main/java/com/mycompany/eventservice/config/CacheConfig.java',
                'eventservice/src/main/java/com/mycompany/eventservice/config/KafkaConfig.java',
                'eventservice/docker/docker-compose-redis.yml',
                'eventservice/docker/docker-compose-kafka.yml'
            ],
            () => {
                assert.fileContent('eventservice/Dockerfile', /eclipse-temurin:25-jre-jammy/);
                assert.fileContent('eventservice/pom.xml', /<version>4\.1\.0<\/version>/);
                assert.fileContent('eventservice/pom.xml', /<java.version>25<\/java.version>/);
                assert.fileContent('eventservice/pom.xml', /spring-boot-starter-data-redis/);
                assert.fileContent('eventservice/pom.xml', /spring-kafka/);
                assert.fileContent('eventservice/src/main/resources/application.yml', /spring\.data\.redis\.host/);
                assert.fileContent('eventservice/src/main/resources/application.yml', /spring\.kafka\.bootstrap-servers/);
                assert.noFile('eventservice/src/main/java/com/mycompany/eventservice/config/security/SecurityConfig.java');
                assert.noFile('eventservice/src/main/java/com/mycompany/eventservice/config/LokiConfig.java');
            }
        );
    });

    describe('Generate observability-heavy preset', () => {
        testServerGenerator(
            'creates the observability stack from the preset',
            {
                "appName": "obsservice",
                "packageName": "com.mycompany.obsservice",
                "projectPreset": "observability-heavy",
                "packageFolder": "com/mycompany/obsservice"
            },
            [
                'obsservice/pom.xml',
                'obsservice/src/main/java/com/mycompany/obsservice/config/LokiConfig.java',
                'obsservice/src/main/java/com/mycompany/obsservice/config/MetricConfig.java',
                'obsservice/src/main/java/com/mycompany/obsservice/util/AggravateMetricsEndpoint.java',
                'obsservice/docker/docker-compose-elk.yml',
                'obsservice/docker/docker-compose-monitoring.yml',
                'obsservice/docker/docker-compose-otel.yml',
                'obsservice/docker/docker-compose-loki.yml'
            ],
            () => {
                assert.fileContent('obsservice/Dockerfile', /eclipse-temurin:25-jre-jammy/);
                assert.fileContent('obsservice/pom.xml', /<version>4\.1\.0<\/version>/);
                assert.fileContent('obsservice/pom.xml', /<java.version>25<\/java.version>/);
                assert.fileContent('obsservice/pom.xml', /loki-logback-appender/);
                assert.fileContent('obsservice/pom.xml', /micrometer-tracing-bridge-otel/);
                assert.fileContent('obsservice/src/main/resources/application.yml', /application\.loki\.url/);
                assert.fileContent('obsservice/src/main/resources/application.yml', /management\.otlp\.tracing\.endpoint/);
                assert.fileContent('obsservice/src/main/resources/application.yml', /management\.tracing\.sampling\.probability/);
                assert.noFileContent('obsservice/docker/docker-compose-monitoring.yml', /GF_SECURITY_ADMIN_PASSWORD=admin/);
            }
        );
    });

    describe('Reuse saved defaults on rerun', () => {
        testServerGenerator(
            'reuses saved answers when prompts are omitted',
            {},
            [
                'savedservice/pom.xml',
                'savedservice/src/main/java/com/mycompany/savedservice/config/LokiConfig.java',
                'savedservice/src/main/java/com/mycompany/savedservice/config/CacheConfig.java',
                'savedservice/src/main/java/com/mycompany/savedservice/config/KafkaConfig.java',
                'savedservice/src/main/java/com/mycompany/savedservice/config/security/SecurityConfig.java',
                'savedservice/src/main/java/com/mycompany/savedservice/web/controller/AuthController.java'
            ],
            () => {
                assert.fileContent('savedservice/Dockerfile', /eclipse-temurin:21-jre-jammy/);
                assert.fileContent('savedservice/pom.xml', /spring-boot-starter-security/);
                assert.fileContent('savedservice/pom.xml', /spring-boot-starter-data-redis/);
                assert.fileContent('savedservice/pom.xml', /spring-kafka/);
                assert.fileContent('savedservice/pom.xml', /loki-logback-appender/);
                assert.fileContent('savedservice/src/main/resources/application.yml', /application\.jwt\.secret/);
                assert.fileContent('savedservice/src/main/resources/application.yml', /spring\.data\.redis\.host/);
                assert.fileContent('savedservice/src/main/resources/application.yml', /spring\.kafka\.bootstrap-servers/);
                assert.fileContent('savedservice/src/main/resources/application.yml', /application\.loki\.url/);
            },
            { formatCode: false },
            run => run.inTmpDir(dir => {
                fse.writeJsonSync(path.join(dir, '.yo-rc.json'), {
                    'generator-springboot': {
                        appName: 'savedservice',
                        packageName: 'com.mycompany.savedservice',
                        packageFolder: 'com/mycompany/savedservice',
                        databaseType: 'postgresql',
                        dbMigrationTool: 'flywaydb',
                        features: ['loki'],
                        messagingType: 'kafka',
                        cacheType: 'redis',
                        authenticationType: 'jwt',
                        javaVersion: '21',
                        buildTool: 'maven'
                    }
                });
            })
        );
    });
});
