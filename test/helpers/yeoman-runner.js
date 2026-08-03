import path from 'path';
import { YeomanTest } from 'yeoman-test';
import fse from 'fs-extra';

export async function runServerGenerator({
    generatorPath,
    prompts,
    options = { formatCode: false },
    setup
}) {
    const helpers = new YeomanTest();
    helpers.importMeta = import.meta;
    let run = helpers.run(generatorPath);
    if (setup) {
        run = setup(run);
    }
    await run.withPrompts(prompts).withOptions(options).run();
}

export async function runControllerGenerator({
    generatorPath,
    templateDir,
    entityName = 'Customer',
    basePath = '/api/customers',
    formatCode = false,
    configOverride = {}
}) {
    const helpers = new YeomanTest();
    helpers.importMeta = import.meta;
    await helpers
        .run(generatorPath)
        .inTmpDir(dir => {
            fse.copySync(templateDir, dir);
            if (Object.keys(configOverride).length > 0) {
                const configPath = path.join(dir, '.yo-rc.json');
                const currentConfig = fse.readJsonSync(configPath);
                currentConfig['generator-springboot'] = {
                    ...currentConfig['generator-springboot'],
                    ...configOverride
                };
                fse.writeJsonSync(configPath, currentConfig, { spaces: 2 });
            }
        })
        .withArguments([entityName])
        .withOptions({ 'base-path': basePath, formatCode })
        .run();
}
