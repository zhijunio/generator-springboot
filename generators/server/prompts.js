export default {
    prompting
};

async function prompting() {
    // Reuse previously saved answers (.yo-rc.json) as defaults for a smooth re-run
    const saved = this.config.getAll() || {};
    const prompts = [
        {
            type: 'string',
            name: 'appName',
            validate: input =>
                /^([a-z_][a-z0-9_\-]*)$/.test(input)
                    ? true
                    : 'The application name you have provided is not valid',
            message: 'What is the application name?',
            default: saved.appName || 'myservice'
        },
        {
            type: 'string',
            name: 'packageName',
            validate: input =>
                /^([a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)*)$/.test(input)
                    ? true
                    : 'The package name you have provided is not a valid Java package name.',
            message: 'What is the default package name?',
            default: saved.packageName || 'com.mycompany.myservice'
        },
        {
            type: 'list',
            name: 'databaseType',
            message: 'Which type of database you want to use?',
            choices: [
                {
                    value: 'postgresql',
                    name: 'Postgresql'
                },
                {
                    value: 'mysql',
                    name: 'MySQL'
                },
                {
                    value: 'mariadb',
                    name: 'MariaDB'
                },
                {
                    value: 'mongodb',
                    name: 'MongoDB'
                }
            ],
            default: saved.databaseType || 'postgresql'
        },
        {
            type: 'list',
            name: 'dbMigrationTool',
            message: 'Which type of database migration tool you want to use?',
            choices: [
                {
                    value: 'flywaydb',
                    name: 'FlywayDB'
                },
                {
                    value: 'liquibase',
                    name: 'Liquibase'
                },
                {
                    value: 'none',
                    name: 'None'
                }
            ],
            default: saved.dbMigrationTool || 'flywaydb'
        },
        {
            when: (answers) => answers.dbMigrationTool === 'liquibase',
            type: 'list',
            name: 'dbMigrationFormat',
            message: 'Which format do you want to use for database migrations?',
            choices: [
                {
                    value: 'xml',
                    name: 'XML (like \'001-init.xml\')'
                },
                {
                    value: 'yaml',
                    name: 'YAML (like \'001-init.yaml\')'
                },
                {
                    value: 'sql',
                    name: 'SQL (like \'001-init.sql\')'
                }
            ],
            default: saved.dbMigrationFormat || 'xml'
        },
        {
            type: 'checkbox',
            name: 'features',
            message: 'Select the features you want?',
            choices: [
                {
                    value: 'elk',
                    name: 'ELK Docker configuration'
                },
                {
                    value: 'loki',
                    name: 'Loki Docker configuration'
                },
                {
                    value: 'monitoring',
                    name: 'Prometheus, Grafana Docker configuration'
                },
                {
                    value: 'otel',
                    name: 'OpenTelemetry tracing'
                }
            ]
        },
        {
            type: 'list',
            name: 'messagingType',
            message: 'Which messaging solution do you want to use?',
            choices: [
                {
                    value: 'none',
                    name: 'None'
                },
                {
                    value: 'kafka',
                    name: 'Apache Kafka'
                },
                {
                    value: 'rabbitmq',
                    name: 'RabbitMQ'
                }
            ],
            default: 'none'
        },
        {
            type: 'list',
            name: 'cacheType',
            message: 'Which caching solution do you want to use?',
            choices: [
                {
                    value: 'none',
                    name: 'None'
                },
                {
                    value: 'redis',
                    name: 'Redis'
                }
            ],
            default: 'none'
        },
        {
            type: 'list',
            name: 'javaVersion',
            message: 'Which Java version do you want to use?',
            choices: [
                {
                    value: '17',
                    name: 'Java 17'
                },
                {
                    value: '21',
                    name: 'Java 21 (LTS, virtual threads)'
                }
            ],
            default: saved.javaVersion || '17'
        },
        {
            type: 'list',
            name: 'authenticationType',
            message: 'Which authentication mechanism do you want to use?',
            choices: [
                {
                    value: 'none',
                    name: 'None'
                },
                {
                    value: 'jwt',
                    name: 'JWT (Spring Security + jjwt)'
                },
                {
                    value: 'keycloak',
                    name: 'Keycloak (OAuth2 Resource Server)'
                }
            ],
            default: 'none'
        },
        {
            type: 'list',
            name: 'buildTool',
            message: 'Which build tool do you want to use?',
            choices: [
                {
                    value: 'maven',
                    name: 'Maven'
                },
                {
                    value: 'gradle',
                    name: 'Gradle'
                }
            ],
            default: saved.buildTool || 'maven'
        }
    ];

    const answers = await this.prompt(prompts);
    Object.assign(this.configOptions, answers);
    this.configOptions.packageFolder = this.configOptions.packageName.replace(/\./g, '/');
    this.configOptions.features = this.configOptions.features || [];
}
