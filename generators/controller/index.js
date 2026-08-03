import BaseGenerator from '../base-generator.js';
import constants from '../constants.js';
import _ from 'lodash';

export default class extends BaseGenerator {

    constructor(args, opts) {
        super(args, opts);
        this.configOptions = this.options.configOptions || {};
        this.argument("entityName", {
            type: String,
            required: true,
            description: "Entity name"
        });

        this.option('base-path', {
            type: String,
            desc: "Base URL path for REST Controller"
        });
    }

    get initializing() {
        this.logSuccess('Generating Entity, repository, service and controller');
        return {
            validateEntityName() {
                //this.env.error("The entity name is invalid");
            }
        };
    }

    configuring() {
        this.configOptions = Object.assign({}, this.configOptions, this.config.getAll());
        // JPA CRUD generation is only supported on relational databases
        if (this.configOptions.databaseType === 'mongodb') {
            this.env.error('The controller sub-generator requires a relational database (JPA). MongoDB projects are not supported.');
        }
        this.configOptions.basePath = this.options['base-path'];
        this.configOptions.entityName = this.options.entityName;
        this.configOptions.entityVarName = _.camelCase(this.options.entityName);
        this.configOptions.tableName = _.snakeCase(this.options.entityName);
        this.configOptions.doesNotSupportDatabaseSequences =
            this.configOptions.databaseType === 'mysql';
        this.configOptions.formatCode = this.options.formatCode !== false
    }

    writing() {
        this._generateAppCode(this.configOptions);
        this._generateDbMigrationConfig(this.configOptions)
    }

    end() {
        if(this.configOptions.formatCode !== false) {
            this._formatCode(this.configOptions, null);
        }
    }

    _generateAppCode(configOptions) {
        const mainJavaTemplates = [
            {src: 'entity/Entity.java', dest: 'entity/'+configOptions.entityName+'.java'},
            {src: 'exception/NotFoundException.java', dest: 'exception/'+configOptions.entityName+'NotFoundException.java'},
            {src: 'mapper/Mapper.java', dest: 'mapper/'+configOptions.entityName+'Mapper.java'},
            {src: 'model/query/Query.java', dest: 'model/query/'+configOptions.entityName+'Query.java'},
            {src: 'model/request/Request.java', dest: 'model/request/'+configOptions.entityName+'Request.java'},
            {src: 'model/response/Response.java', dest: 'model/response/'+configOptions.entityName+'Response.java'},
            {src: 'repository/Repository.java', dest: 'repository/'+configOptions.entityName+'Repository.java'},
            {src: 'service/Service.java', dest: 'service/'+configOptions.entityName+'Service.java'},
            {src: 'web/controller/Controller.java', dest: 'web/controller/'+configOptions.entityName+'Controller.java'},
        ];
        this.generateMainJavaCode(configOptions, mainJavaTemplates);

        const testJavaTemplates = [
            {src: 'web/controller/ControllerTest.java', dest: 'web/controller/'+configOptions.entityName+'ControllerTest.java'},
            {src: 'web/controller/ControllerIT.java', dest: 'web/controller/'+configOptions.entityName+'ControllerIT.java'},
            {src: 'service/ServiceTest.java', dest: 'service/'+configOptions.entityName+'ServiceTest.java'},
        ];
        this.generateTestJavaCode(configOptions, testJavaTemplates);
    }

    _generateDbMigrationConfig(configOptions) {

        if(configOptions.dbMigrationTool === 'flywaydb') {
            this._generateFlywayMigration(configOptions)
        }

        if(configOptions.dbMigrationTool === 'liquibase') {
            this._generateLiquibaseMigration(configOptions);
        }
    }

    _generateFlywayMigration(configOptions) {
        const counter = configOptions[constants.KEY_FLYWAY_MIGRATION_COUNTER] + 1;
        let vendor = configOptions.databaseType;
        const scriptTemplate = configOptions.doesNotSupportDatabaseSequences ?
            "V1__new_table_no_seq.sql" : "V1__new_table_with_seq.sql";

        this.fs.copyTpl(
            this.templatePath('app/src/main/resources/db/migration/flyway/'+scriptTemplate),
            this.destinationPath('src/main/resources/db/migration/'+vendor+
                '/V'+counter+'__create_'+configOptions.tableName+'_table.sql'),
            configOptions
        );
        const flywayMigrantCounter = {
            [constants.KEY_FLYWAY_MIGRATION_COUNTER]: counter
        };
        this.config.set(flywayMigrantCounter);
    }

    _generateLiquibaseMigration(configOptions) {
        const dbFmt = configOptions.dbMigrationFormat;
        const counter = configOptions[constants.KEY_LIQUIBASE_MIGRATION_COUNTER] + 1;
        const scriptTemplate = configOptions.doesNotSupportDatabaseSequences ?
            `01-new_table_no_seq.${dbFmt}` : `01-new_table_with_seq.${dbFmt}`;
        this.fs.copyTpl(
            this.templatePath('app/src/main/resources/db/migration/liquibase/changelog/'+scriptTemplate),
            this.destinationPath('src/main/resources/db/changelog/migration/0'+counter+'-create_'+configOptions.tableName+'_table.'+dbFmt),
            configOptions
        );
        const liquibaseMigrantCounter = {
            [constants.KEY_LIQUIBASE_MIGRATION_COUNTER]: counter
        };
        //const updatedConfig = Object.assign({}, this.config.getAll(), liquibaseMigrantCounter);
        this.config.set(liquibaseMigrantCounter);
    }
};
