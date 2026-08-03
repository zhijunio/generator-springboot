import path from 'path';
import assert from 'yeoman-assert';
import { fileURLToPath } from 'url';
import { strict as nodeAssert } from 'assert';
import { runControllerGenerator } from './helpers/yeoman-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
describe('SpringBoot Generator', () => {
    const controllerGeneratorPath = path.join(__dirname, '../generators/controller/index.js');
    const flywayTemplateDir = path.join(__dirname, '../test/templates/basic-microservice-flyway');
    const liquibaseTemplateDir = path.join(__dirname, '../test/templates/basic-microservice-liquibase');

    describe('Generate CRUD API with Flyway', () => {
        before(async function() {
            this.timeout(30000);
            await runControllerGenerator({
                generatorPath: controllerGeneratorPath,
                templateDir: flywayTemplateDir,
                formatCode: true
            });
        });

        it('creates expected default files for CRUD API with Flyway', () => {
            assert.file('src/main/java/com/mycompany/myservice/entity/Customer.java');
            assert.file('src/main/java/com/mycompany/myservice/repository/CustomerRepository.java');
            assert.file('src/main/java/com/mycompany/myservice/service/CustomerService.java');
            assert.file('src/main/java/com/mycompany/myservice/web/controller/CustomerController.java');
            assert.file('src/main/resources/db/migration/postgresql/V2__create_customer_table.sql');

            // Content assertions: entity class name and migration DDL use the entity/table name
            assert.fileContent('src/main/java/com/mycompany/myservice/entity/Customer.java', /public class Customer/);
            assert.fileContent('src/main/resources/db/migration/postgresql/V2__create_customer_table.sql', /create table IF NOT EXISTS  customer/);
            assert.fileContent('src/main/java/com/mycompany/myservice/web/controller/CustomerController.java', /@RequestParam\(defaultValue = "0"\) int page/);
            assert.fileContent('src/main/java/com/mycompany/myservice/web/controller/CustomerController.java', /@RequestParam\(defaultValue = "10"\) int size/);
            assert.fileContent('src/main/java/com/mycompany/myservice/web/controller/CustomerController.java', /PageRequest\.of\(page, size\)/);
        });
    });

    describe('Generate CRUD API with Liquibase', () => {
        before(async function() {
            this.timeout(30000);
            await runControllerGenerator({
                generatorPath: controllerGeneratorPath,
                templateDir: liquibaseTemplateDir,
                formatCode: false
            });
        });

        it('creates expected default files for CRUD API with Liquibase', () => {
            assert.file('src/main/java/com/mycompany/myservice/entity/Customer.java');
            assert.file('src/main/java/com/mycompany/myservice/repository/CustomerRepository.java');
            assert.file('src/main/java/com/mycompany/myservice/service/CustomerService.java');
            assert.file('src/main/java/com/mycompany/myservice/web/controller/CustomerController.java');
            assert.file('src/main/resources/db/changelog/migration/02-create_customer_table.xml');

            // Content assertions: entity class name and liquibase changelog reference the table
            assert.fileContent('src/main/java/com/mycompany/myservice/entity/Customer.java', /public class Customer/);
            assert.fileContent('src/main/resources/db/changelog/migration/02-create_customer_table.xml', /customer/);
            // Enhanced controller: OpenAPI annotations and search param
            assert.fileContent('src/main/java/com/mycompany/myservice/web/controller/CustomerController.java', /@Operation/);
            assert.fileContent('src/main/java/com/mycompany/myservice/web/controller/CustomerController.java', /String search/);
            assert.fileContent('src/main/java/com/mycompany/myservice/web/controller/CustomerController.java', /@Tag\(name = "Customer", description = "CRUD operations for Customer"\)/);
        });
    });

    describe('Generate CRUD API with Flyway on MySQL', () => {
        before(async function() {
            this.timeout(30000);
            await runControllerGenerator({
                generatorPath: controllerGeneratorPath,
                templateDir: flywayTemplateDir,
                formatCode: false,
                configOverride: {
                    databaseType: 'mysql'
                }
            });
        });

        it('uses the no-sequence Flyway migration and keeps controller search support', () => {
            assert.file('src/main/resources/db/migration/mysql/V2__create_customer_table.sql');
            assert.fileContent('src/main/resources/db/migration/mysql/V2__create_customer_table.sql', /auto_increment/);
            assert.noFileContent('src/main/resources/db/migration/mysql/V2__create_customer_table.sql', /sequence/i);
            assert.fileContent('src/main/java/com/mycompany/myservice/web/controller/CustomerController.java', /String search/);
        });
    });

    describe('Generate CRUD API with Flyway on MariaDB', () => {
        before(async function() {
            this.timeout(30000);
            await runControllerGenerator({
                generatorPath: controllerGeneratorPath,
                templateDir: flywayTemplateDir,
                formatCode: false,
                configOverride: {
                    databaseType: 'mariadb'
                }
            });
        });

        it('uses the MariaDB-specific Flyway migration syntax', () => {
            assert.file('src/main/resources/db/migration/mariadb/V2__create_customer_table.sql');
            assert.fileContent('src/main/resources/db/migration/mariadb/V2__create_customer_table.sql', /DEFAULT nextval\(`customer_seq`\)/);
            assert.fileContent('src/main/resources/db/migration/mariadb/V2__create_customer_table.sql', /text varchar\(1024\) not null/);
        });
    });

    describe('Generate CRUD API with a custom base path', () => {
        before(async function() {
            this.timeout(30000);
            await runControllerGenerator({
                generatorPath: controllerGeneratorPath,
                templateDir: flywayTemplateDir,
                formatCode: false,
                basePath: '/api/v1/customers'
            });
        });

        it('propagates the custom base path through controller templates', () => {
            assert.fileContent(
                'src/main/java/com/mycompany/myservice/web/controller/CustomerController.java',
                /@RequestMapping\("\/api\/v1\/customers"\)/
            );
            assert.fileContent(
                'src/main/java/com/mycompany/myservice/web/controller/CustomerController.java',
                /path\("\/api\/v1\/customers\/\{id\}"\)/
            );
            assert.fileContent(
                'src/test/java/com/mycompany/myservice/web/controller/CustomerControllerTest.java',
                /perform\(get\("\/api\/v1\/customers"\)\)/
            );
            assert.fileContent(
                'src/test/java/com/mycompany/myservice/web/controller/CustomerControllerIT.java',
                /perform\(get\("\/api\/v1\/customers"\)\)/
            );
        });
    });

    describe('Generate CRUD API with MyBatis persistence', () => {
        before(async function() {
            this.timeout(30000);
            await runControllerGenerator({
                generatorPath: controllerGeneratorPath,
                templateDir: liquibaseTemplateDir,
                formatCode: false,
                configOverride: {
                    persistence: 'mybatis'
                }
            });
        });

        it('switches controller tests to the MyBatis branch', () => {
            assert.fileContent(
                'src/test/java/com/mycompany/myservice/service/CustomerServiceTest.java',
                /ReflectionTestUtils\.setField\(customerService, "baseMapper", customerRepository\)/
            );
            assert.fileContent(
                'src/test/java/com/mycompany/myservice/web/controller/CustomerControllerIT.java',
                /Wrappers\.query\(\)/
            );
            assert.fileContent(
                'src/main/java/com/mycompany/myservice/web/controller/CustomerController.java',
                /String search/
            );
        });
    });

    describe('Reject CRUD API generation for MongoDB', () => {
        it('fails fast with a relational-database-only error', async () => {
            await nodeAssert.rejects(
                () =>
                    runControllerGenerator({
                        generatorPath: controllerGeneratorPath,
                        templateDir: flywayTemplateDir,
                        formatCode: false,
                        configOverride: {
                            databaseType: 'mongodb'
                        }
                    }),
                /MongoDB projects are not supported/
            );
        });
    });
});
