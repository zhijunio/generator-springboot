import path from 'path';
import assert from 'yeoman-assert';
import { YeomanTest } from 'yeoman-test';
import fse from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const helpers = new YeomanTest();

describe('SpringBoot Generator', () => {

    describe('Generate CRUD API with Flyway', () => {
        before(async function() {
            this.timeout(30000);
            await helpers.run(path.join(__dirname, '../generators/controller/index.js'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/basic-microservice-flyway'), dir);
                })
                .withArguments(['Customer'])
                .withOptions({ 'base-path': '/api/customers', 'formatCode': false });
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
        });
    });

    describe('Generate CRUD API with Liquibase', () => {
        before(async function() {
            this.timeout(30000);
            await helpers.run(path.join(__dirname, '../generators/controller/index.js'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/basic-microservice-liquibase'), dir);
                })
                .withArguments(['Customer'])
                .withOptions({ 'base-path': '/api/customers', 'formatCode': false });
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
        });
    });
});
