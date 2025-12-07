// __bin/gen-conf/config-generator.ts

import type { Paths } from './paths.class';

import { Yaml } from './yaml.class';
import { Merger } from './merger.class';
import { VariableTable } from './variables-table.class';
import { ConfigResolver } from './variable-solver.class';
import { ConfigEmitter } from './config-emit.class';

export class ConfigGenerator {
    private readonly loader: Yaml;
    private readonly merger: Merger;
    private readonly emitter: ConfigEmitter;

    constructor(private readonly paths: Paths) {
        this.loader = new Yaml(paths);
        this.merger = new Merger();
        this.emitter = new ConfigEmitter(paths);
    }

    run() {
        console.log('📄 Loading default config...');
        const defaults = this.loader.loadDefaults();

        console.log('🔧 Merging per-key overrides...');
        const merged = this.merger.mergeTopLevel(defaults, (key: string) =>
            this.loader.loadOverride(key)
        );

        console.log('📌 Collecting variables from merged config...');
        const varTable = new VariableTable();
        varTable.collectFromConfig(merged);
        const resolvedVars = varTable.resolveAll();

        console.log('🔄 Applying variables and stripping variable definitions...');
        const resolver = new ConfigResolver(resolvedVars);
        const finalConfig = resolver.resolveConfig(merged);

        console.log('📝 Emitting TypeScript config files...');
        this.emitter.emitAll(finalConfig);
    }
}
