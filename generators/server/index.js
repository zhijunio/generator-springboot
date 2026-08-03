
import BaseGenerator from '../base-generator.js';
import constants from '../constants.js';
import prompts from './prompts.js';
import path from 'path';
import _ from 'lodash';

export default class extends BaseGenerator {

    constructor(args, opts) {
        super(args, opts);
        this.configOptions = this.options.configOptions || {};
    }

    initializing() {
        this.logSuccess('🚀 Welcome to SpringBoot Application Generator 🚀');
    }

    get prompting() {
        return prompts.prompting;
    }

    configuring() {
        this.destinationRoot(path.join(this.destinationRoot(), '/'+this.configOptions.appName));
        this.config.set(this.configOptions);
        Object.assign(this.configOptions, constants);
        this.configOptions.formatCode = this.options.formatCode !== false;
        this.configOptions.appVarName = _.replace(_.startCase(this.configOptions.appName)," ","");
        this.configOptions.persistence = this.configOptions.persistence || 'jpa';
        this.configOptions.loggingType = this.configOptions.loggingType || 'none';
        this.configOptions.dbMigrationFormat = this.configOptions.dbMigrationFormat || 'xml';
    }

    writing() {
        this._generateBuildToolConfig(this.configOptions);
        this._generateDockerConfig(this.configOptions);
        this._generateJenkinsFile(this.configOptions);
        this._generateMiscFiles(this.configOptions);
        this._generateGithubActionsFiles(this.configOptions);
        this._generateDbMigrationConfig(this.configOptions);
        this._generateDockerComposeFiles(this.configOptions);
        this._generateAppCode(this.configOptions);
    }

    end() {
        if(this.configOptions.formatCode !== false) {
            this._formatCode(this.configOptions, this.configOptions.appName);
        }
        this._printGenerationSummary(this.configOptions);
    }

    _printGenerationSummary(configOptions) {
        this.log('==========================================');
        this.logSuccess("Your application is generated successfully");
        this.logSuccess(`  cd ${configOptions.appName}`);
        if (configOptions.buildTool === 'maven') {
            this.logSuccess("  > ./mvnw spring-boot:run");
        } else {
            this.logSuccess("  > ./gradlew bootRun");
        }
        this.log('==========================================');
    }

    _generateBuildToolConfig(configOptions) {
        if (configOptions.buildTool === 'maven') {
            this._generateMavenConfig(configOptions);
        } else {
            this._generateGradleConfig(configOptions);
        }
    }

    _generateDockerConfig(configOptions) {
        this.fs.copyTpl(
            this.templatePath('app/Dockerfile'),
            this.destinationPath('Dockerfile'),
            configOptions
        );
    }

    _generateJenkinsFile(configOptions) {
        this.fs.copyTpl(
            this.templatePath('app/Jenkinsfile'),
            this.destinationPath('Jenkinsfile'),
            configOptions
        );
    }

    _generateMiscFiles(configOptions) {
        this.fs.copyTpl(this.templatePath('app/README.md'), this.destinationPath('README.md'), configOptions);
    }

    _generateGithubActionsFiles(configOptions) {
        const ciFile = '.github/workflows/' + configOptions.buildTool + '.yml';

        this.fs.copyTpl(
            this.templatePath('app/' + ciFile),
            this.destinationPath(ciFile),
            configOptions
        );
    }

    _generateMavenConfig(configOptions) {
        this._copyMavenWrapper(configOptions);
        this._generateMavenPOMXml(configOptions);
        this.fs.copyTpl(this.templatePath('app/sonar-project.properties'), this.destinationPath('sonar-project.properties'), configOptions);
    }

    _generateGradleConfig(configOptions) {
        this._copyGradleWrapper(configOptions);
        this._generateGradleBuildScript(configOptions);
        this.fs.copyTpl(this.templatePath('app/sonar-project.properties'), this.destinationPath('sonar-project.properties'), configOptions);
    }

    _copyMavenWrapper(configOptions) {
        const commonMavenConfigDir = '../../common/files/maven/';

        ['mvnw', 'mvnw.cmd'].forEach(tmpl => {
            this.fs.copyTpl(
                this.templatePath(commonMavenConfigDir + tmpl),
                this.destinationPath(tmpl)
            );
        });

        this.fs.copyTpl(
            this.templatePath(commonMavenConfigDir + 'gitignore'),
            this.destinationPath('.gitignore')
        );

        this.fs.copy(
            this.templatePath(commonMavenConfigDir + '.mvn'),
            this.destinationPath('.mvn')
        );

    }

    _generateMavenPOMXml(configOptions) {
        const mavenConfigDir = 'maven/';
        this.fs.copyTpl(
            this.templatePath(mavenConfigDir + 'pom.xml'),
            this.destinationPath('pom.xml'),
            configOptions
        );
    }

    _copyGradleWrapper(configOptions) {
        const commonGradleConfigDir = '../../common/files/gradle/';

        ['gradlew', 'gradlew.bat'].forEach(tmpl => {
            this.fs.copyTpl(
                this.templatePath(commonGradleConfigDir + tmpl),
                this.destinationPath(tmpl)
            );
        });

        this.fs.copyTpl(
            this.templatePath(commonGradleConfigDir + 'gitignore'),
            this.destinationPath('.gitignore')
        );

        this.fs.copy(
            this.templatePath(commonGradleConfigDir + 'gradle'),
            this.destinationPath('gradle')
        );
    }

    _generateGradleBuildScript(configOptions) {
        const gradleConfigDir = 'gradle/';

        ['build.gradle', 'settings.gradle', 'gradle.properties'].forEach(tmpl => {
            this.fs.copyTpl(
                this.templatePath(gradleConfigDir + tmpl),
                this.destinationPath(tmpl),
                configOptions
            );
        });
        ['code-quality.gradle'].forEach(tmpl => {
            this.fs.copyTpl(
                this.templatePath(gradleConfigDir + tmpl),
                this.destinationPath('gradle/' + tmpl),
                configOptions
            );
        });
    }

    _generateAppCode(configOptions) {

        const mainJavaTemplates = [
            {src: 'Application.java', dest: configOptions.appVarName+'Application.java'},
            'aop/LoggingAspect.java',
            'config/ApplicationProperties.java',
            'config/AppConstants.java',
            'config/AsyncConfig.java',
            'config/DatabaseConfig.java',
            'config/LoggingAspectConfig.java',
            'config/JacksonConfig.java',
            'config/SpringdocConfig.java',
            'config/Initializer.java',
            'config/GlobalExceptionHandler.java',
            'config/WebConfigurer.java',
            'exception/ResourceNotFoundException.java',
            'util/PageUtils.java',
        ];

        if(configOptions.loggingType === "loki") {
            mainJavaTemplates.push('config/LokiConfig.java');
        }

        if(configOptions.features.includes("monitoring")) {
            mainJavaTemplates.push('config/MetricConfig.java');
            mainJavaTemplates.push('util/AggravateMetricsEndpoint.java');
        }

        if(configOptions.authenticationType === 'jwt') {
            mainJavaTemplates.push({src: 'config/security/jwt/SecurityConfig.java', dest: 'config/security/SecurityConfig.java'});
            mainJavaTemplates.push('config/security/JwtService.java');
            mainJavaTemplates.push('config/security/JwtAuthenticationFilter.java');
            mainJavaTemplates.push('web/controller/AuthController.java');
            mainJavaTemplates.push('model/request/LoginRequest.java');
            mainJavaTemplates.push('model/response/LoginResponse.java');
        }
        if(configOptions.authenticationType === 'keycloak') {
            mainJavaTemplates.push({src: 'config/security/keycloak/SecurityConfig.java', dest: 'config/security/SecurityConfig.java'});
        }

        this.generateMainJavaCode(configOptions, mainJavaTemplates);

        const mainResTemplates = [
            'application.yml',
            'logback-spring.xml'
        ];
        this.generateMainResCode(configOptions, mainResTemplates);

        const testJavaTemplates = [
            'ApplicationIntegrationTest.java',
            'common/ContainersConfig.java',
            'common/AbstractIntegrationTest.java',
            {src: 'TestApplication.java', dest: "Test"+configOptions.appVarName+'Application.java'},

        ];
        if(configOptions.persistence === "jpa") {
            testJavaTemplates.push('SchemaValidationTest.java');
        }

        this.generateTestJavaCode(configOptions, testJavaTemplates);

        const testResTemplates = [
            'logback-test.xml'
        ];
        this.generateTestResCode(configOptions, testResTemplates);
    }

    _generateDbMigrationConfig(configOptions) {
        if(configOptions.dbMigrationTool === 'flywaydb') {
            let vendor = configOptions.databaseType;
            const resTemplates = [
                {src: 'db/migration/flyway/V1__01_init.sql', dest: 'db/migration/'+ vendor +'/V1__01_init.sql'},

            ];
            this.generateFiles(configOptions, resTemplates, 'app/','src/main/resources/');
            const flywayMigrantCounter = {
                [constants.KEY_FLYWAY_MIGRATION_COUNTER]: 1
            };
            Object.assign(configOptions, flywayMigrantCounter);
            this.config.set(flywayMigrantCounter);
        }

        if(configOptions.dbMigrationTool === 'liquibase') {
            const dbFmt = configOptions.dbMigrationFormat || 'xml';
            const resTemplates = [
                {src: 'db/migration/liquibase/changelog/db.changelog-master.yaml', dest: 'db/changelog/db.changelog-master.yaml'},
                {src: `db/migration/liquibase/changelog/01-init.${dbFmt}`, dest: `db/changelog/migration/01-init.${dbFmt}`},

            ];
            this.generateFiles(configOptions, resTemplates, 'app/','src/main/resources/');
            const liquibaseMigrantCounter = {
                [constants.KEY_LIQUIBASE_MIGRATION_COUNTER]: 1
            };
            Object.assign(configOptions, liquibaseMigrantCounter);
            this.config.set(liquibaseMigrantCounter);
        }
    }

    _generateDockerComposeFiles(configOptions) {
        this._generateAppDockerComposeFile(configOptions);
        if(configOptions.features.includes('monitoring')) {
            this._generateMonitoringConfig(configOptions);
        }
        if(configOptions.features.includes('zipkin')) {
            this._generateZipkinConfig(configOptions);
        }
        if(configOptions.features.includes('elk')) {
            this._generateELKConfig(configOptions);
        }
        if(configOptions.loggingType === 'loki') {
            this._generateLokiConfig(configOptions);
        }
        if(configOptions.authenticationType === 'keycloak') {
            this._generateKeycloakConfig(configOptions);
        }
    }

    _generateKeycloakConfig(configOptions) {
        const resTemplates = [
            'docker/docker-compose-keycloak.yml'
        ];
        this.generateFiles(configOptions, resTemplates, 'app/', './');
    }

    _generateAppDockerComposeFile(configOptions) {
        const resTemplates = [
            'docker-compose.yml',
            'docker-compose-app.yml',
            'docker-compose-sonar.yml'
        ];
        this.generateFiles(configOptions, resTemplates, 'app/', 'docker/');
    }

    _generateELKConfig(configOptions) {
        const resTemplates = [
            'docker/docker-compose-elk.yml',
            'docker/elk/logstash.conf',
            'docker/elk/elasticsearch.yml',
            'docker/elk/logstash.yml',
            'docker/elk/kibana.yml',
        ];
        this.generateFiles(configOptions, resTemplates, 'app/', './');
    }

    _generateMonitoringConfig(configOptions) {
        const resTemplates = [
            'docker/docker-compose-monitoring.yml',
            'docker/prometheus/prometheus.yml',
            'docker/grafana/provisioning/datasources/datasource.yml',
            'docker/tempo/tempo.yml',
        ];
        this.generateFiles(configOptions, resTemplates, 'app/', './');

        this.fs.copy(
            this.templatePath('app/docker/grafana/provisioning/dashboards'),
            this.destinationPath('docker/grafana/provisioning/dashboards')
        );
    }

    _generateLokiConfig(configOptions) {
        const resTemplates = [
            'docker/docker-compose-loki.yml'
        ];
        this.generateFiles(configOptions, resTemplates, 'app/', './');
    }

    _generateZipkinConfig(configOptions) {
        const resTemplates = [
            'docker/docker-compose-zipkin.yml'
        ];
        this.generateFiles(configOptions, resTemplates, 'app/', './');
    }

};
