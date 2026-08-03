import path from 'path';
import assert from 'yeoman-assert';
import { YeomanTest } from 'yeoman-test';
import { fileURLToPath } from 'url';
import constants from '../generators/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('SpringBoot Generator', () => {
    // Helper function to test server generator with different configurations
    const testServerGenerator = async (testName, prompts, expectedFiles, additionalChecks, options = { formatCode: false }) => {
        it(testName, async () => {
            const helpers = new YeomanTest();
            await helpers
                .create(path.join(__dirname, '../generators/server'))
                .withPrompts(prompts)
                .withOptions(options)
                .run();

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
            },
            {} // real build (spotless) validates generated Java syntax
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
                'myservice/docker/docker-compose-keycloak.yml'
            ],
            () => {
                assert.fileContent('myservice/pom.xml', /spring-boot-starter-oauth2-resource-server/);
                assert.fileContent('myservice/src/main/resources/application.yml', /oauth2\.resourceserver\.jwt\.issuer-uri/);
            },
            {} // real build (spotless) validates generated Java syntax
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
});
