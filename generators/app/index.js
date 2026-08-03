import BaseGenerator from '../base-generator.js';

export default class extends BaseGenerator {

    constructor(args, opts) {
        super(args, opts);
        this.configOptions = this.options.configOptions || {};
    }

    default() {
        this.composeWith(new URL('../server/index.js', import.meta.url).pathname, {
            configOptions: this.configOptions
        });
    }

};
